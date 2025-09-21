import React from "react";
import Header from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  showSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {/* {showSidebar && (
          <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)}>
            {sidebar}
          </Sidebar>
        )} */}

        {/* Main Content */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            false ? "md:ml-0" : "md:-ml-64"
          }`}
        >
          <div className="p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
