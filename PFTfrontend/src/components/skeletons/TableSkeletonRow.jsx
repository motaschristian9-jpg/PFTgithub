import React from "react";

const TableSkeletonRow = () => (
    <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 animate-pulse bg-white">
      {/* Date */}
      <div className="col-span-2 h-4 bg-gray-100 rounded w-24"></div>
      
      {/* Name & Description */}
      <div className="col-span-3 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-32"></div>
        <div className="h-3 bg-gray-100 rounded w-20"></div>
      </div>
      
      {/* Category */}
      <div className="col-span-2 h-6 bg-gray-100 rounded w-20"></div>
      
      {/* Amount */}
      <div className="col-span-2 h-4 bg-gray-100 rounded w-16"></div>
      
      {/* Type */}
      <div className="col-span-1 h-5 bg-gray-100 rounded w-12"></div>
      
      {/* Actions */}
      <div className="col-span-2 flex justify-end space-x-2">
        <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
        <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
);

export default TableSkeletonRow;
