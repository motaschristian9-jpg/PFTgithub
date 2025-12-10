import React from "react";

const SkeletonPulse = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

const SettingsSkeleton = () => {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
         <SkeletonPulse className="h-8 w-48 mb-2" />
         <SkeletonPulse className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-2">
            {[...Array(4)].map((_, i) => (
                 <SkeletonPulse key={i} className="h-16 w-full rounded-xl" />
            ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-9">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 min-h-[500px]">
                 <SkeletonPulse className="h-6 w-48 mb-8" />
                 
                 <div className="flex items-center gap-6 mb-8">
                      <SkeletonPulse className="h-24 w-24 rounded-full" />
                      <div className="space-y-2">
                           <SkeletonPulse className="h-8 w-32" />
                           <SkeletonPulse className="h-4 w-48" />
                      </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-4">
                      <div className="space-y-2">
                           <SkeletonPulse className="h-4 w-24" />
                           <SkeletonPulse className="h-10 w-full" />
                      </div>
                       <div className="space-y-2">
                           <SkeletonPulse className="h-4 w-24" />
                           <SkeletonPulse className="h-10 w-full" />
                      </div>
                       <div className="col-span-1 md:col-span-2 space-y-2">
                           <SkeletonPulse className="h-4 w-24" />
                           <SkeletonPulse className="h-32 w-full" />
                      </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSkeleton;
