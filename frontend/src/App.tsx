
import {
  Routes,
  Route,
} from "react-router-dom";
import GamePage from "../pages/game"
import LandingPage from "../pages/Landingpage"
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/game" element={<GamePage/>}/>
    </Routes>
  );
}