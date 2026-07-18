import { create } from "zustand";

interface GenieUiState {
  pendingQuery: string | null;
  shouldPlayEntrance: boolean;
  genieButtonActive: boolean;
  setPendingQuery: (query: string | null) => void;
  setShouldPlayEntrance: (value: boolean) => void;
  setGenieButtonActive: (value: boolean) => void;
  openGenie: (query?: string) => void;
  clearEntrance: () => void;
}

export const useGenieUiStore = create<GenieUiState>((set) => ({
  pendingQuery: null,
  shouldPlayEntrance: false,
  genieButtonActive: false,
  setPendingQuery: (query) => set({ pendingQuery: query }),
  setShouldPlayEntrance: (value) => set({ shouldPlayEntrance: value }),
  setGenieButtonActive: (value) => set({ genieButtonActive: value }),
  openGenie: (query) =>
    set({
      shouldPlayEntrance: true,
      pendingQuery: query?.trim() ? query.trim() : null,
    }),
  clearEntrance: () => set({ shouldPlayEntrance: false }),
}));
