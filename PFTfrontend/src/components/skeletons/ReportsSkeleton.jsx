import React from "react";

const SkeletonPulse = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

const ReportsSkeleton = () => {
    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
             {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                <SkeletonPulse className="h-8 w-48 mb-2" />
                <SkeletonPulse className="h-4 w-64" />
                </div>
                <SkeletonPulse className="h-10 w-32 rounded-lg" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                         <SkeletonPulse className="h-4 w-24 mb-4" />
                         <SkeletonPulse className="h-8 w-32 mb-2" />
                         <SkeletonPulse className="h-4 w-full" />
                    </div>
                ))}
            </div>

            {/* Filters */}
             <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                 <SkeletonPulse className="h-10 w-32 rounded-lg" />
                 <SkeletonPulse className="h-10 w-32 rounded-lg" />
             </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px]">
                      <SkeletonPulse className="h-6 w-32 mb-6" />
                      <div className="flex justify-center items-center h-[300px]">
                           <SkeletonPulse className="h-48 w-48 rounded-full" />
                      </div>
                 </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px]">
                      <SkeletonPulse className="h-6 w-32 mb-6" />
                       <div className="flex items-end gap-4 h-[300px] justify-between px-4">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonPulse key={i} className={`w-full rounded-t-sm h-[${Math.floor(Math.random() * 50 + 30)}%]`} />
                        ))}
                    </div>
                 </div>
            </div>
            
            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                     <SkeletonPulse className="h-6 w-32" />
                </div>
                <div className="p-6 space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <SkeletonPulse key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReportsSkeleton;
