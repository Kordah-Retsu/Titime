export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST'
}

export enum PaymentFrequency {
  ONE_TIME = 'One Time',
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly'
}

export enum PaymentMethodType {
  CARD = 'Card',
  MOBILE_MONEY = 'Mobile Money'
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  provider: string; // e.g., 'Visa', 'MTN', 'Telecel'
  
  // Card Details
  last4?: string;
  expiryDate?: string;
  cardHolder?: string;

  // Mobile Money Details
  phoneNumber?: string;
  network?: string;
}

export interface PaymentItem {
  id: string;
  title: string;
  amount: number;
  frequency: PaymentFrequency;
  isCompulsory: boolean;
  allowCustomAmount?: boolean;
  description: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Pending' | 'Overdue';
  joinedDate: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'Success' | 'Failed' | 'Pending';
  memberId: string;
}

export interface ClubStats {
  totalMembers: number;
  totalRevenue: number;
  pendingDues: number;
  activeSubscriptions: number;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logoColor: string;
  paymentItems: PaymentItem[];
  stats: ClubStats;
}