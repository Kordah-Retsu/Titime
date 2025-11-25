import React from 'react';
import { Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Club } from '../types';

interface ClubSelectorProps {
  clubs: Club[];
  onSelectClub: (clubId: string) => void;
  userRole: 'admin' | 'member';
  userName: string;
  onBack: () => void;
}

const ClubSelector: React.FC<ClubSelectorProps> = ({ clubs, onSelectClub, userRole, userName, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">T</div>
             <span className="font-bold text-xl text-slate-800">TitiMe</span>
          </div>
          <div className="text-sm text-slate-600">
            Signed in as <span className="font-semibold text-slate-900">{userName}</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2 mt-8">
            <h1 className="text-3xl font-bold text-slate-900">
              {userRole === 'admin' ? 'Select a Club to Manage' : 'Choose a Club'}
            </h1>
            <p className="text-slate-500">
              {userRole === 'admin' 
                ? 'Access the dashboard for your organization.' 
                : 'Subscribe to a club to view dues and manage payments.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {clubs.map((club) => (
              <button
                key={club.id}
                onClick={() => onSelectClub(club.id)}
                className="group relative flex flex-col items-start p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all text-left"
              >
                <div className={`w-12 h-12 rounded-xl ${club.logoColor} flex items-center justify-center text-white mb-4 shadow-sm`}>
                  <Building2 className="h-6 w-6" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {club.name}
                </h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  {club.description}
                </p>

                <div className="w-full mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {userRole === 'member' ? 'Monthly Dues' : 'Members'}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {userRole === 'member' 
                        ? `GHS ${club.paymentItems.find(p => p.frequency === 'Monthly')?.amount || 0}`
                        : club.stats.totalMembers}
                    </span>
                  </div>
                </div>

                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5 text-indigo-400" />
                </div>
              </button>
            ))}
          </div>

          {userRole === 'member' && (
            <div className="bg-indigo-50 rounded-xl p-4 flex items-start gap-3 text-sm text-indigo-900 max-w-2xl mx-auto">
               <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
               <p>
                 You can subscribe to multiple clubs. Payments for each club are handled separately.
                 Select a club above to view its specific dues and events.
               </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClubSelector;