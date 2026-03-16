// import { useState } from "react";
// import { useSocketMessage } from "@/context/socketProvider";
// import MoveHistory from "./moveHistory";

// export default function MoveHistoryContainer({move}:{move:string[]}) {
//   const [moves, setMoves] = useState<string[]>([]);

//   useSocketMessage("move_history", (message: any) => {
//     setMoves(message.history);
//   });

//   return <MoveHistory moves={moves} />;
// }
