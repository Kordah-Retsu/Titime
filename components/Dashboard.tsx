
import React, { useEffect, useState } from 'react';
import { 
  Users, DollarSign, Wallet, MoreVertical, Plus, 
  Search, Bell, Bot, ArrowUpRight, Pencil, Trash2, X, ArrowLeftRight, Settings2, ShieldAlert, Mail, Lock, UserX, UserCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClubStats, Member, PaymentItem, PaymentFrequency } from '../types';
import AIAssistant from './AIAssistant';
import { analyzeFinancialHealth } from '../services/geminiService';

interface DashboardProps {
  clubName: string;
  clubLogoColor: string;
  stats: ClubStats;
  members: Member[];
  paymentItems: PaymentItem[];
  onLogout: () => void;
  onSwitchClub: () => void;
  onAddPayment: (p: Omit<PaymentItem, 'id'>) => void;
  onUpdatePayment: (p: PaymentItem) => void;
  onDeletePayment: (id: string) => void;
  // New props for member management and club settings
  onDeleteClub: () => void;
  onAddMember: (m: Omit<Member, 'id' | 'joinedDate'>) => void;
  onUpdateMember: (m: Member) => void;
  onDeleteMember: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  clubName,
  clubLogoColor,
  stats, 
  members, 
  paymentItems, 
  onLogout, 
  onSwitchClub,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
  onDeleteClub,
  onAddMember,
  onUpdateMember,
  onDeleteMember
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'finances' | 'settings'>('overview');
  const [showAi, setShowAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  
  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    editingId?: string;
  }>({ isOpen: false, mode: 'add' });

  // Member Modal State
  const [memberModal, setMemberModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    editingId?: string;
  }>({ isOpen: false, mode: 'add' });
  
  // Notification Modal State
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');

  // Payment Form Data
  const [paymentFormData, setPaymentFormData] = useState({
    title: '',
    amount: 0,
    frequency: PaymentFrequency.MONTHLY,
    isCompulsory: false,
    allowCustomAmount: false,
    description: ''
  });

