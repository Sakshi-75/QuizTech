interface CalendarHeatmapProps {
  compact?: boolean;
}

export default function CalendarHeatmap({ compact = false }: CalendarHeatmapProps) {
  // Generate calendar days for current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Mock completed days (in a real app, this would come from API)
  const completedDays = [1, 2, 3, 4, 8, 9, 10, 11];
  
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  if (compact) {
    // Compact version for home page
    const weekDays = ['Su', 'M', 'Tu', 'We', 'Th', 'Fr', 'S'];
    const visibleDays = days.slice(0, 21); // Show first 3 weeks
    
    return (
      <div className="grid grid-cols-7 gap-1 text-xs">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-gray-400 font-medium">
            {day}
          </div>
        ))}
        
        {visibleDays.map((day, index) => (
          <div
            key={index}
            className={`w-6 h-6 flex items-center justify-center calendar-day ${
              day && completedDays.includes(day)
                ? "bg-primary rounded-full text-white font-medium completed"
                : "text-gray-600"
            }`}
          >
            {day && completedDays.includes(day) ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            ) : (
              day
            )}
          </div>
        ))}
      </div>
    );
  }

  // Full calendar for profile page
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="bg-white rounded-xl p-4">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-gray-600 font-medium text-sm py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            className={`h-10 flex items-center justify-center rounded-lg calendar-day ${
              day && completedDays.includes(day)
                ? "bg-primary text-white font-medium completed"
                : day ? "text-gray-700 hover:bg-gray-50" : ""
            }`}
          >
            {day && completedDays.includes(day) ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            ) : (
              day
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
