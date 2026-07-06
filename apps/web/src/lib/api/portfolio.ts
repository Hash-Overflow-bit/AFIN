import { api } from '../api';
import { Bond } from './bonds';

export interface PortfolioSummary {
  totalInvested: number;
  totalUnitsHeld: number;
  averageYield: number;
  holdingsCount: number;
}

export interface PortfolioHolding {
  id: string;
  bondId: string;
  orderId: string;
  faceValueHeld: number;
  purchasePrice: number;
  unitsHeld: number;
  status: string;
  acquiredAt: string;
  bond: Bond;
}

export interface CouponPayment {
  id: string;
  paymentDate: string;
  amount: number;
  status: string;
  paidAt?: string;
  bond: Bond;
}

export interface ActivityLog {
  id: string;
  action: string;
  createdAt: string;
}

export const portfolioApi = {
  getSummary: async (): Promise<PortfolioSummary> => {
    const { data } = await api.get('/portfolio/summary');
    return data;
  },
  getHoldings: async (): Promise<PortfolioHolding[]> => {
    const { data } = await api.get('/portfolio/holdings');
    return data;
  },
  getCoupons: async (): Promise<CouponPayment[]> => {
    const { data } = await api.get('/portfolio/coupons');
    return data;
  },
  getHistory: async (): Promise<ActivityLog[]> => {
    const { data } = await api.get('/portfolio/history');
    return data;
  }
};
