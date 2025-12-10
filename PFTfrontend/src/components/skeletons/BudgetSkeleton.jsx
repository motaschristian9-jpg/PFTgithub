import React from "react";

const SkeletonPulse = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

const BudgetSkeleton = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Budget Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <SkeletonPulse className="h-8 w-48 mb-2" />
          <SkeletonPulse className="h-4 w-64" />
        </div>
        <SkeletonPulse className="h-10 w-32 rounded-lg" />
      </div>

      {/* Budget Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="h-8 w-8 rounded-lg" />
            </div>
            <SkeletonPulse className="h-8 w-32 mb-1" />
            <SkeletonPulse className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Budget Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[300px]">
             <div className="flex justify-between mb-6">
                <SkeletonPulse className="h-6 w-32" />
                <SkeletonPulse className="h-8 w-24" />
             </div>
             <div className="flex items-end gap-4 h-[200px] justify-between px-4">
                {[...Array(6)].map((_, i) => (
                     <SkeletonPulse key={i} className={`w-full rounded-t-sm h-[${Math.floor(Math.random() * 50 + 30)}%]`} />
                ))}
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[300px]">
              <SkeletonPulse className="h-6 w-32 mb-6" />
              <div className="flex justify-center items-center h-[200px]">
                  <SkeletonPulse className="h-40 w-40 rounded-full" />
              </div>
          </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
         <SkeletonPulse className="h-10 w-full sm:w-64 rounded-lg" />
         <div className="flex gap-2 w-full sm:w-auto">
             <SkeletonPulse className="h-10 w-24 rounded-lg" />
             <SkeletonPulse className="h-10 w-24 rounded-lg" />
         </div>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <SkeletonPulse className="h-12 w-12 rounded-xl" />
                        <div>
                            <SkeletonPulse className="h-5 w-40 mb-2" />
                            <SkeletonPulse className="h-3 w-24" />
                        </div>
                    </div>
                    <SkeletonPulse className="h-8 w-24 rounded-full" />
                </div>
                <div className="space-y-2">
                     <div className="flex justify-between">
                        <SkeletonPulse className="h-4 w-20" />
                        <SkeletonPulse className="h-4 w-20" />
                     </div>
                     <SkeletonPulse className="h-3 w-full rounded-full" />
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetSkeleton;
