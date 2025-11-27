import React from 'react';
import { Building2, PlusCircle, LogOut, ShieldCheck, User } from 'lucide-react';
import { Club } from '../types';
import { ThemeToggle } from './ThemeToggle';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-6 py-4 transition-colors duration-200">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">T</div>
             <span className="font-bold text-xl text-slate-800 dark:text-white">TitiMe</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:block">
                 <ThemeToggle />
             </div>
             <div className="text-right hidden sm:block">
               <div className="text-sm font-medium text-slate-900 dark:text-white">{userName}</div>
               <div className="text-xs text-slate-500 dark:text-slate-400">View Profile</div>
             </div>
             <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
               {userName.charAt(0)}
             </div>
             <button 
                onClick={onSignOut}
                className="ml-2 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
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
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Your Clubs
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                Manage clubs you own or view dues for clubs you've joined.
                </p>
            </div>
            <button 
              onClick={onCreateClub}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
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
                    className={`group relative flex flex-col items-start p-6 bg-white dark:bg-slate-900 rounded-2xl border transition-all text-left h-full ${
                        isAdmin 
                        ? 'border-indigo-100 dark:border-indigo-900 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-md hover:shadow-xl' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-lg'
                    }`}
                >
                    <div className="flex justify-between w-full mb-4">
                        <div className={`w-12 h-12 rounded-xl ${club.logoColor} flex items-center justify-center text-white shadow-sm`}>
                            <Building2 className="h-6 w-6" />
                        </div>
                        {isAdmin && (
                            <div className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-100 dark:border-indigo-800 h-fit flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> Admin
                            </div>
                        )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {club.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3 flex-1">
                    {club.description}
                    </p>

                    <div className="w-full mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                             {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
                             <span className="text-xs font-medium uppercase tracking-wide">
                                 {isAdmin ? 'Owner' : 'Member'}
                             </span>
                         </div>
                         <div className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                             isAdmin 
                             ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none shadow-md group-hover:bg-indigo-700' 
                             : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                         }`}>
                             {isAdmin ? 'Manage Club' : 'Open Portal'}
                         </div>
                    </div>
                </button>
            )})}
            
            {/* Create New Placeholder if empty */}
            {clubs.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-slate-400 mb-4">You haven't joined or created any clubs yet.</p>
                    <button onClick={onCreateClub} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Get started by creating one</button>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClubSelector;