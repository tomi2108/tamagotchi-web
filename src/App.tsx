import { BrowserRouter, Route, Routes } from "react-router-dom";
import Toolbar from "./components/Toolbar";
import PlayerGate from "./components/PlayerGate";
import PetPage from "./pages/PetPage";
import InventoryPage from "./pages/InventoryPage";
import ShopPage from "./pages/ShopPage";
import CemeteryPage from "./pages/CemeteryPage";
import GardenPage from "./pages/GardenPage";
import MissionsPage from "./pages/MissionsPage";
import GamesPage from "./pages/GamePage";
import MessagesPage from "./pages/MessagePage";
import MemoryGamePage from "./pages/MemoryGamePage";
import ReactionGamePage from "./pages/ReactionGamePage";
import NonogramGamePage from "./pages/NonogramGamePage";
import SudokuGamePage from "./pages/SudokuGamePage";
import { PlayerProvider } from "./components/PlayerContext";
import CaregiverPage from "./pages/CareGiverPage";
import { PetProvider } from "./components/PetContext";
import RockPaperScissorsPage from "./pages/RockPaperScissorsPage";
import PetGate from "./components/PetGate";

export default function App() {
  return (
    <PlayerProvider>
      <PetProvider>
        <BrowserRouter>
          <PlayerGate>
            <PetGate>
              <div className="dark flex min-h-screen bg-background text-foreground">
                <Toolbar />
                <main className="min-w-0 flex-1 px-4 pb-28 pt-20 md:p-6">
                  <Routes>
                    <Route path="/" element={<PetPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/cemetery" element={<CemeteryPage />} />
                    <Route path="/garden" element={<GardenPage />} />
                    <Route path="/missions" element={<MissionsPage />} />
                    <Route path="/caregiver" element={<CaregiverPage />} />
                    <Route path="/games" element={<GamesPage />} />
                    <Route path="/games/memory" element={<MemoryGamePage />} />
                    <Route
                      path="/games/nonogram"
                      element={<NonogramGamePage />}
                    />
                    <Route
                      path="/games/reaction"
                      element={<ReactionGamePage />}
                    />
                    <Route
                      path="/games/rps"
                      element={<RockPaperScissorsPage />}
                    />
                    <Route path="/games/sudoku" element={<SudokuGamePage />} />
                  </Routes>
                </main>
              </div>
            </PetGate>
          </PlayerGate>
        </BrowserRouter>
      </PetProvider>
    </PlayerProvider>
  );
}
