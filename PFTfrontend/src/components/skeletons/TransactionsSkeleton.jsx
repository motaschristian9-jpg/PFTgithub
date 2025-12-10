import React from "react";

const SkeletonPulse = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

const TransactionsSkeleton = () => {
    return (
        <div className="space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto">
             {/* Header */}
             <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                   <SkeletonPulse className="h-8 w-48 mb-2" />
                   <SkeletonPulse className="h-4 w-64" />
                </div>
                <SkeletonPulse className="h-10 w-40 rounded-lg" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                             <div>
                                 <SkeletonPulse className="h-4 w-24 mb-2" />
                                 <SkeletonPulse className="h-8 w-32" />
                             </div>
                             <SkeletonPulse className="h-10 w-10 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
             <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
                 <div className="flex flex-col md:flex-row gap-4 justify-between">
                      <SkeletonPulse className="h-10 w-full md:w-64" />
                      <div className="flex gap-2">
                          <SkeletonPulse className="h-10 w-32" />
                          <SkeletonPulse className="h-10 w-32" />
                      </div>
                 </div>
                 <div className="flex gap-2 overflow-x-auto pb-2">
                      {[...Array(5)].map((_, i) => (
                          <SkeletonPulse key={i} className="h-8 w-24 rounded-full flex-shrink-0" />
                      ))}
                 </div>
             </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                 <div className="p-6 border-b border-gray-100">
                     <SkeletonPulse className="h-6 w-32" />
                 </div>
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100">
                      <SkeletonPulse className="col-span-2 h-4 w-16" />
                      <SkeletonPulse className="col-span-3 h-4 w-24" />
                      <SkeletonPulse className="col-span-2 h-4 w-16" />
                      <SkeletonPulse className="col-span-2 h-4 w-16" />
                      <SkeletonPulse className="col-span-1 h-4 w-12" />
                      <SkeletonPulse className="col-span-2 h-4 w-16 ml-auto" />
                  </div>
                 {/* Table Rows */}
                 <div className="divide-y divide-gray-100">
                     {[...Array(5)].map((_, i) => (
                         <div key={i} className="grid grid-cols-12 gap-4 p-4">
                              <SkeletonPulse className="col-span-2 h-4 w-24" />
                              <div className="col-span-3 space-y-2">
                                   <SkeletonPulse className="h-4 w-32" />
                                   <SkeletonPulse className="h-3 w-20" />
                              </div>
                              <SkeletonPulse className="col-span-2 h-6 w-20 rounded" />
                              <SkeletonPulse className="col-span-2 h-4 w-16" />
                              <SkeletonPulse className="col-span-1 h-5 w-12 rounded" />
                               <div className="col-span-2 flex justify-end gap-2">
                                   <SkeletonPulse className="h-8 w-8 rounded" />
                                   <SkeletonPulse className="h-8 w-8 rounded" />
                               </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

export default TransactionsSkeleton;
