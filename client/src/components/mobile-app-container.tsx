import { ReactNode } from "react";

interface MobileAppContainerProps {
  children: ReactNode;
  showStatusBar?: boolean;
}

export default function MobileAppContainer({ 
  children, 
  showStatusBar = true 
}: MobileAppContainerProps) {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative">
      {/* Status Bar */}
      {showStatusBar && (
        <div className="mobile-status-bar">
          <span>9:41</span>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-white rounded-full"></div>
              <div className="w-1 h-3 bg-white rounded-full"></div>
              <div className="w-1 h-3 bg-white rounded-full"></div>
              <div className="w-1 h-3 bg-white rounded-full"></div>
            </div>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
            </svg>
            <div className="w-6 h-3 bg-white rounded-sm border border-white">
              <div className="w-5 h-2 bg-white rounded-sm m-0.5"></div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-primary text-white text-center py-6">
        <h1 className="text-2xl font-bold tracking-wider">QUIZTECH</h1>
      </div>

      {/* Main Content */}
      <div className="min-h-screen">
        {children}
      </div>
    </div>
  );
}
