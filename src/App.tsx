import { BrowserRouter, Route, Routes } from "react-router-dom";
import Toolbar from "./components/Toolbar";
import PetPage from "./pages/PetPage";
import InventoryPage from "./pages/InventoryPage";
import ShopPage from "./pages/ShopPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="dark flex min-h-screen bg-background text-foreground">
        <Toolbar />

        <main className="min-w-0 flex-1 p-6">
          <Routes>
            <Route path="/" element={<PetPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/shop" element={<ShopPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
