import { api } from '../api';

export interface Bond {
  id: string;
  name: string;
  issuer: string;
  isin: string;
  country: string;
  currency: string;
  couponRate: number;
  yieldRate?: number;
  couponFrequency: string;
  faceValue: number;
  minInvestment: number;
  totalIssuance?: number;
  issueDate: string;
  maturityDate: string;
  status: string;
}

export const bondsApi = {
  getBonds: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const { data } = await api.get('/bonds', { params });
    return data;
  },
  
  getBondById: async (id: string) => {
    const { data } = await api.get(`/bonds/${id}`);
    return data;
  },
  
  createBond: async (bondData: Partial<Bond>) => {
    const { data } = await api.post('/bonds', bondData);
    return data;
  },
  
  publishBond: async (id: string) => {
    const { data } = await api.patch(`/bonds/${id}/publish`);
    return data;
  },
  
  closeBond: async (id: string) => {
    const { data } = await api.patch(`/bonds/${id}/close`);
    return data;
  }
};
