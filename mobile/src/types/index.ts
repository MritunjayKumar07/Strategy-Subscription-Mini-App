export interface Strategy {
  id: number;
  name: string;
  category: string;
  riskLevel: string;
  returnPercentage: number;
  minCapital: number;
}

export interface Subscription {
  id: number;
  userId: number;
  strategy: Strategy;
  allocatedCapital: number;
  status: string;
  createdAt: string;
}

export interface CreateSubscriptionRequest {
  strategyId: number;
  allocatedCapital: number;
}

export type RiskFilter = 'All' | 'Low' | 'Medium' | 'High';
