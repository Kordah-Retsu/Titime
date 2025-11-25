
import { Club, User, PaymentFrequency, Member } from '../types';

const KEYS = {
  USERS: 'titime_users',
  CLUBS: 'titime_clubs',
  MEMBERS: 'titime_members', // Mock members per club would ideally be relational, but storing flat for demo
  CURRENT_USER_ID: 'titime_current_user_id'
};

// Initial Data Seeding
const INITIAL_CLUBS: Club[] = [
  {
    id: 'c1',
    name: 'Youth Alive Ghana',
    description: 'Empowering youth through education, skills training, and community engagement initiatives across Ghana.',
    logoColor: 'bg-orange-600',
    adminIds: ['admin-user'], // Demo admin has access
    stats: {
      totalMembers: 124,
      totalRevenue: 4500,
      pendingDues: 230,
      activeSubscriptions: 110
    },
    paymentItems: [
       { id: 'p1', title: 'Monthly Dues', amount: 10, frequency: PaymentFrequency.MONTHLY, isCompulsory: true, description: 'Standard monthly membership contribution.' },
       { id: 'p2', title: 'Project Fund', amount: 50, frequency: PaymentFrequency.ONE_TIME, isCompulsory: false, allowCustomAmount: true, description: 'Contribution towards the annual community project. You can choose to pay more.' }
    ]
  },
  {
    id: 'c2',
    name: 'HIECH Foundation',
    description: 'Health, Innovation, and Education for Children. Dedicated to improving child welfare through sustainable programs.',
    logoColor: 'bg-blue-600',
    adminIds: ['admin-user'],
    stats: {
      totalMembers: 85,
      totalRevenue: 3200,
      pendingDues: 150,
      activeSubscriptions: 78
    },
    paymentItems: [
       { id: 'p3', title: 'Monthly Dues', amount: 10, frequency: PaymentFrequency.MONTHLY, isCompulsory: true, description: 'Monthly foundation support dues.' },
       { id: 'p4', title: 'Weekly Support', amount: 5, frequency: PaymentFrequency.WEEKLY, isCompulsory: false, description: 'Weekly voluntary donation for ongoing ops.' }
    ]
  }
];

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phoneNumber: '0244123456', status: 'Active', joinedDate: '2023-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phoneNumber: '0555987654', status: 'Overdue', joinedDate: '2023-02-20' },
  { id: '3', name: 'Robert Johnson', email: 'rob@example.com', phoneNumber: '0200112233', status: 'Active', joinedDate: '2023-03-10' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', phoneNumber: '0266445566', status: 'Pending', joinedDate: '2023-11-05' },
];

export const storage = {
  getUsers: (): User[] => {
    try {
      const stored = localStorage.getItem(KEYS.USERS);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  saveUser: (user: User) => {
    const users = storage.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser: (): User | null => {
    const id = localStorage.getItem(KEYS.CURRENT_USER_ID);
    if (!id) return null;
    return storage.getUsers().find(u => u.id === id) || null;
  },

  setCurrentUser: (userId: string | null) => {
    if (userId) {
      localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER_ID);
    }
  },

  getClubs: (): Club[] => {
    try {
      const stored = localStorage.getItem(KEYS.CLUBS);
      if (stored) return JSON.parse(stored);
      // Seed if empty
      localStorage.setItem(KEYS.CLUBS, JSON.stringify(INITIAL_CLUBS));
      return INITIAL_CLUBS;
    } catch { return INITIAL_CLUBS; }
  },

  saveClubs: (clubs: Club[]) => {
    localStorage.setItem(KEYS.CLUBS, JSON.stringify(clubs));
  },
  
  deleteClub: (clubId: string) => {
    const clubs = storage.getClubs();
    const updatedClubs = clubs.filter(c => c.id !== clubId);
    storage.saveClubs(updatedClubs);
  },

  getMembers: (): Member[] => {
    try {
      const stored = localStorage.getItem(KEYS.MEMBERS);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    } catch { return INITIAL_MEMBERS; }
  },

  saveMembers: (members: Member[]) => {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
  },

  // Helper to create a user if not exists
  findOrCreateUser: (identifier: string, type: 'email' | 'phone', name?: string): User => {
    const users = storage.getUsers();
    let user = users.find(u => type === 'email' ? u.email === identifier : u.phoneNumber === identifier);
    
    if (!user) {
      user = {
        id: Math.random().toString(36).substr(2, 9),
        name: name || (type === 'email' ? identifier.split('@')[0] : `User ${identifier.slice(-4)}`),
        [type === 'email' ? 'email' : 'phoneNumber']: identifier,
        authMethod: type,
        joinedClubs: [],
        paymentMethods: [],
        subscriptions: {},
        customAmounts: {}
      };
      
      // If this is the specific demo admin email
      if (identifier === 'admin@titime.com' || identifier === '0550000000') {
         user.id = 'admin-user'; // Hardcoded ID to match seeded clubs
         user.name = 'Demo Admin';
      }

      users.push(user);
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
    return user;
  }
};
