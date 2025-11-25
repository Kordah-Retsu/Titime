import React, { useEffect, useState } from 'react';
import { 
  Users, DollarSign, Wallet, MoreVertical, Plus, 
  Search, Bell, Bot, ArrowUpRight, Pencil, Trash2, X, ArrowLeftRight, Settings2
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
  onDeletePayment 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'finances'>('overview');
  const [showAi, setShowAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  
  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    editingId?: string;
  }>({ isOpen: false, mode: 'add' });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    frequency: PaymentFrequency.MONTHLY,
    isCompulsory: false,
    allowCustomAmount: false,
    description: ''
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

  const openAddModal = () => {
    setFormData({
        title: '',
        amount: 0,
        frequency: PaymentFrequency.MONTHLY,
        isCompulsory: false,
        allowCustomAmount: false,
        description: ''
    });
    setModalState({ isOpen: true, mode: 'add' });
  };

  const openEditModal = (item: PaymentItem) => {
    setFormData({
        title: item.title,
        amount: item.amount,
        frequency: item.frequency,
        isCompulsory: item.isCompulsory,
        allowCustomAmount: item.allowCustomAmount || false,
        description: item.description
    });
    setModalState({ isOpen: true, mode: 'edit', editingId: item.id });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalState.mode === 'add') {
        onAddPayment(formData);
    } else if (modalState.mode === 'edit' && modalState.editingId) {
        onUpdatePayment({
            id: modalState.editingId,
            ...formData
        });
    }

    setModalState({ isOpen: false, mode: 'add' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
        onDeletePayment(id);
    }
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
              <button className="p-2 text-slate-400 hover:text-slate-600 relative">
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">Member Directory</h3>
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     <input type="text" placeholder="Search members..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400" />
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-600">
                   <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                     <tr>
                       <th className="px-6 py-4">Name</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Joined Date</th>
                       <th className="px-6 py-4 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody>
                     {members.map((member) => (
                       <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
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
                              member.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {member.status}
                            </span>
                         </td>
                         <td className="px-6 py-4">{member.joinedDate}</td>
                         <td className="px-6 py-4 text-right">
                           <button className="text-slate-400 hover:text-slate-600">
                             <MoreVertical className="h-4 w-4" />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'finances' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold text-slate-800">Active Payment Plans</h3>
                   <button 
                     onClick={openAddModal}
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
                                onClick={() => openEditModal(item)}
                                className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(item.id)}
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
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                           <span className="text-slate-500">Subscribers</span>
                           <span className="font-medium text-slate-900 flex items-center gap-1">
                              24 <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                           </span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          )}
        </main>
      </div>

      {/* Payment Modal (Add/Edit) */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                    {modalState.mode === 'add' ? 'Create New Payment' : 'Edit Payment'}
                </h3>
                <button 
                    onClick={() => setModalState({ ...modalState, isOpen: false })}
                    className="text-slate-400 hover:text-slate-600"
                >
                    <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
                    placeholder="e.g. Monthly Maintenance"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                      {formData.allowCustomAmount ? 'Minimum Amount (Optional)' : 'Amount (GHS)'}
                  </label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                    <select 
                      value={formData.frequency}
                      onChange={e => setFormData({...formData, frequency: e.target.value as any})}
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
                        checked={formData.allowCustomAmount}
                        onChange={e => setFormData({...formData, allowCustomAmount: e.target.checked})}
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
                        checked={formData.isCompulsory}
                        onChange={e => setFormData({...formData, isCompulsory: e.target.checked})}
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
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white text-slate-900 placeholder:text-slate-400"
                  ></textarea>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setModalState({ ...modalState, isOpen: false })}
                    className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                  >
                    {modalState.mode === 'add' ? 'Create' : 'Save Changes'}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* AI Assistant Chat Bubble */}
      <AIAssistant isOpen={showAi} onClose={() => setShowAi(false)} />
    </div>
  );
};

export default Dashboard;