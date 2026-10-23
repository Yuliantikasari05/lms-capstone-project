import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface FeatureStatusBannerProps {
  title: string;
  category: 'production' | 'blueprint';
  description: string;
  roleScope: string;
}

export const FeatureStatusBanner: React.FC<FeatureStatusBannerProps> = ({
  title,
  category,
  description,
  roleScope,
}) => {
  return (
    <div
      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
        category === 'production'
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`p-2 rounded-lg mt-0.5 ${
            category === 'production'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-indigo-100 text-indigo-700'
          }`}
        >
          {category === 'production' ? (
            <ShieldCheck className="w-5 h-5" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold">{title}</h4>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                category === 'production'
                  ? 'bg-emerald-200/80 text-emerald-800'
                  : 'bg-indigo-200/80 text-indigo-800'
              }`}
            >
              {category === 'production' ? 'Status: Terintegrasi API & RBAC' : 'Status: Cetak Biru Laporan Capstone'}
            </span>
          </div>
          <p className="text-xs opacity-85 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="sm:text-right shrink-0">
        <span className="text-[11px] font-mono text-slate-500 block">Wewenang Role:</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 inline-flex items-center mt-0.5">
          <CheckCircle2 className="w-3 h-3 mr-1 text-blue-600" />
          {roleScope}
        </span>
      </div>
    </div>
  );
};