  // Member Form Data
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    status: 'Active' as 'Active' | 'Pending' | 'Overdue' | 'Blocked'
  });

  const chartData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
    { name: 'Jul', amount: 3490 },
  ];

  useEffect(() => {
    if (activeTab === 'overview' && !aiAnalysis) {
      const fetchAnalysis = async () => {
         const result = await analyzeFinancialHealth(stats.totalRevenue, stats.pendingDues, stats.totalMembers);
         setAiAnalysis(result);
      };
      fetchAnalysis();
    }
  }, [activeTab, stats, aiAnalysis]);

  // Payment Handlers
  const openAddPaymentModal = () => {
    setPaymentFormData({
        title: '',
        amount: 0,
        frequency: PaymentFrequency.MONTHLY,
        isCompulsory: false,
        allowCustomAmount: false,
        description: ''
    });
    setPaymentModal({ isOpen: true, mode: 'add' });
  };

  const openEditPaymentModal = (item: PaymentItem) => {
    setPaymentFormData({
        title: item.title,
        amount: item.amount,
        frequency: item.frequency,
        isCompulsory: item.isCompulsory,
        allowCustomAmount: item.allowCustomAmount || false,
        description: item.description
    });
    setPaymentModal({ isOpen: true, mode: 'edit', editingId: item.id });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentModal.mode === 'add') {
        onAddPayment(paymentFormData);
    } else if (paymentModal.mode === 'edit' && paymentModal.editingId) {
        onUpdatePayment({ id: paymentModal.editingId, ...paymentFormData });
    }
    setPaymentModal({ isOpen: false, mode: 'add' });
  };

  // Member Handlers
  const openAddMemberModal = () => {
    setMemberFormData({ name: '', email: '', phoneNumber: '', status: 'Active' });
    setMemberModal({ isOpen: true, mode: 'add' });
  };

  const openEditMemberModal = (member: Member) => {
    setMemberFormData({ 
        name: member.name, 
        email: member.email, 
        phoneNumber: member.phoneNumber || '',
        status: member.status 
    });
    setMemberModal({ isOpen: true, mode: 'edit', editingId: member.id });
  };

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberModal.mode === 'add') {
        onAddMember(memberFormData);
    } else if (memberModal.mode === 'edit' && memberModal.editingId) {
        const existing = members.find(m => m.id === memberModal.editingId);
        if (existing) {
            onUpdateMember({ ...existing, ...memberFormData });
        }
    }
    setMemberModal({ isOpen: false, mode: 'add' });
  };

  const handleBlockMember = (member: Member) => {
    if (window.confirm(`Are you sure you want to block ${member.name}?`)) {
        onUpdateMember({ ...member, status: 'Blocked' });
    }
  };

  const handleUnblockMember = (member: Member) => {
    onUpdateMember({ ...member, status: 'Active' });
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm('Remove this member permanently?')) {
        onDeleteMember(id);
    }
  };

  const handleSendNotification = () => {
    alert(`Notification sent to members: "${notifyMessage}"`);
    setNotifyMessage('');
    setNotifyModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-lg ${clubLogoColor} flex items-center justify-center text-white font-bold shadow-sm`}>{clubName.charAt(0)}</div>
             <span className="text-lg font-bold text-slate-800 leading-tight">{clubName}</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Wallet className="h-5 w-5" /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'members' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users className="h-5 w-5" /> Members
          </button>
          <button 
            onClick={() => setActiveTab('finances')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'finances' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <DollarSign className="h-5 w-5" /> Finances
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings2 className="h-5 w-5" /> Settings
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-3">
           <button 
             onClick={onSwitchClub}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
           >
             <ArrowLeftRight className="h-4 w-4" /> Switch Club
           </button>
           <button 
             onClick={() => setShowAi(!showAi)}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-md"
           >
             <Bot className="h-4 w-4" /> AI Assistant
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
           <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-slate-800 capitalize">{activeTab}</h1>
           </div>
           
           <div className="flex items-center gap-4">
              <button onClick={() => setNotifyModalOpen(true)} className="p-2 text-slate-400 hover:text-slate-600 relative" title="Send Notification">
                 <Bell className="h-5 w-5" />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-px h-6 bg-slate-200 mx-2"></div>
              <button onClick={onLogout} className="text-sm font-medium text-slate-600 hover:text-indigo-600">
                Sign Out
              </button>
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                A
              </div>
           </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><DollarSign className="h-6 w-6"/></div>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+12%</span>
                   </div>
                   <p className="text-sm text-slate-500">Total Revenue</p>
                   <h3 className="text-2xl font-bold text-slate-900">GHS {stats.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-pink-50 rounded-lg text-pink-600"><Users className="h-6 w-6"/></div>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+4</span>
                   </div>
                   <p className="text-sm text-slate-500">Total Members</p>
                   <h3 className="text-2xl font-bold text-slate-900">{stats.totalMembers}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Wallet className="h-6 w-6"/></div>
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">-2%</span>
                   </div>
                   <p className="text-sm text-slate-500">Pending Dues</p>
                   <h3 className="text-2xl font-bold text-slate-900">GHS {stats.pendingDues.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-teal-50 rounded-lg text-teal-600"><Bot className="h-6 w-6"/></div>
                   </div>
                   <p className="text-sm text-slate-500">AI Analysis</p>
                   <div className="text-xs text-slate-700 mt-1 line-clamp-3">
                     {aiAnalysis || "Analyzing financial data..."}
                   </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Overview</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `GHS ${val}`} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        itemStyle={{color: '#4f46e5', fontWeight: 600}}
                        formatter={(value) => [`GHS ${value}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="Search members..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400" />
                    </div>
                    <div className="flex gap-2">
                         <button 
                            onClick={() => setNotifyModalOpen(true)}
                            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Mail className="h-4 w-4" /> Message All
                        </button>
                        <button 
                            onClick={openAddMemberModal}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus className="h-4 w-4" /> Add Member
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Joined Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                            <tr key={member.id} className={`border-b border-slate-50 hover:bg-slate-50/50 ${member.status === 'Blocked' ? 'bg-red-50/30' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${member.status === 'Blocked' ? 'bg-red-200 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{member.name}</div>
                                            <div className="text-xs text-slate-500">{member.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    member.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                    member.status === 'Overdue' ? 'bg-amber-100 text-amber-700' :
                                    member.status === 'Blocked' ? 'bg-red-100 text-red-700' :
                                    'bg-slate-100 text-slate-700'
                                    }`}>
                                    {member.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-mono">{member.phoneNumber || 'N/A'}</td>
                                <td className="px-6 py-4">{member.joinedDate}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => openEditMemberModal(member)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        
                                        {member.status === 'Blocked' ? (
                                            <button 
                                                onClick={() => handleUnblockMember(member)}
                                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="Unblock"
                                            >
                                                <UserCheck className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleBlockMember(member)}
                                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded" title="Block"
                                            >
                                                <UserX className="h-4 w-4" />
                                            </button>
                                        )}

                                        <button 
                                            onClick={() => handleDeleteMember(member.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Remove"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'finances' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold text-slate-800">Active Payment Plans</h3>
                   <button 
                     onClick={openAddPaymentModal}
                     className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                   >
                     <Plus className="h-4 w-4" /> Create New Due
                   </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {paymentItems.map((item) => (
                     <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-indigo-100 transition-all">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => openEditPaymentModal(item)}
                                className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => {
                                    if(window.confirm('Delete this payment plan?')) onDeletePayment(item.id);
                                }}
                                className="p-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        
                        <div className="flex flex-col items-start gap-2 mb-4 mt-2">
                           {item.isCompulsory && (
                             <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-md font-medium border border-amber-200">
                               Compulsory
                             </span>
                           )}
                           {item.allowCustomAmount && (
                             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md font-medium border border-blue-200">
                               Flexible Amount
                             </span>
                           )}
                        </div>
                        
                        <div className="mt-4 mb-4">
                           <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                              <DollarSign className="h-5 w-5" />
                           </div>
                           <h4 className="font-bold text-slate-900 text-lg">{item.title}</h4>
                           <p className="text-slate-500 text-sm mt-1 line-clamp-2 h-10">{item.description}</p>
                        </div>

                        <div className="flex items-baseline gap-1">
                           <span className="text-2xl font-bold text-slate-900">
                              {item.allowCustomAmount && item.amount === 0 ? 'User Defined' : `GHS ${item.amount}`}
                              {item.allowCustomAmount && item.amount > 0 && '+'}
                           </span>
                           <span className="text-sm text-slate-500">/{item.frequency}</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'settings' && (
              <div className="max-w-2xl space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Club Settings</h3>
                      <div className="space-y-4">
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between">
                              <div>
                                  <h4 className="font-medium text-slate-900">Club Profile</h4>
                                  <p className="text-sm text-slate-500 mt-1">Edit club name, description, and branding.</p>
                              </div>
                              <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                                  Edit Profile
                              </button>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
                      <div className="flex items-start gap-4">
                          <div className="p-3 bg-red-50 rounded-lg text-red-600">
                              <ShieldAlert className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                              <h3 className="text-lg font-bold text-slate-900">Danger Zone</h3>
                              <p className="text-sm text-slate-500 mt-1">
                                  Deleting the club will permanently remove all member data, transaction history, and payment configurations. This action cannot be undone.
                              </p>
                              <button 
                                onClick={() => {
                                    if(window.confirm('CRITICAL WARNING: Are you sure you want to delete this club? This action is irreversible.')) {
                                        onDeleteClub();
                                    }
                                }}
                                className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                              >
                                  Delete Club Permanently
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}
        </main>
      </div>

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                    {paymentModal.mode === 'add' ? 'Create New Payment' : 'Edit Payment'}
                </h3>
                <button 
                    onClick={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                    className="text-slate-400 hover:text-slate-600"
                >
                    <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input 
                    required
                    type="text" 
                    value={paymentFormData.title}
                    onChange={e => setPaymentFormData({...paymentFormData, title: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
                    placeholder="e.g. Monthly Maintenance"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                      {paymentFormData.allowCustomAmount ? 'Minimum Amount (Optional)' : 'Amount (GHS)'}
                  </label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={paymentFormData.amount}
                    onChange={e => setPaymentFormData({...paymentFormData, amount: Number(e.target.value)})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                    <select 
                      value={paymentFormData.frequency}
                      onChange={e => setPaymentFormData({...paymentFormData, frequency: e.target.value as any})}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                    >
                      <option value="One Time">One Time</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={paymentFormData.allowCustomAmount}
                        onChange={e => setPaymentFormData({...paymentFormData, allowCustomAmount: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 bg-white"
                      />
                      <div>
                          <span className="block text-sm font-medium text-slate-800">Allow Variable Amount</span>
                          <span className="block text-xs text-slate-500">Members can choose how much to pay</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={paymentFormData.isCompulsory}
                        onChange={e => setPaymentFormData({...paymentFormData, isCompulsory: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 bg-white"
                      />
                      <div>
                          <span className="block text-sm font-medium text-slate-800">Compulsory Payment</span>
                          <span className="block text-xs text-slate-500">All members are required to pay this</span>
                      </div>
                    </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea 
                    rows={3}
                    value={paymentFormData.description}
                    onChange={e => setPaymentFormData({...paymentFormData, description: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white text-slate-900 placeholder:text-slate-400"
                  ></textarea>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                    className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                  >
                    {paymentModal.mode === 'add' ? 'Create' : 'Save Changes'}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* Member Modal */}
      {memberModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                    {memberModal.mode === 'add' ? 'Add Member' : 'Edit Member'}
                </h3>
                <button 
                    onClick={() => setMemberModal({ ...memberModal, isOpen: false })}
                    className="text-slate-400 hover:text-slate-600"
                >
                    <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleMemberSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={memberFormData.name}
                    onChange={e => setMemberFormData({...memberFormData, name: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    required
                    type="email" 
                    value={memberFormData.email}
                    onChange={e => setMemberFormData({...memberFormData, email: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={memberFormData.phoneNumber}
                    onChange={e => setMemberFormData({...memberFormData, phoneNumber: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select 
                      value={memberFormData.status}
                      onChange={e => setMemberFormData({...memberFormData, status: e.target.value as any})}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setMemberModal({ ...memberModal, isOpen: false })}
                    className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                  >
                    {memberModal.mode === 'add' ? 'Add Member' : 'Save Changes'}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
      
      {/* Notification Modal */}
      {notifyModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Send Notification</h3>
                    <button 
                        onClick={() => setNotifyModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-slate-500">This message will be sent to all {members.length} members via email and in-app notification.</p>
                    <textarea 
                        value={notifyMessage}
                        onChange={(e) => setNotifyMessage(e.target.value)}
                        placeholder="Type your message here..."
                        rows={4}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white text-slate-900 placeholder:text-slate-400"
                    />
                    <button 
                        onClick={handleSendNotification}
                        disabled={!notifyMessage}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Send Message
                    </button>
                </div>
             </div>
          </div>
      )}

      {/* AI Assistant Chat Bubble */}
      <AIAssistant isOpen={showAi} onClose={() => setShowAi(false)} />
    </div>
  );
};

export default Dashboard;
