import { create } from 'zustand';

export type Office = {
  id: string;
  name: string;
  type: 'Primary' | 'Secondary';
  regionId: string;
  coordinates: { lat: number; lng: number };
  address?: { line1?: string; city?: string; country?: string };
  metadata?: { employees?: number; established?: number; sqft?: number };
};

type AppState = {
  offices: Office[];
  selectedOffice: Office | null;
  setOffices: (o: Office[]) => void;
  selectOffice: (o: Office | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  offices: [],
  selectedOffice: null,
  setOffices: (offices) => set({ offices }),
  selectOffice: (selectedOffice) => set({ selectedOffice })
}));


