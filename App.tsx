
import React, { useState, useEffect } from 'react';
import { ClubStats, Member, PaymentItem, Transaction, Club, User } from './types';
import Dashboard from './components/Dashboard';
import MemberView from './components/MemberView';
import ClubSelector from './components/ClubSelector';
import { ArrowRight, ShieldCheck, CreditCard, Users, X, Mail, User as UserIcon, Phone, Loader2, Play, ArrowLeft } from 'lucide-react';
import { storage } from './services/storage';

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2023-10-01', amount: 10.00, description: 'Monthly Dues', status: 'Success', memberId: '1' },
  { id: 't2', date: '2023-09-01', amount: 10.00, description: 'Monthly Dues', status: 'Success', memberId: '1' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'role-selection' | 'club-selection' | 'admin' | 'member'>('landing');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  
  // Auth state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState<'method' | 'phone-input' | 'phone-verify' | 'email-input'>('method');
  const [authInput, setAuthInput] = useState('');
  const [otp, setOtp] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [intendedRole, setIntendedRole] = useState<'admin' | 'member'>('member');

  // Load Initial Data
  useEffect(() => {
    const loadedClubs = storage.getClubs();
    setClubs(loadedClubs);
    
    const loadedMembers = storage.getMembers();
    setMembers(loadedMembers);

    const user = storage.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setCurrentView('club-selection');
    }
  }, []);

  // Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    storage.setCurrentUser(user.id);
    
    // CRITICAL FIX: Refresh clubs from storage. 
    // The login process (in storage.ts) might have updated the club.adminIds to include this new admin user.
    // We need to fetch those changes so the UI reflects the permissions immediately.
    const updatedClubs = storage.getClubs();
    setClubs(updatedClubs);

    setIsAuthModalOpen(false);
    setCurrentView('club-selection');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storage.setCurrentUser(null);
    setCurrentView('landing');
    setSelectedClubId(null);
  };

  const handleClubSelect = (clubId: string) => {
    setSelectedClubId(clubId);
    
    // Check if user is admin of this club
    const club = clubs.find(c => c.id === clubId);
    if (club && currentUser && club.adminIds.includes(currentUser.id)) {
      setCurrentView('admin');
    } else {
      setCurrentView('member');
    }
  };

  const handleCreateClub = () => {
    if (!currentUser) return;
    
    const newClub: Club = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${currentUser.name}'s Club`,
      description: 'A new community group.',
      logoColor: 'bg-indigo-600',
      adminIds: [currentUser.id],
      stats: { totalMembers: 1, totalRevenue: 0, pendingDues: 0, activeSubscriptions: 0 },
      paymentItems: []
    };

    const updatedClubs = [...clubs, newClub];
    setClubs(updatedClubs);
    storage.saveClubs(updatedClubs);
    
    setSelectedClubId(newClub.id);
    setCurrentView('admin');
  };

  // Club Management
  const handleDeleteClub = () => {
      if (!selectedClubId) return;
      storage.deleteClub(selectedClubId);
      setClubs(clubs.filter(c => c.id !== selectedClubId));
      setSelectedClubId(null);
      setCurrentView('club-selection');
  };

  // Payment Handlers
  const saveClubsState = (updatedClubs: Club[]) => {
    setClubs(updatedClubs);
    storage.saveClubs(updatedClubs);
  };

  const handleAddPayment = (newItem: Omit<PaymentItem, 'id'>) => {
    if (!selectedClubId) return;
    const itemWithId = { ...newItem, id: Math.random().toString(36).substr(2, 9) };
    
    const updatedClubs = clubs.map(club => {
      if (club.id === selectedClubId) {
        return { ...club, paymentItems: [...club.paymentItems, itemWithId] };
      }
      return club;
    });
    saveClubsState(updatedClubs);
  };

  const handleUpdatePayment = (updatedItem: PaymentItem) => {
    if (!selectedClubId) return;
    const updatedClubs = clubs.map(club => {
      if (club.id === selectedClubId) {
        return { 
          ...club, 
          paymentItems: club.paymentItems.map(item => item.id === updatedItem.id ? updatedItem : item) 
        };
      }
      return club;
    });
    saveClubsState(updatedClubs);
  };

  const handleDeletePayment = (id: string) => {
    if (!selectedClubId) return;
    const updatedClubs = clubs.map(club => {
      if (club.id === selectedClubId) {
        return { 
          ...club, 
          paymentItems: club.paymentItems.filter(item => item.id !== id) 
        };
      }
      return club;
    });
    saveClubsState(updatedClubs);
  };

  // Member Management Handlers
  const saveMembersState = (updatedMembers: Member[]) => {
      setMembers(updatedMembers);
      storage.saveMembers(updatedMembers);
  };

  const handleAddMember = (newMember: Omit<Member, 'id' | 'joinedDate'>) => {
      const member: Member = {
          ...newMember,
          id: Math.random().toString(36).substr(2, 9),
          joinedDate: new Date().toISOString().split('T')[0]
      };
      saveMembersState([...members, member]);
  };

  const handleUpdateMember = (updatedMember: Member) => {
      saveMembersState(members.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const handleDeleteMember = (id: string) => {
      saveMembersState(members.filter(m => m.id !== id));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    storage.saveUser(updatedUser);
  };

  // Auth Logic
  const initiatePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authInput.length < 9) return;
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthStep('phone-verify');
    }, 1500);
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      // Create user with the INTENDED ROLE
      const user = storage.findOrCreateUser(authInput, 'phone', undefined, intendedRole);
      handleLogin(user);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      // Create user with the INTENDED ROLE
      const user = storage.findOrCreateUser('user@gmail.com', 'email', 'Google User', intendedRole);
      handleLogin(user);
    }, 1500);
  };

  const activeClub = clubs.find(c => c.id === selectedClubId);

  // Views
  if (currentView === 'club-selection' && currentUser) {
    return (
      <ClubSelector 
        clubs={clubs}
        onSelectClub={handleClubSelect}
        userId={currentUser.id}
        userName={currentUser.name}
        onBack={() => {
            // No-op for back on root, just handled by signout
        }}
        onCreateClub={handleCreateClub}
        onSignOut={handleLogout}
      />
    );
  }

  if (currentView === 'admin' && activeClub && currentUser) {
    return (
      <Dashboard 
        clubName={activeClub.name}
        clubLogoColor={activeClub.logoColor}
        stats={activeClub.stats} 
        members={members} // Passing dynamic members
        paymentItems={activeClub.paymentItems} 
        onLogout={handleLogout}
        onSwitchClub={() => setCurrentView('club-selection')}
        onAddPayment={handleAddPayment}
        onUpdatePayment={handleUpdatePayment}
        onDeletePayment={handleDeletePayment}
        onDeleteClub={handleDeleteClub}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
      />
    );
  }

  if (currentView === 'member' && activeClub && currentUser) {
    return (
      <MemberView 
        user={currentUser}
        clubName={activeClub.name}
        clubId={activeClub.id}
        clubLogoColor={activeClub.logoColor}
        duePayments={activeClub.paymentItems}
        transactions={MOCK_TRANSACTIONS}
        onBack={() => setCurrentView('club-selection')}
        onSwitchClub={() => setCurrentView('club-selection')}
        onUpdateUser={handleUpdateUser}
        onSignOut={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors duration-200">
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
           <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-indigo-200 dark:shadow-none shadow-lg">T</div>
           <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">TitiMe</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Features</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Pricing</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">About</a>
        </div>
        <button 
          onClick={() => {
             setCurrentView('role-selection');
          }}
          className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
        >
          Sign In
        </button>
      </nav>

      {currentView === 'landing' && (
        <main className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full text-center space-y-12">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Club payments <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">made automatic.</span>
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                The easiest way for societies and groups to collect dues, manage members, and track finances in Ghana. No more spreadsheets.
                </p>
                <div className="pt-4">
                    <button 
                    onClick={() => setCurrentView('role-selection')}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-full text-base font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-200 dark:shadow-none"
                    >
                    Get Started
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 mx-auto">
                        <Phone className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Mobile First</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Login easily with your phone number and pay with MoMo.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 mx-auto">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Secure & Safe</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Enterprise-grade security for your community's funds.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4 mx-auto">
                        <Users className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Community Focused</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Built specifically for Ghanaian clubs, societies and groups.</p>
                </div>
            </div>
            </div>
        </main>
      )}

      {currentView === 'role-selection' && (
         <main className="flex-1 flex items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="max-w-xl w-full text-center space-y-8">
                 <div className="flex justify-center mb-6">
                    <button onClick={() => setCurrentView('landing')} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                    </button>
                 </div>
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How would you like to continue?</h2>
                 <p className="text-slate-500 dark:text-slate-400">Choose your role to sign in or sign up.</p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button 
                        onClick={() => {
                            setIntendedRole('member');
                            setIsAuthModalOpen(true);
                        }}
                        className="p-8 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group text-left"
                     >
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Member</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">I want to pay dues and manage my subscription to a club.</p>
                     </button>

                     <button 
                        onClick={() => {
                            setIntendedRole('admin');
                            setIsAuthModalOpen(true);
                        }}
                        className="p-8 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group text-left"
                     >
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Admin / Executive</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">I want to create a club, manage members, and track finances.</p>
                     </button>
                 </div>
             </div>
         </main>
      )}

      {/* Modern Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-200 relative overflow-hidden border border-slate-200 dark:border-slate-800">
              <button 
                 onClick={() => setIsAuthModalOpen(false)}
                 className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                     {intendedRole === 'admin' ? 'Admin Access' : 'Member Login'}
                 </h2>
                 <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                     {intendedRole === 'admin' 
                        ? 'Sign in to manage your club.' 
                        : 'Sign in to access your dues.'}
                 </p>
              </div>

              {authStep === 'method' && (
                  <div className="space-y-3">
                      <button 
                        onClick={() => { setAuthStep('phone-input'); setAuthInput(''); }}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                      >
                         <Phone className="h-5 w-5" />
                         Continue with Phone
                      </button>
                      <button 
                         onClick={handleGoogleLogin}
                         className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                         {isAuthenticating ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                             <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                             </svg>
                         )}
                         Continue with Google
                      </button>
                  </div>
              )}

              {authStep === 'phone-input' && (
                  <form onSubmit={initiatePhoneLogin} className="space-y-4">
                      <div>
                          <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Mobile Number</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">🇬🇭 +233</span>
                            <input 
                                autoFocus
                                type="tel" 
                                value={authInput}
                                onChange={e => setAuthInput(e.target.value)}
                                className="w-full pl-20 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                                placeholder="XX XXX XXXX"
                            />
                          </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {isAuthenticating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Code'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAuthStep('method')}
                        className="w-full py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                         Back
                      </button>
                  </form>
              )}

              {authStep === 'phone-verify' && (
                  <form onSubmit={verifyOtp} className="space-y-4">
                      <div className="text-center mb-2">
                          <p className="text-sm text-slate-600 dark:text-slate-400">Enter code sent to <span className="font-semibold text-slate-900 dark:text-white">+233 {authInput}</span></p>
                      </div>
                      <div className="flex justify-center gap-2">
                          {[1,2,3,4].map(i => (
                             <div key={i} className="w-12 h-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-800 dark:text-white">
                                {otp[i-1] || ''}
                             </div>
                          ))}
                      </div>
                      <input 
                         autoFocus
                         type="number"
                         value={otp}
                         onChange={e => setOtp(e.target.value.slice(0,4))}
                         className="w-full opacity-0 absolute pointer-events-none" 
                      />
                      {/* Using a visible input for simulation if needed, but the divs visualize the otp */}
                      <input 
                         type="tel"
                         autoFocus
                         value={otp}
                         onChange={e => setOtp(e.target.value.slice(0,4))}
                         className="w-full text-center tracking-[1em] text-transparent caret-indigo-600 bg-transparent absolute top-36 left-0 h-12 z-10 focus:outline-none"
                      />

                      <button 
                        type="submit"
                        disabled={otp.length !== 4 || isAuthenticating}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
                      >
                        {isAuthenticating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify & Sign In'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAuthStep('phone-input')}
                        className="w-full py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                         Change Number
                      </button>
                  </form>
              )}

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-xs text-slate-400">By continuing, you agree to TitiMe's Terms & Conditions.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
