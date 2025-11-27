import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, CheckCircle, AlertCircle, Calendar, DollarSign, Wallet, ArrowLeftRight, X, Pencil, Trash2, Lock, Plus, LogOut } from 'lucide-react';
import { PaymentItem, PaymentMethod, PaymentMethodType, Transaction, User } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface MemberViewProps {
  user: User;
  clubName: string;
  clubId: string;
  clubLogoColor: string;
  duePayments: PaymentItem[];
  transactions: Transaction[];
  onBack: () => void;
  onSwitchClub: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onSignOut: () => void;
}

const MemberView: React.FC<MemberViewProps> = ({ 
  user,
  clubName, 
  clubId,
  clubLogoColor,
  duePayments, 
  transactions, 
  onBack,
  onSwitchClub,
  onUpdateUser,
  onSignOut
}) => {
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [methodType, setMethodType] = useState<PaymentMethodType>(PaymentMethodType.MOBILE_MONEY);
  const [formData, setFormData] = useState({
    network: 'MTN',
    phoneNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });

  // Load subscriptions and custom amounts for THIS club from user profile
  const clubSubscriptions = new Set(user.subscriptions[clubId] || []);
  const clubCustomAmounts = user.customAmounts[clubId] || {};

  // Initialize compulsory subscriptions if not present
  useEffect(() => {
    const compulsoryIds = duePayments.filter(p => p.isCompulsory).map(p => p.id);
    const missingCompulsory = compulsoryIds.filter(id => !clubSubscriptions.has(id));
    
    if (missingCompulsory.length > 0) {
      const newSubs = [...(user.subscriptions[clubId] || []), ...missingCompulsory];
      onUpdateUser({
        ...user,
        subscriptions: {
          ...user.subscriptions,
          [clubId]: newSubs
        }
      });
    }
  }, [clubId, duePayments]);

  const toggleSubscription = (paymentId: string, isCompulsory: boolean) => {
    if (isCompulsory) return;
    
    const currentSubs = user.subscriptions[clubId] || [];
    let newSubs;
    
    if (currentSubs.includes(paymentId)) {
      newSubs = currentSubs.filter(id => id !== paymentId);
    } else {
      newSubs = [...currentSubs, paymentId];
    }

    onUpdateUser({
      ...user,
      subscriptions: {
        ...user.subscriptions,
        [clubId]: newSubs
      }
    });
  };

  const handleCustomAmountChange = (paymentId: string, amount: number) => {
    onUpdateUser({
      ...user,
      customAmounts: {
        ...user.customAmounts,
        [clubId]: {
          ...(user.customAmounts[clubId] || {}),
          [paymentId]: amount
        }
      }
    });
  };

  // Payment Method Handlers
  const openAddModal = () => {
    setEditingId(null);
    setMethodType(PaymentMethodType.MOBILE_MONEY);
    setFormData({ network: 'MTN', phoneNumber: user.phoneNumber || '', cardNumber: '', expiryDate: '', cvv: '', cardHolder: user.name });
    setIsModalOpen(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingId(method.id);
    setMethodType(method.type);
    
    if (method.type === PaymentMethodType.MOBILE_MONEY) {
      setFormData({
        network: method.network || 'MTN',
        phoneNumber: method.phoneNumber || '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolder: ''
      });
    } else {
      setFormData({
        network: 'MTN',
        phoneNumber: '',
        cardNumber: `•••• •••• •••• ${method.last4}`, 
        expiryDate: method.expiryDate || '',
        cvv: '•••',
        cardHolder: method.cardHolder || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteMethod = (id: string) => {
    if (window.confirm('Remove this payment method?')) {
      onUpdateUser({
        ...user,
        paymentMethods: user.paymentMethods.filter(m => m.id !== id)
      });
    }
  };

  const handleSaveMethod = (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedMethods = [...user.paymentMethods];

    if (editingId) {
      updatedMethods = updatedMethods.map(m => {
        if (m.id === editingId) {
          if (methodType === PaymentMethodType.MOBILE_MONEY) {
            return {
              ...m,
              type: PaymentMethodType.MOBILE_MONEY,
              provider: `${formData.network} Mobile Money`,
              network: formData.network,
              phoneNumber: formData.phoneNumber
            };
          } else {
            return {
              ...m,
              type: PaymentMethodType.CARD,
              provider: 'Visa', // Simplification
              last4: formData.cardNumber.slice(-4) || m.last4 || '0000',
              expiryDate: formData.expiryDate,
              cardHolder: formData.cardHolder
            };
          }
        }
        return m;
      });
    } else {
      const newMethod: PaymentMethod = {
        id: Math.random().toString(36).substr(2, 9),
        type: methodType,
        provider: methodType === PaymentMethodType.MOBILE_MONEY 
          ? `${formData.network} Mobile Money` 
          : 'Visa',
        ...(methodType === PaymentMethodType.MOBILE_MONEY ? {
          network: formData.network,
          phoneNumber: formData.phoneNumber
        } : {
          last4: formData.cardNumber.slice(-4),
          expiryDate: formData.expiryDate,
          cardHolder: formData.cardHolder
        })
      };
      updatedMethods.push(newMethod);
    }

    onUpdateUser({
      ...user,
      paymentMethods: updatedMethods
    });
    setIsModalOpen(false);
  };

  const totalMonthly = duePayments
    .filter(p => clubSubscriptions.has(p.id))
    .reduce((acc, curr) => {
        if (curr.allowCustomAmount) {
            return acc + (clubCustomAmounts[curr.id] || curr.amount);
        }
        return acc + curr.amount;
    }, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-200">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <div 
                onClick={onBack}
                className="flex-shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className={`w-8 h-8 rounded-lg ${clubLogoColor} flex items-center justify-center text-white font-bold`}>
                  {clubName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm sm:text-lg text-slate-800 dark:text-white leading-tight">{clubName}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Member Portal</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                 <ThemeToggle />
              </div>
              <button 
                onClick={onSwitchClub}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                <ArrowLeftRight className="h-3 w-3" />
                Switch Club
              </button>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Member</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium border border-slate-300 dark:border-slate-600 overflow-hidden">
                {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : user.name.charAt(0)}
              </div>
              <button 
                onClick={onSignOut}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                title="Sign Out"
              >
                  <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Mobile Controls */}
        <div className="sm:hidden flex gap-2">
            <button 
                onClick={onSwitchClub}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                <ArrowLeftRight className="h-4 w-4" />
                Switch Club
            </button>
            <div className="flex items-center justify-center px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                <ThemeToggle />
            </div>
        </div>

        {/* Wallet / Total Dues Summary */}
        <div className={`bg-gradient-to-br ${clubLogoColor === 'bg-orange-600' ? 'from-orange-600 to-red-700' : 'from-blue-600 to-indigo-700'} rounded-2xl p-6 text-white shadow-lg`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">Upcoming Deduction</p>
              <h2 className="text-4xl font-bold tracking-tight">GHS {totalMonthly.toFixed(2)}</h2>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-white/80">
            <CheckCircle className="h-4 w-4" />
            <span>Next auto-deduction: 30th Sep</span>
          </div>
        </div>

        {/* Payment Methods */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment Methods</h3>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-1.5 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Method
            </button>
          </div>
          
          <div className="space-y-3">
            {user.paymentMethods.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No payment methods saved.</p>
                </div>
            ) : (
                user.paymentMethods.map(method => (
                <div key={method.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${method.type === PaymentMethodType.CARD ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'}`}>
                            {method.type === PaymentMethodType.CARD ? <CreditCard className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                        </div>
                        <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                {method.provider}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                {method.type === PaymentMethodType.MOBILE_MONEY 
                                    ? method.phoneNumber 
                                    : `•••• •••• •••• ${method.last4}`
                                }
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => openEditModal(method)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => handleDeleteMethod(method.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Remove"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                ))
            )}
            
            <div className="flex items-center justify-center gap-2 mt-2 opacity-60">
                <Lock className="h-3 w-3 text-slate-400" />
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Secured by Paystack</span>
            </div>
          </div>
        </section>

        {/* Dues & Subscriptions */}
        <section>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Subscriptions & Dues</h3>
          <div className="space-y-3">
            {duePayments.length === 0 ? (
               <div className="text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400">
                 No dues configured for this club yet.
               </div>
            ) : duePayments.map(payment => (
              <div key={payment.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 w-full">
                     <div className="mt-1 flex-shrink-0">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                           <DollarSign className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                     </div>
                     <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{payment.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{payment.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          {payment.allowCustomAmount && clubSubscriptions.has(payment.id) ? (
                              <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-500 dark:text-slate-400">Amount: GHS</span>
                                  <input 
                                    type="number" 
                                    className="w-24 p-1 border border-slate-300 dark:border-slate-700 rounded text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-800 placeholder:text-slate-400"
                                    value={clubCustomAmounts[payment.id] || payment.amount}
                                    onChange={(e) => handleCustomAmountChange(payment.id, Number(e.target.value))}
                                    min={payment.amount}
                                  />
                              </div>
                          ) : (
                              <span className="text-lg font-bold text-slate-900 dark:text-white">
                                  {payment.allowCustomAmount && payment.amount === 0 
                                    ? 'Custom Amount' 
                                    : `GHS ${payment.amount}`
                                  }
                              </span>
                          )}
                          
                          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{payment.frequency}</span>
                          
                          {payment.isCompulsory && (
                             <span className="text-xs text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full border border-amber-100 dark:border-amber-900/50 flex items-center gap-1">
                               <AlertCircle className="h-3 w-3" /> Mandatory
                             </span>
                          )}
                        </div>
                     </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={clubSubscriptions.has(payment.id)}
                      disabled={payment.isCompulsory}
                      onChange={() => toggleSubscription(payment.id, payment.isCompulsory)}
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 disabled:opacity-60"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Transaction History */}
        <section>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">History</h3>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             {transactions.length === 0 ? (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">No transaction history yet.</div>
             ) : transactions.map((tx, idx) => (
               <div key={tx.id} className={`p-4 flex items-center justify-between ${idx !== transactions.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.status === 'Success' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        {tx.status === 'Success' ? <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500" />}
                    </div>
                    <div>
                        <div className="font-medium text-slate-900 dark:text-white">{tx.description}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                           <Calendar className="h-3 w-3" /> {tx.date}
                        </div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">- GHS {tx.amount.toFixed(2)}</span>
               </div>
             ))}
          </div>
        </section>
      </main>

      {/* Payment Method Modal (Add/Edit) */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-tight">paystack</span>
                        <span className="text-xs text-slate-400">|</span>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {editingId ? 'Edit Payment Method' : 'Add Payment Method'}
                        </h3>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          <X className="h-5 w-5" />
                      </button>
                  </div>
                  
                  <div className="p-6">
                      <div className="flex gap-4 mb-6">
                        <button 
                            type="button"
                            onClick={() => setMethodType(PaymentMethodType.MOBILE_MONEY)}
                            className={`flex-1 py-3 px-2 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-all ${
                                methodType === PaymentMethodType.MOBILE_MONEY 
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500' 
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <Smartphone className="h-5 w-5" />
                            Mobile Money
                        </button>
                        <button 
                            type="button"
                            onClick={() => setMethodType(PaymentMethodType.CARD)}
                            className={`flex-1 py-3 px-2 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-all ${
                                methodType === PaymentMethodType.CARD 
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500' 
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <CreditCard className="h-5 w-5" />
                            Card
                        </button>
                      </div>

                      <form onSubmit={handleSaveMethod} className="space-y-4">
                          {methodType === PaymentMethodType.MOBILE_MONEY ? (
                              <>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Network</label>
                                    <select 
                                        value={formData.network}
                                        onChange={e => setFormData({...formData, network: e.target.value})}
                                        className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                                    >
                                        <option value="MTN">MTN Mobile Money</option>
                                        <option value="Telecel">Telecel Cash</option>
                                        <option value="AT">AT Cash</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">🇬🇭 +233</span>
                                        <input 
                                            required
                                            type="tel" 
                                            value={formData.phoneNumber}
                                            onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                            className="w-full pl-20 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400"
                                            placeholder="XX XXX XXXX"
                                        />
                                    </div>
                                </div>
                              </>
                          ) : (
                              <>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Card Number</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input 
                                            required={!editingId}
                                            type="text" 
                                            value={formData.cardNumber}
                                            onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400"
                                            placeholder="0000 0000 0000 0000"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Expiry Date</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.expiryDate}
                                            onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                                            className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400"
                                            placeholder="MM/YY"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">CVV</label>
                                        <input 
                                            required
                                            type="password" 
                                            value={formData.cvv}
                                            onChange={e => setFormData({...formData, cvv: e.target.value})}
                                            className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400"
                                            placeholder="123"
                                            maxLength={3}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Card Holder Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={formData.cardHolder}
                                        onChange={e => setFormData({...formData, cardHolder: e.target.value})}
                                        className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400"
                                        placeholder="JOHN DOE"
                                    />
                                </div>
                              </>
                          )}

                          <button 
                            type="submit"
                            className={`w-full py-3 rounded-lg text-white font-medium text-sm transition-colors mt-4 shadow-lg ${
                                methodType === PaymentMethodType.MOBILE_MONEY 
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none' 
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
                            }`}
                          >
                            {editingId ? 'Save Changes' : 'Add Payment Method'}
                          </button>
                          
                          <div className="flex justify-center mt-4">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                                <Lock className="h-3 w-3" />
                                Secure Payment
                            </div>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default MemberView;