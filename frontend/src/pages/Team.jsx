import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { garageApi } from '../api/index.js';
import { Users, UserPlus, Crown, Shield, User, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const roleLabels = {
  owner: { label: 'Propriétaire', icon: Crown, color: 'text-[#FF9F0A]' },
  admin: { label: 'Administrateur', icon: Shield, color: 'text-[#007AFF]' },
  staff: { label: 'Collaborateur', icon: User, color: 'text-white/60' },
};

export default function Team() {
  const queryClient = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => garageApi.getMembers(),
  });

  const { data: garageData } = useQuery({
    queryKey: ['garage'],
    queryFn: () => garageApi.getGarage(),
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }) => garageApi.inviteMember(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Invitation envoyée !');
      setShowInviteModal(false);
      setInviteEmail('');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l\'invitation');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId) => garageApi.removeMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Membre supprimé');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  const members = membersData?.data || [];
  const garage = garageData?.data;

  const handleInvite = () => {
    if (!inviteEmail) return;
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Équipe</h1>
          <p className="text-white/50 mt-1">{members.length} membre{members.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-3 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-[#007AFF]/90 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Inviter un membre
        </button>
      </div>

      {/* Members List */}
      <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]">
          <h3 className="font-semibold text-white">Membres de l'équipe</h3>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {members.map((member) => {
            const roleConfig = roleLabels[member.role] || roleLabels.staff;
            const RoleIcon = roleConfig.icon;

            return (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#007AFF]/30 to-[#BF5AF2]/30 flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {(member.user_name || member.user_email)?.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {member.user_name || member.user_email.split('@')[0]}
                  </p>
                  <p className="text-sm text-white/50 truncate">{member.user_email}</p>
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] ${roleConfig.color}`}>
                  <RoleIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{roleConfig.label}</span>
                </div>

                {member.role !== 'owner' && (
                  <button
                    onClick={() => removeMutation.mutate(member.id)}
                    disabled={removeMutation.isPending}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}

          {members.length === 0 && (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">Aucun membre dans l'équipe</p>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#151921] rounded-xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Inviter un membre</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Adresse email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
                  placeholder="collaborateur@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">Rôle</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#007AFF]/50"
                >
                  <option value="staff">Collaborateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail || inviteMutation.isPending}
                className="px-4 py-2 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-[#007AFF]/90 disabled:opacity-50"
              >
                {inviteMutation.isPending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}