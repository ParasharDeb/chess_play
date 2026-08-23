FROM python:3.11-slim

WORKDIR /app

COPY ML_models/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ML_models/model_api.py .
COPY ML_models/chess_cnn.pth .

ENV PYTHONUNBUFFERED=1

CMD ["sh", "-c", "uvicorn model_api:app --host 0.0.0.0 --port ${PORT:-8000}"]