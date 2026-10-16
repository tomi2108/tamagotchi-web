import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getPetState, type PetState } from "@/api/state";

type PetContextValue = {
  pet: PetState | null;
  loading: boolean;
  error: string | null;
  loadPet: () => Promise<void>;
  setPetError: (error: string | null) => void;
};

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const [pet, setPet] = useState<PetState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPet = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setPet(await getPetState());
    } catch {
      setError("No se pudo cargar tu mascota. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  return (
    <PetContext.Provider
      value={{
        pet,
        loading,
        error,
        loadPet,
        setPetError: setError,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const context = useContext(PetContext);

  if (!context) {
    throw new Error("usePet must be used within PetProvider");
  }

  return context;
}
