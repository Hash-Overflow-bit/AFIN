import { api } from '../api';

export interface Order {
  id: string;
  orderNumber: string;
  investorId: string;
  bondId: string;
  requestedAmount: string | number;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  bond?: {
    name: string;
    couponRate: string | number;
    maturityDate: string;
    currency: string;
  };
  investor?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const ordersApi = {
  // Investor Actions
  createOrder: async (data: { bondId: string; requestedAmount: number }) => {
    const res = await api.post('/orders', data);
    return res.data;
  },
  
  getMyOrders: async () => {
    const res = await api.get('/orders/my-orders');
    return res.data;
  },

  cancelOrder: async (id: string) => {
    const res = await api.patch(`/orders/${id}/cancel`);
    return res.data;
  },

  // Broker Actions
  getAllOrders: async (params?: { status?: string; bondId?: string }) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  approveOrder: async (id: string) => {
    const res = await api.patch(`/orders/${id}/approve`);
    return res.data;
  },

  rejectOrder: async (id: string, reason: string) => {
    const res = await api.patch(`/orders/${id}/reject`, { reason });
    return res.data;
  }
};
