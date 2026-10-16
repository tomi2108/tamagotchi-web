import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Player } from "@/api/players";

type PlayerContextValue = {
  player: Player | null;
  selectPlayer: (player: Player) => void;
  changePlayer: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);

  const selectPlayer = useCallback((selected: Player) => {
    localStorage.setItem("playerId", String(selected.id));
    setPlayer(selected);
  }, []);

  const changePlayer = useCallback(() => {
    localStorage.removeItem("playerId");
    setPlayer(null);
  }, []);

  return (
    <PlayerContext.Provider value={{ player, selectPlayer, changePlayer }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }

  return context;
}
