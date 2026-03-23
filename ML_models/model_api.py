from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn as nn
import chess
import numpy as np
from typing import Optional

# Initialize FastAPI app
app = FastAPI(title="Chess Move Predictor API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the CNN model architecture (same as training - using nn.Sequential directly)
model = nn.Sequential(
    nn.Conv2d(12, 64, 3, padding=1),
    nn.ReLU(),
    nn.Conv2d(64, 128, 3, padding=1),
    nn.ReLU(),
    nn.Conv2d(128, 128, 3, padding=1),
    nn.ReLU(),
    nn.Flatten(),
    nn.Linear(128 * 8 * 8, 1024),
    nn.ReLU(),
    nn.Linear(1024, 4096)
)

# Load model at startup
try:
    model.load_state_dict(torch.load("chess_cnn.pth", map_location=torch.device('cpu')))
    model.eval()
    print("✓ Model loaded successfully!")
except FileNotFoundError:
    print("✗ Error: chess_cnn.pth not found. Please ensure the model file is in the same directory.")
    model = None
except Exception as e:
    print(f"✗ Warning: Could not load model - {e}")
    print("  Make sure the model architecture matches the saved model.")
    model = None

# Pydantic models for request/response
class MoveRequest(BaseModel):
    fen: str  # FEN notation of the board position
    
class MoveResponse(BaseModel):
    best_move: str
    uci_move: str
    confidence: Optional[float] = None
    legal_moves_count: int

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool

# HELPER FUNCTIONS
def board_to_tensor(board: chess.Board) -> torch.Tensor:
    # convert chess.Board to model input tensor
    PIECE_TO_PLANE = {
        'P': 0, 'N': 1, 'B': 2, 'R': 3, 'Q': 4, 'K': 5,
        'p': 6, 'n': 7, 'b': 8, 'r': 9, 'q': 10, 'k': 11
    }
    
    tensor = np.zeros((8, 8, 12), dtype=np.float32)
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:
            row = 7 - chess.square_rank(square)
            col = chess.square_file(square)
            plane = PIECE_TO_PLANE[piece.symbol()]
            tensor[row, col, plane] = 1
    
    # Convert to torch tensor and add batch dimension
    tensor = torch.tensor(tensor).permute(2, 0, 1).unsqueeze(0)  # (1, 12, 8, 8)
    return tensor

def move_to_index(move: chess.Move) -> int:
    from_sq = move.from_square
    to_sq = move.to_square
    return from_sq * 64 + to_sq

def predict_best_move(board: chess.Board, model: nn.Module) -> tuple:
    # Get legal moves
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return None, 0.0
    
    # Convert board to tensor
    x = board_to_tensor(board)
    
    # Get model predictions
    with torch.no_grad():
        logits = model(x).squeeze(0)  # (4096,)
    
    # Create mask for legal moves only
    legal_indices = [move_to_index(move) for move in legal_moves]
    mask = torch.full_like(logits, float('-inf'))
    mask[legal_indices] = 0
    
    # Apply mask and get best move
    masked_logits = logits + mask
    probabilities = torch.softmax(masked_logits, dim=0)
    best_index = masked_logits.argmax().item()
    confidence = probabilities[best_index].item()
    
    # Find corresponding legal move
    for move in legal_moves:
        if move_to_index(move) == best_index:
            return move, confidence
    
    # Fallback: return highest probability legal move
    return legal_moves[0], 0.0

# API Endpoints
@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "model_loaded": model is not None
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy" if model is not None else "model_not_loaded",
        "model_loaded": model is not None
    }

@app.post("/predict", response_model=MoveResponse)
async def predict_move(request: MoveRequest):
    """
    Predict the best chess move for a given board position.
    
    Args:
        request: MoveRequest containing FEN notation of the board
        
    Returns:
        MoveResponse with the best move and metadata
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Parse FEN to board
        board = chess.Board(request.fen)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid FEN notation: {str(e)}")
    
    # Check if game is over
    if board.is_game_over():
        raise HTTPException(status_code=400, detail="Game is already over")
    
    # Predict best move
    try:
        best_move, confidence = predict_best_move(board, model)
        
        if best_move is None:
            raise HTTPException(status_code=400, detail="No legal moves available")
        
        return {
            "best_move": board.san(best_move),  # Standard algebraic notation
            "uci_move": best_move.uci(),  # UCI notation
            "confidence": confidence,
            "legal_moves_count": len(list(board.legal_moves))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/legal-moves")
async def get_legal_moves(fen: str):
    """Get all legal moves for a given position"""
    try:
        board = chess.Board(fen)
        legal_moves = list(board.legal_moves)
        
        return {
            "fen": fen,
            "legal_moves": [move.uci() for move in legal_moves],
            "count": len(legal_moves)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid FEN notation: {str(e)}")

    # module approach to avoid import issues
if __name__ == "__main__":
    import subprocess
    import sys
    import os
    
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    subprocess.run([
        sys.executable, "-m", "uvicorn", "model_api:app",
        "--reload", "--host", "0.0.0.0", "--port", "8000"
    ])
