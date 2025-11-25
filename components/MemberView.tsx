import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle, AlertCircle, Calendar, DollarSign, Wallet, ArrowLeftRight, X, Pencil, Trash2, Lock, Plus } from 'lucide-react';
import { PaymentItem, PaymentMethod, PaymentMethodType, Transaction } from '../types';

interface MemberViewProps {
  currentUser: { name: string; email: string };
  clubName: string;
  clubLogoColor: string;
  duePayments: PaymentItem[];
  transactions: Transaction[];
  onBack: () => void;
  onSwitchClub: () => void;
}

const MemberView: React.FC<MemberViewProps> = ({ 
  currentUser, 
  clubName, 
  clubLogoColor,
  duePayments, 
  transactions, 
  onBack,
  onSwitchClub
}) => {
  // Initial Mock Data
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { 
      id: '1', 
      type: PaymentMethodType.MOBILE_MONEY, 
      provider: 'MTN Mobile Money', 
      phoneNumber: '0551234567', 
      network: 'MTN' 
    }
  ]);

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

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState<Set<string>>(new Set(duePayments.filter(p => p.isCompulsory).map(p => p.id)));
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});

  const toggleSubscription = (id: string, isCompulsory: boolean) => {
    if (isCompulsory) return;
    const newSubs = new Set(subscriptions);
    if (newSubs.has(id)) newSubs.delete(id);
    else newSubs.add(id);
    setSubscriptions(newSubs);
  };

  const handleCustomAmountChange = (id: string, amount: number) => {
    setCustomAmounts(prev => ({ ...prev, [id]: amount }));
  };

  // Payment Method Handlers
  const openAddModal = () => {
    setEditingId(null);
    setMethodType(PaymentMethodType.MOBILE_MONEY);
    setFormData({ network: 'MTN', phoneNumber: '', cardNumber: '', expiryDate: '', cvv: '', cardHolder: '' });
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
        cardNumber: `•••• •••• •••• ${method.last4}`, // Display masked
        expiryDate: method.expiryDate || '',
        cvv: '•••',
        cardHolder: method.cardHolder || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteMethod = (id: string) => {
    if (window.confirm('Remove this payment method?')) {
      setPaymentMethods(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleSaveMethod = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update Existing
      setPaymentMethods(prev => prev.map(m => {
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
      }));
    } else {
      // Add New
      const newMethod: PaymentMethod = {
        id: Math.random().toString(36).substr(2, 9),
        type: methodType,
        provider: methodType === PaymentMethodType.MOBILE_MONEY 
          ? `${formData.network} Mobile Money` 
          : 'Visa', // Simplification
        ...(methodType === PaymentMethodType.MOBILE_MONEY ? {
          network: formData.network,
          phoneNumber: formData.phoneNumber
        } : {
          last4: formData.cardNumber.slice(-4),
          expiryDate: formData.expiryDate,
          cardHolder: formData.cardHolder
        })
      };
      setPaymentMethods(prev => [...prev, newMethod]);
    }
    setIsModalOpen(false);
  };

  const totalMonthly = duePayments
    .filter(p => subscriptions.has(p.id))
    .reduce((acc, curr) => {
        if (curr.allowCustomAmount) {
            return acc + (customAmounts[curr.id] || curr.amount);
        }
        return acc + curr.amount;
    }, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
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
                  <span className="font-bold text-sm sm:text-lg text-slate-800 leading-tight">{clubName}</span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Member Portal</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={onSwitchClub}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                <ArrowLeftRight className="h-3 w-3" />
                Switch Club
              </button>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-slate-900">{currentUser.name}</div>
                <div className="text-xs text-slate-500">Member</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium border border-slate-300">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Mobile Switch Club */}
        <button 
           onClick={onSwitchClub}
           className="sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
        >
           <ArrowLeftRight className="h-4 w-4" />
           Switch to another club
        </button>

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
            <h3 className="text-lg font-bold text-slate-900">Payment Methods</h3>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-1.5 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Method
            </button>
          </div>
          
          <div className="space-y-3">
            {paymentMethods.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-500 text-sm">No payment methods added.</p>
                </div>
            ) : (
                paymentMethods.map(method => (
                <div key={method.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${method.type === PaymentMethodType.CARD ? 'bg-indigo-50 text-indigo-600' : 'bg-yellow-50 text-yellow-600'}`}>
                            {method.type === PaymentMethodType.CARD ? <CreditCard className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                        </div>
                        <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                                {method.provider}
                            </div>
                            <div className="text-sm text-slate-500">
                                {method.type === PaymentMethodType.MOBILE_MONEY 
                                    ? method.phoneNumber 
                                    : `•••• •••• •••• ${method.last4}`
                                }
                            </div>
                            {method.type === PaymentMethodType.CARD && method.expiryDate && (
                                <div className="text-xs text-slate-400 mt-0.5">Expires {method.expiryDate}</div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => openEditModal(method)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => handleDeleteMethod(method.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <h3 className="text-lg font-bold text-slate-900 mb-4">Subscriptions & Dues</h3>
          <div className="space-y-3">
            {duePayments.length === 0 ? (
               <div className="text-center p-8 bg-white border border-slate-200 rounded-xl text-slate-500">
                 No dues configured for this club yet.
               </div>
            ) : duePayments.map(payment => (
              <div key={payment.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 w-full">
                     <div className="mt-1 flex-shrink-0">
                        <div className="bg-slate-100 p-2 rounded-lg">
                           <DollarSign className="h-5 w-5 text-slate-600" />
                        </div>
                     </div>
                     <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{payment.title}</h4>
                        <p className="text-sm text-slate-500 mt-1">{payment.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          {payment.allowCustomAmount && subscriptions.has(payment.id) ? (
                              <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-500">Amount: GHS</span>
                                  <input 
                                    type="number" 
                                    className="w-24 p-1 border border-slate-300 rounded text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none bg-white placeholder:text-slate-400"
                                    value={customAmounts[payment.id] || payment.amount}
                                    onChange={(e) => handleCustomAmountChange(payment.id, Number(e.target.value))}
                                    min={payment.amount}
                                  />
                              </div>
                          ) : (
                              <span className="text-lg font-bold text-slate-900">
                                  {payment.allowCustomAmount && payment.amount === 0 
                                    ? 'Custom Amount' 
                                    : `GHS ${payment.amount}`
                                  }
                              </span>
                          )}
                          
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{payment.frequency}</span>
                          
                          {payment.isCompulsory && (
                             <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 flex items-center gap-1">
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
                      checked={subscriptions.has(payment.id)}
                      disabled={payment.isCompulsory}
                      onChange={() => toggleSubscription(payment.id, payment.isCompulsory)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 disabled:opacity-60"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Transaction History */}
        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4">History</h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             {transactions.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No transaction history yet.</div>
             ) : transactions.map((tx, idx) => (
               <div key={tx.id} className={`p-4 flex items-center justify-between ${idx !== transactions.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.status === 'Success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {tx.status === 'Success' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                    </div>
                    <div>
                        <div className="font-medium text-slate-900">{tx.description}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                           <Calendar className="h-3 w-3" /> {tx.date}
                        </div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">- GHS {tx.amount.toFixed(2)}</span>
               </div>
             ))}
          </div>
        </section>
      </main>

      {/* Payment Method Modal (Add/Edit) */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600 font-bold tracking-tight">paystack</span>
                        <span className="text-xs text-slate-400">|</span>
                        <h3 className="text-sm font-semibold text-slate-700">
                            {editingId ? 'Edit Payment Method' : 'Add Payment Method'}
                        </h3>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
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
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500' 
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
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
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' 
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
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
                                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Network</label>
                                    <select 
                                        value={formData.network}
                                        onChange={e => setFormData({...formData, network: e.target.value})}
                                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white text-slate-900"
                                    >
                                        <option value="MTN">MTN Mobile Money</option>
                                        <option value="Telecel">Telecel Cash</option>
                                        <option value="AT">AT Cash</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">🇬🇭 +233</span>
                                        <input 
                                            required
                                            type="tel" 
                                            value={formData.phoneNumber}
                                            onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                            className="w-full pl-20 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white text-slate-900 placeholder:text-slate-400"
                                            placeholder="XX XXX XXXX"
                                        />
                                    </div>
                                </div>
                              </>
                          ) : (
                              <>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Card Number</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input 
                                            required={!editingId} // Not required if editing (masked)
                                            type="text" 
                                            value={formData.cardNumber}
                                            onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white text-slate-900 placeholder:text-slate-400"
                                            placeholder="0000 0000 0000 0000"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Expiry Date</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.expiryDate}
                                            onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white text-slate-900 placeholder:text-slate-400"
                                            placeholder="MM/YY"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">CVV</label>
                                        <input 
                                            required
                                            type="password" 
                                            value={formData.cvv}
                                            onChange={e => setFormData({...formData, cvv: e.target.value})}
                                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white text-slate-900 placeholder:text-slate-400"
                                            placeholder="123"
                                            maxLength={3}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Card Holder Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={formData.cardHolder}
                                        onChange={e => setFormData({...formData, cardHolder: e.target.value})}
                                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white text-slate-900 placeholder:text-slate-400"
                                        placeholder="JOHN DOE"
                                    />
                                </div>
                              </>
                          )}

                          <button 
                            type="submit"
                            className={`w-full py-3 rounded-lg text-white font-medium text-sm transition-colors mt-4 shadow-lg ${
                                methodType === PaymentMethodType.MOBILE_MONEY 
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
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