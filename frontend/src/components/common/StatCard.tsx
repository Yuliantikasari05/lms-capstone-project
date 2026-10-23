import React from 'react';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  BookOpen, 
  Award, 
  ClipboardCheck, 
  Video, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  CalendarCheck,
  ShieldCheck,
  Star
} from 'lucide-react';
import { OverviewCard } from '../../types';

export const StatCard: React.FC<{ card: OverviewCard }> = ({ card }) => {
  const getIcon = (iconName: string) => {
    const props = { className: 'w-6 h-6' };
    switch (iconName) {
      case 'users':
      case 'user-group':
        return <Users {...props} />;
      case 'user-check':
        return <UserCheck {...props} />;
      case 'academic':
      case 'academic-cap':
        return <GraduationCap {...props} />;
      case 'book-open':
        return <BookOpen {...props} />;
      case 'award':
      case 'badge-check':
        return <Award {...props} />;
      case 'clipboard-check':
        return <ClipboardCheck {...props} />;
      case 'video':
      case 'presentation':
        return <Video {...props} />;
      case 'check-circle':
        return <CheckCircle {...props} />;
      case 'clock':
        return <Clock {...props} />;
      case 'calendar-check':
        return <CalendarCheck {...props} />;
      case 'shield-check':
        return <ShieldCheck {...props} />;
      case 'star':
        return <Star {...props} />;
      default:
        return <TrendingUp {...props} />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-50 text-blue-600', border: 'border-blue-100' };
      case 'emerald':
        return { bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' };
      case 'purple':
        return { bg: 'bg-purple-50 text-purple-600', border: 'border-purple-100' };
      case 'amber':
        return { bg: 'bg-amber-50 text-amber-600', border: 'border-amber-100' };
      case 'indigo':
        return { bg: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' };
      default:
        return { bg: 'bg-slate-50 text-slate-600', border: 'border-slate-100' };
    }
  };

  const style = getColorClasses(card.color);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{card.value}</h3>
        </div>
        <div className={`p-3 rounded-lg border ${style.bg} ${style.border}`}>
          {getIcon(card.icon)}
        </div>
      </div>
      <div className="mt-3 flex items-center text-xs font-medium text-slate-500">
        <span className="text-emerald-600 font-semibold mr-1">{card.change}</span>
      </div>
    </div>
  );
};
