import React from 'react';
import { Building2, ArrowRight, CheckCircle2, PlusCircle, Settings2, LogOut } from 'lucide-react';
import { Club } from '../types';

interface ClubSelectorProps {
  clubs: Club[];
  onSelectClub: (clubId: string) => void;
  userId: string;
  userName: string;
  onBack: () => void;
  onCreateClub: () => void;
  onSignOut: () => void;
}

const ClubSelector: React.FC<ClubSelectorProps> = ({ clubs, onSelectClub, userId, userName, onBack, onCreateClub, onSignOut }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">T</div>
             <span className="font-bold text-xl text-slate-800">TitiMe</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <div className="text-sm font-medium text-slate-900">{userName}</div>
               <div className="text-xs text-slate-500">View Profile</div>
             </div>
             <div className="h-9 w-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold border border-slate-300">
               {userName.charAt(0)}
             </div>
             <button 
                onClick={onSignOut}
                className="ml-2 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Sign Out"
             >
                <LogOut className="h-5 w-5" />
             </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">
                Your Clubs
                </h1>
                <p className="text-slate-500">
                Manage clubs you own or view dues for clubs you've joined.
                </p>
            </div>
            <button 
              onClick={onCreateClub}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all"
            >
              <PlusCircle className="h-5 w-5" />
              Create New Club
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {clubs.map((club) => {
              const isAdmin = club.adminIds.includes(userId);
              return (
                <button
                    key={club.id}
                    onClick={() => onSelectClub(club.id)}
                    className={`group relative flex flex-col items-start p-6 bg-white rounded-2xl border transition-all text-left h-full ${
                        isAdmin 
                        ? 'border-indigo-100 hover:border-indigo-300 shadow-md hover:shadow-xl' 
                        : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-lg'
                    }`}
                >
                    <div className="flex justify-between w-full mb-4">
                        <div className={`w-12 h-12 rounded-xl ${club.logoColor} flex items-center justify-center text-white shadow-sm`}>
                            <Building2 className="h-6 w-6" />
                        </div>
                        {isAdmin && (
                            <div className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-100 h-fit">
                                Admin
                            </div>
                        )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {club.name}
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-3">
                    {club.description}
                    </p>

                    <div className="w-full mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          {isAdmin ? 'Total Members' : 'Active Dues'}
                        </span>
                        <span className="font-semibold text-slate-900">
                        {isAdmin 
                            ? club.stats.totalMembers 
                            : `${club.paymentItems.length} Plans`}
                        </span>
                    </div>
                    </div>

                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                       {isAdmin ? <Settings2 className="h-5 w-5 text-indigo-400" /> : <ArrowRight className="h-5 w-5 text-slate-400" />}
                    </div>
                </button>
            )})}
            
            {/* Create New Placeholder if empty */}
            {clubs.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-400 mb-4">You haven't joined or created any clubs yet.</p>
                    <button onClick={onCreateClub} className="text-indigo-600 font-medium hover:underline">Get started by creating one</button>
                </div>
            )}
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 flex items-start gap-3 text-sm text-indigo-900 max-w-2xl mx-auto mt-8">
               <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
               <p>
                 <strong>Tip:</strong> If you are an executive, click "Create New Club" to set up your organization's finance portal. 
                 To join an existing club as a member, ask your admin for an invite link (coming soon).
               </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClubSelector;