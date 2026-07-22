import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Current Weather Card Skeleton */}
      <div className="h-80 rounded-2xl bg-white border border-slate-200 p-8 flex flex-col justify-between shadow-sm">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 rounded-xl" />
          <div className="h-8 w-24 bg-slate-200 rounded-xl" />
        </div>

        <div className="flex items-center gap-6 my-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-200" />
          <div className="space-y-3">
            <div className="h-16 w-36 bg-slate-200 rounded-2xl" />
            <div className="h-4 w-28 bg-slate-200 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm" />
        <div className="h-96 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm" />
      </div>
    </div>
  );
};
