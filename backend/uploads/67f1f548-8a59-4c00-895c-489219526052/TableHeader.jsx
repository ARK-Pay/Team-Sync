const TableHeader = () => (
  <tr className="border-b bg-gray-100">
    <th className="text-left py-4 px-6 font-medium text-xs">Name</th>
    <th className="text-left py-4 px-6 font-medium text-xs">Status</th>
    <th className="text-left py-4 px-6 font-medium text-xs">About</th>
    <th className="text-left py-4 px-6 font-medium text-xs">Members</th>
    <th className="text-left py-4 px-6 font-medium text-xs">Progress</th>
    <th className="text-left py-4 px-6 font-medium text-xs">Deadline</th> {/* New column */}
    <th className="w-10"></th>
  </tr>
);

// Export both as named and default export for maximum compatibility
export { TableHeader };
export default TableHeader; ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    );
  };
  
  // Sortable header cell component
  const SortableHeader = ({ column, label }) => {
    const isActive = sortBy === column;
    
    return (
      <th 
        className={`text-left py-3 px-2 md:px-4 font-medium text-xs select-none ${
          handleSort ? 'cursor-pointer hover:bg-gray-50' : ''
        } ${isActive ? theme.text : ''} transition-colors duration-150`}
        onClick={() => handleSort && handleSort(column)}
      >
        <div className="flex items-center">
          {label}
          <SortIcon column={column} />
        </div>
      </th>
    );
  };
  
  return (
    <tr className="border-b bg-gray-100">
      <SortableHeader column="name" label="Name" />
      <SortableHeader column="status" label="Status" />
      <SortableHeader column="description" label="About" />
      <th className="text-left py-3 px-2 md:px-4 font-medium text-xs">Members</th>
      <th className="text-left py-3 px-2 md:px-4 font-medium text-xs">Progress</th>
      <SortableHeader column="deadline" label="Deadline" />
      <SortableHeader column="priority" label="Priority" />
      <th className="w-10"></th>
    </tr>
  );
};

// Export both as named and default export for maximum compatibility
export { TableHeader };
export default TableHeader;
