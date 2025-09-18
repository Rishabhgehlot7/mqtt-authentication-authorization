import React from 'react';

interface SidebarProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ children, isOpen = true, onToggle }) => {
  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-0'}`}>
      <div className="flex h-full flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Sidebar Content */}
        <nav className="flex-1 overflow-y-auto py-4">
          {children}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;