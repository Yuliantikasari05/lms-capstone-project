import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Database, Bell, CheckCheck, Info, AlertCircle, Award, Calendar, DollarSign, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';
import { notificationService, SystemNotification } from '../../services/notificationService';

export const Navbar: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notificationService
      .getNotifications()
      .then((data) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, [role]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'certification':
        return <Award className="w-4 h-4 text-purple-600" />;
      case 'schedule':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'revenue':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'grade':
      case 'exam_review':
        return <CheckCheck className="w-4 h-4 text-indigo-600" />;
      case 'submission':
      case 'evaluation':
        return <BookOpen className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3.5">
        {/* Environment Tag */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-mono border border-slate-200">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>PostgreSQL 18</span>
        </div>

        {/* Sanctum Auth State */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sanctum Verified</span>
        </div>

        {/* System Notifications Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Notifikasi Sistem"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Notifikasi Sistem LMS</h4>
                  <p className="text-[11px] text-slate-400">Pemberitahuan khusus peran Anda</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Tandai dibaca</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Tidak ada notifikasi baru saat ini.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 hover:bg-slate-50 transition flex items-start space-x-3 ${
                        !notif.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 mt-0.5">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 truncate">{notif.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{notif.created_at}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-[10px] text-slate-500 font-medium">
                  Notifikasi disinkronkan sesuai hak akses peran aktif ({role}).
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Role Tag */}
        <RoleBadge role={role || 'siswa'} />

        {/* User Mini Avatar */}
        <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200"
          />
          <span className="text-xs font-medium text-slate-700 hidden lg:inline-block max-w-[120px] truncate">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
};
