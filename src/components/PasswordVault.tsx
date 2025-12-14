import React, { useState } from 'react';
import { Credential } from '../types';
import { Eye, EyeOff, Copy, Search, Plus, Trash2, Key, AtSign, ShieldCheck, X } from 'lucide-react';

interface PasswordVaultProps {
  credentials: Credential[];
  onAdd: (cred: Credential) => void;
  onDelete: (id: string) => void;
}

const PasswordVault: React.FC<PasswordVaultProps> = ({ credentials, onAdd, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCred, setNewCred] = useState<Partial<Credential>>({
    serviceName: '',
    email: '',
    password: '',
    category: 'General'
  });

  const toggleVisibility = (id: string) => {
    const newSet = new Set(visiblePasswords);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisiblePasswords(newSet);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCred.serviceName && newCred.email && newCred.password) {
      onAdd({
        id: crypto.randomUUID(),
        serviceName: newCred.serviceName,
        email: newCred.email,
        password: newCred.password,
        category: newCred.category || 'General'
      } as Credential);
      setNewCred({ serviceName: '', email: '', password: '', category: 'General' });
      setIsModalOpen(false);
    }
  };

  const filteredCredentials = credentials.filter(c => 
    c.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-charcoal text-bone rounded-xl">
               <ShieldCheck size={24} />
             </div>
             <h2 className="text-2xl font-black text-charcoal">Secure Vault</h2>
          </div>
          <p className="text-charcoal/60 font-medium text-sm">Manage your accounts and passwords securely.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
           <div className="relative group flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40 group-focus-within:text-peach transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search accounts..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/40 backdrop-blur-sm pl-12 pr-4 py-4 rounded-2xl border border-white/40 focus:bg-white/60 focus:ring-2 focus:ring-peach/50 outline-none text-charcoal font-medium placeholder-charcoal/40 transition-all"
              />
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-charcoal text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-charcoal/90 hover:-translate-y-1 hover:shadow-lg transition-all"
           >
             <Plus size={20} /> <span className="hidden md:inline">Add Account</span><span className="md:hidden">Add</span>
           </button>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCredentials.map((cred) => (
          <div key={cred.id} className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/50 hover:border-peach/50 hover:bg-white/60 hover:shadow-xl transition-all group relative overflow-hidden">
             
             {/* Delete Button (Hidden by default) */}
             <button 
                onClick={() => onDelete(cred.id)}
                className="absolute top-4 right-4 p-2 text-terra/60 hover:text-terra hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                title="Delete credential"
             >
               <Trash2 size={18} />
             </button>

             <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/80 to-white/20 shadow-inner flex items-center justify-center text-2xl font-bold text-charcoal border border-white/50">
                   {cred.serviceName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-charcoal">{cred.serviceName}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/40 bg-white/30 px-2 py-1 rounded-md">{cred.category}</span>
                </div>
             </div>

             <div className="space-y-3">
               {/* Email Row */}
               <div className="bg-white/30 p-3 rounded-xl flex items-center justify-between group/field border border-white/20">
                  <div className="flex items-center gap-3 overflow-hidden">
                     <AtSign size={16} className="text-charcoal/40 flex-shrink-0" />
                     <span className="text-sm font-medium text-charcoal truncate">{cred.email}</span>
                  </div>
                  <button onClick={() => copyToClipboard(cred.email)} className="text-charcoal/40 hover:text-charcoal transition-colors p-1">
                    <Copy size={16} />
                  </button>
               </div>

               {/* Password Row */}
               <div className="bg-white/30 p-3 rounded-xl flex items-center justify-between group/field border border-white/20">
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                     <Key size={16} className="text-charcoal/40 flex-shrink-0" />
                     <span className={`text-sm font-medium text-charcoal truncate ${!visiblePasswords.has(cred.id) ? 'font-mono tracking-widest' : ''}`}>
                       {visiblePasswords.has(cred.id) ? cred.password : '••••••••••••'}
                     </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleVisibility(cred.id)} className="text-charcoal/40 hover:text-charcoal transition-colors p-1">
                      {visiblePasswords.has(cred.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={() => copyToClipboard(cred.password)} className="text-charcoal/40 hover:text-charcoal transition-colors p-1">
                      <Copy size={16} />
                    </button>
                  </div>
               </div>
             </div>
          </div>
        ))}
      </div>

      {filteredCredentials.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <p className="text-xl font-bold text-charcoal">No accounts found.</p>
          <p className="text-sm">Add a new credential to get started.</p>
        </div>
      )}

      {/* Add Credential Modal (Inline for simplicity) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/20 backdrop-blur-sm">
           <div className="bg-bone rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/50 relative animate-in fade-in zoom-in-95 duration-200">
              <div className="p-8">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="text-2xl font-black text-charcoal">Add Credential</h3>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={20}/></button>
                 </div>
                 
                 <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-charcoal/50 mb-1 ml-1">Service Name</label>
                      <input 
                        required
                        className="w-full bg-white/50 p-4 rounded-xl font-medium outline-none focus:ring-2 focus:ring-peach/50"
                        placeholder="e.g. Netflix"
                        value={newCred.serviceName}
                        onChange={e => setNewCred({...newCred, serviceName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-charcoal/50 mb-1 ml-1">Email / Username</label>
                      <input 
                        required
                        className="w-full bg-white/50 p-4 rounded-xl font-medium outline-none focus:ring-2 focus:ring-peach/50"
                        placeholder="user@example.com"
                        value={newCred.email}
                        onChange={e => setNewCred({...newCred, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-charcoal/50 mb-1 ml-1">Password</label>
                      <input 
                        required
                        type="password"
                        className="w-full bg-white/50 p-4 rounded-xl font-medium outline-none focus:ring-2 focus:ring-peach/50"
                        placeholder="••••••••"
                        value={newCred.password}
                        onChange={e => setNewCred({...newCred, password: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-charcoal/50 mb-1 ml-1">Category</label>
                      <input 
                        className="w-full bg-white/50 p-4 rounded-xl font-medium outline-none focus:ring-2 focus:ring-peach/50"
                        placeholder="e.g. Work, Personal"
                        value={newCred.category}
                        onChange={e => setNewCred({...newCred, category: e.target.value})}
                      />
                    </div>
                    
                    <div className="pt-4">
                      <button type="submit" className="w-full bg-charcoal text-white font-bold py-4 rounded-xl hover:bg-charcoal/90 transition-all shadow-lg">
                        Save to Vault
                      </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PasswordVault;