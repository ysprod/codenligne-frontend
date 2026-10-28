'use client';

import { api } from '@/lib/api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Shield, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface Collaborator {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  role: string;
  status: string;
}

export default function AdminCollaborateursPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  
  const queryClient = useQueryClient();

  const { data: collaborators, isLoading } = useQuery<Collaborator[]>({
    queryKey: ['admin', 'collaborators'],
    queryFn: async () => {
      const res = await api.get<Collaborator[]>('/users/collaborators');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/users/collaborators', {
        firstName, lastName, username, email, phone, password, role,
        acceptedTerms: true, // Par défaut, un collaborateur accepte les CGU
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'collaborators'] });
      alert('Collaborateur créé avec succès !');
      setFirstName(''); setLastName(''); setUsername(''); setEmail(''); setPhone(''); setPassword('');
    },
    onError: (e: any) => alert(e.response?.data?.message || e.message),
  });

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">Gestion des collaborateurs</h1>
        <p className="text-ink-soft mt-1">Créez et gérez les comptes administrateurs et pédagogiques.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulaire de création */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> Nouveau collaborateur
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prénom</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-2 border border-border-strong rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-2 border border-border-strong rounded-md" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nom d&apos;utilisateur</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border border-border-strong rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Téléphone (obligatoire)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border border-border-strong rounded-md" placeholder="+225..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email (facultatif)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border border-border-strong rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border border-border-strong rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rôle</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 border border-border-strong rounded-md bg-white">
              <option value="ADMIN">Administrateur</option>
              <option value="PEDAGOGICAL_MANAGER">Gestionnaire pédagogique</option>
            </select>
          </div>
          <button
            onClick={() => createMutation.mutate()}
            disabled={!firstName || !lastName || !username || !phone || !password || createMutation.isPending}
            className="btn-primary w-full"
          >
            <Plus className="w-5 h-5 mr-2" /> Créer le collaborateur
          </button>
        </div>

        {/* Liste des collaborateurs */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" /> Collaborateurs actuels
          </h2>
          {isLoading ? (
            <p className="text-sm text-ink-soft">Chargement...</p>
          ) : collaborators && collaborators.length > 0 ? (
            <ul className="divide-y divide-border">
              {collaborators.map((c) => (
                <li key={c._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-ink">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-ink-soft">@{c.username} • {c.role}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    c.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 
                    c.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {c.role}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft italic">Aucun collaborateur enregistré.</p>
          )}
        </div>
      </div>
    </div>
  );
}