import { create } from 'zustand';

export type Office = {
  id: string;
  name: string;
  type: 'Primary' | 'Secondary';
  regionId: string;
  coordinates: { lat: number; lng: number };
  address?: { line1?: string; city?: string; country?: string };
  metadata?: { employees?: number; established?: number; sqft?: number };
  cameraUrl?: string; // Foscam camera stream URL
};

type AppState = {
  offices: Office[];
  selectedOffice: Office | null;
  liveFeedOffice: Office | null;
  setOffices: (o: Office[]) => void;
  selectOffice: (o: Office | null) => void;
  openLiveFeed: (office: Office | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  offices: [],
  selectedOffice: null,
  liveFeedOffice: null,
  setOffices: (offices) => set({ offices }),
  selectOffice: (selectedOffice) => set({ selectedOffice }),
  openLiveFeed: (office) => set({ liveFeedOffice: office })
}));


