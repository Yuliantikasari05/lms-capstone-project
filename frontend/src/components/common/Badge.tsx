import React from 'react';

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const getBadgeStyle = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'mentor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'siswa':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'karyawan':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'lembaga_bimbingan':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'admin': return '⚙️';
      case 'mentor': return '🎓';
      case 'siswa': return '📚';
      case 'karyawan': return '💼';
      case 'lembaga_bimbingan': return '🏛️';
      default: return '👤';
    }
  };

  const getRoleLabel = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'Administrator';
      case 'mentor': return 'Mentor';
      case 'siswa': return 'Siswa';
      case 'karyawan': return 'Karyawan';
      case 'lembaga_bimbingan': return 'Lembaga Bimbingan';
      default: return roleName;
    }
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full border ${getBadgeStyle(role)} ${sizeClass}`}>
      <span>{getRoleIcon(role)}</span>
      <span>{getRoleLabel(role)}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-rose-50 text-rose-700 border-rose-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          isActive ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />
      {isActive ? 'Aktif' : 'Nonaktif'}
    </span>
  );
};
