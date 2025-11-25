import React, { useState } from 'react';
import { ClubStats, Member, PaymentItem, PaymentFrequency, Transaction, Club } from './types';
import Dashboard from './components/Dashboard';
import MemberView from './components/MemberView';
import ClubSelector from './components/ClubSelector';
import { ArrowRight, ShieldCheck, CreditCard, Users, X, Mail, User as UserIcon } from 'lucide-react';

// Mock Data for specific clubs
const INITIAL_CLUBS: Club[] = [
  {
    id: 'c1',
    name: 'Youth Alive Ghana',
    description: 'Empowering youth through education, skills training, and community engagement initiatives across Ghana.',
    logoColor: 'bg-orange-600',
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

const MOCK_MEMBERS: Member[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active', joinedDate: '2023-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'Overdue', joinedDate: '2023-02-20' },
  { id: '3', name: 'Robert Johnson', email: 'rob@example.com', status: 'Active', joinedDate: '2023-03-10' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', status: 'Pending', joinedDate: '2023-11-05' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2023-10-01', amount: 10.00, description: 'Monthly Dues', status: 'Success', memberId: '1' },
  { id: 't2', date: '2023-09-01', amount: 10.00, description: 'Monthly Dues', status: 'Success', memberId: '1' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'club-selection' | 'admin' | 'member'>('landing');
  const [clubs, setClubs] = useState<Club[]>(INITIAL_CLUBS);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
  
  // Auth state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authData, setAuthData] = useState({ name: '', email: '' });

  // Get current active club data
  const activeClub = clubs.find(c => c.id === selectedClubId);

  const handleRoleSelect = (role: 'admin' | 'member') => {
    if (!authData.name) {
      setIsAuthModalOpen(true);
      return;
    }
    setUserRole(role);
    setCurrentView('club-selection');
  };

  const handleClubSelect = (clubId: string) => {
    setSelectedClubId(clubId);
    if (userRole === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('member');
    }
  };

  // Payment Handlers (Update specific club state)
  const handleAddPayment = (newItem: Omit<PaymentItem, 'id'>) => {
    if (!selectedClubId) return;
    const itemWithId = { ...newItem, id: Math.random().toString(36).substr(2, 9) };
    
    setClubs(prevClubs => prevClubs.map(club => {
      if (club.id === selectedClubId) {
        return { ...club, paymentItems: [...club.paymentItems, itemWithId] };
      }
      return club;
    }));
  };

  const handleUpdatePayment = (updatedItem: PaymentItem) => {
    if (!selectedClubId) return;
    
    setClubs(prevClubs => prevClubs.map(club => {
      if (club.id === selectedClubId) {
        return { 
          ...club, 
          paymentItems: club.paymentItems.map(item => item.id === updatedItem.id ? updatedItem : item) 
        };
      }
      return club;
    }));
  };

  const handleDeletePayment = (id: string) => {
    if (!selectedClubId) return;
    
    setClubs(prevClubs => prevClubs.map(club => {
      if (club.id === selectedClubId) {
        return { 
          ...club, 
          paymentItems: club.paymentItems.filter(item => item.id !== id) 
        };
      }
      return club;
    }));
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthModalOpen(false);
    // After "Sign In", scroll to role selection or hint
    const section = document.getElementById('role-selection');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  // View Routing
  if (currentView === 'club-selection' && userRole) {
    return (
      <ClubSelector 
        clubs={clubs}
        onSelectClub={handleClubSelect}
        userRole={userRole}
        userName={authData.name || 'User'}
        onBack={() => setCurrentView('landing')}
      />
    );
  }

  if (currentView === 'admin' && activeClub) {
    return (
      <Dashboard 
        clubName={activeClub.name}
        clubLogoColor={activeClub.logoColor}
        stats={activeClub.stats} 
        members={MOCK_MEMBERS} 
        paymentItems={activeClub.paymentItems} 
        onLogout={() => {
          setCurrentView('landing');
          setSelectedClubId(null);
          setUserRole(null);
        }}
        onSwitchClub={() => setCurrentView('club-selection')}
        onAddPayment={handleAddPayment}
        onUpdatePayment={handleUpdatePayment}
        onDeletePayment={handleDeletePayment}
      />
    );
  }

  if (currentView === 'member' && activeClub) {
    return (
      <MemberView 
        currentUser={{ name: authData.name || 'Member', email: authData.email || 'member@example.com' }} 
        clubName={activeClub.name}
        clubLogoColor={activeClub.logoColor}
        duePayments={activeClub.paymentItems}
        transactions={MOCK_TRANSACTIONS}
        onBack={() => {
           setCurrentView('club-selection'); // Go back to club list
        }}
        onSwitchClub={() => setCurrentView('club-selection')}
      />
    );
  }

  // Landing Page / Role Selection
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
           <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-indigo-200 shadow-lg">T</div>
           <span className="text-2xl font-bold text-slate-900 tracking-tight">TitiMe</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-indigo-600">Features</a>
          <a href="#" className="hover:text-indigo-600">Pricing</a>
          <a href="#" className="hover:text-indigo-600">About</a>
        </div>
        <button 
          onClick={() => setIsAuthModalOpen(true)}
          className="px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          {authData.name ? `Hi, ${authData.name.split(' ')[0]}` : 'Sign In'}
        </button>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center space-y-12">
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
             <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
               Club payments <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">made automatic.</span>
             </h1>
             <p className="text-xl text-slate-500 max-w-2xl mx-auto">
               The easiest way for societies and groups to collect dues, manage members, and track finances. No more spreadsheets.
             </p>
             <div className="pt-4">
               {!authData.name && (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-full text-base font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-200"
                >
                  Get Started
                </button>
               )}
             </div>
           </div>

           <div id="role-selection" className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
              
              {/* Admin Card */}
              <button 
                onClick={() => handleRoleSelect('admin')}
                className="group relative bg-white p-8 rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl hover:border-indigo-100 transition-all text-left overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-3 bg-indigo-50 rounded-bl-2xl">
                    <ShieldCheck className="h-6 w-6 text-indigo-600" />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 mb-2">For Executives</h3>
                 <p className="text-slate-500 mb-6">Create your club page, set dues, and monitor revenue with AI insights.</p>
                 <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                    Admin Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                 </div>
              </button>

              {/* Member Card */}
              <button 
                onClick={() => handleRoleSelect('member')}
                className="group relative bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl hover:shadow-2xl hover:ring-2 hover:ring-slate-700 transition-all text-left overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-3 bg-slate-800 rounded-bl-2xl">
                    <CreditCard className="h-6 w-6 text-emerald-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">For Members</h3>
                 <p className="text-slate-400 mb-6">Join clubs, add payment methods, and automate your contributions.</p>
                 <div className="flex items-center text-emerald-400 font-semibold group-hover:gap-2 transition-all">
                    Select a Club <ArrowRight className="h-4 w-4 ml-2" />
                 </div>
              </button>
           </div>
           
           <div className="pt-10 flex justify-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">Unlimited Members</span>
              </div>
           </div>
        </div>
      </main>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200 relative">
              <button 
                 onClick={() => setIsAuthModalOpen(false)}
                 className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="text-center mb-8">
                 <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                    <Users className="h-6 w-6" />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900">Welcome to TitiMe</h2>
                 <p className="text-slate-500 mt-2">Enter your details to create an account or sign in.</p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-1">
                   <label className="text-xs font-semibold uppercase text-slate-500">Full Name</label>
                   <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        value={authData.name}
                        onChange={(e) => setAuthData({...authData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
                        placeholder="John Doe"
                      />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-semibold uppercase text-slate-500">Email Address</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        required
                        type="email" 
                        value={authData.email}
                        onChange={(e) => setAuthData({...authData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
                        placeholder="john@example.com"
                      />
                   </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors mt-2"
                >
                  Continue
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;