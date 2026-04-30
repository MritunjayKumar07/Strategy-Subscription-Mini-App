import { create } from 'zustand';
import { Strategy, RiskFilter } from '../types';
import { api } from '../api/api';
import axios from 'axios';

interface AppState {
  strategies: Strategy[];
  isLoading: boolean;
  error: string | null;
  riskFilter: RiskFilter;
  
  setRiskFilter: (filter: RiskFilter) => void;
  fetchStrategies: () => Promise<void>;
  subscribeToStrategy: (strategyId: number, capital: number) => Promise<{ success: boolean; message: string }>;
}

export const useStore = create<AppState>((set, get) => ({
  strategies: [],
  isLoading: false,
  error: null,
  riskFilter: 'All',

  setRiskFilter: (filter: RiskFilter) => set({ riskFilter: filter }),

  fetchStrategies: async () => {
    set({ isLoading: true, error: null });
    try {
      const { riskFilter } = get();
      const params = riskFilter !== 'All' ? { riskLevel: riskFilter } : {};
      
      const response = await api.get<Strategy[]>('/strategies', { params });
      set({ strategies: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.Error || error.message || 'Failed to fetch strategies', 
        isLoading: false 
      });
    }
  },

  subscribeToStrategy: async (strategyId: number, capital: number) => {
    try {
      const response = await api.post('/users/1/subscriptions', {
        strategyId,
        allocatedCapital: capital,
      });
      return { success: true, message: response.data.Message || 'Successfully subscribed!' };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.Error || error.message || 'Subscription failed'
      };
    }
  }
}));
