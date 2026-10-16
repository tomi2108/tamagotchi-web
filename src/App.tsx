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
import DodgeGamePage from "./pages/DodgeGamePage";
import { PlayerProvider } from "./components/PlayerContext";

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <PlayerGate>
          <div className="dark flex min-h-screen bg-background text-foreground">
            <Toolbar />
            <main className="min-w-0 flex-1 px-4 pb-6 pt-20 md:p-6">
              <Routes>
                <Route path="/" element={<PetPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/cemetery" element={<CemeteryPage />} />
                <Route path="/garden" element={<GardenPage />} />
                <Route path="/missions" element={<MissionsPage />} />
                <Route path="/games" element={<GamesPage />} />
                <Route path="/games/memory" element={<MemoryGamePage />} />
                <Route path="/games/reaction" element={<ReactionGamePage />} />
                <Route path="/games/dodge" element={<DodgeGamePage />} />
              </Routes>
            </main>
          </div>
        </PlayerGate>
      </BrowserRouter>
    </PlayerProvider>
  );
}
