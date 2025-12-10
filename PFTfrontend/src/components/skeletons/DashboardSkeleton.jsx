import React from "react";
import { motion } from "framer-motion";

const SkeletonPulse = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <SkeletonPulse className="h-8 w-48 mb-2" />
          <SkeletonPulse className="h-4 w-64" />
        </div>
        <SkeletonPulse className="h-8 w-40 rounded-full" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="h-8 w-8 rounded-full" />
            </div>
            <div className="mt-4">
              <SkeletonPulse className="h-8 w-32 mb-1" />
              <SkeletonPulse className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <SkeletonPulse className="h-6 w-32" />
            <div className="flex gap-2">
              <SkeletonPulse className="h-8 w-20" />
              <SkeletonPulse className="h-8 w-20" />
            </div>
          </div>
          <div className="h-[300px] flex items-end gap-4 justify-between px-4">
             {[...Array(7)].map((_, i) => (
                <SkeletonPulse key={i} className={`w-full rounded-t-sm h-[${Math.floor(Math.random() * 60 + 20)}%]`} />
             ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <SkeletonPulse className="h-6 w-40" />
            <SkeletonPulse className="h-4 w-12" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonPulse className="h-10 w-10 rounded-full" />
                  <div>
                    <SkeletonPulse className="h-4 w-24 mb-1" />
                    <SkeletonPulse className="h-3 w-16" />
                  </div>
                </div>
                <SkeletonPulse className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Budgets & Savings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Budgets */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
             <SkeletonPulse className="h-6 w-32 mb-4" />
             <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i}>
                        <div className="flex justify-between mb-2">
                            <SkeletonPulse className="h-4 w-24" />
                            <SkeletonPulse className="h-4 w-16" />
                        </div>
                        <SkeletonPulse className="h-2 w-full rounded-full" />
                    </div>
                ))}
             </div>
          </div>

          {/* Savings */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
             <SkeletonPulse className="h-6 w-32 mb-4" />
             <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i}>
                        <div className="flex justify-between mb-2">
                            <SkeletonPulse className="h-4 w-24" />
                            <SkeletonPulse className="h-4 w-16" />
                        </div>
                        <SkeletonPulse className="h-2 w-full rounded-full" />
                    </div>
                ))}
             </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
