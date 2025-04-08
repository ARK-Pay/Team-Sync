import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, isToday, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ onScheduleTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  // Navigation handlers
  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Date selection handler
  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onScheduleTask) {
      onScheduleTask(date);
    }
  };

  return (
    <div className="p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, dayIdx) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          
          return (
            <button
              key={dayIdx}
              onClick={() => handleDateClick(day)}
              className={`
                h-12 text-sm p-1 border border-transparent rounded-lg transition-colors
                ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                ${isToday(day) ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
                ${isSelected ? 'bg-blue-100 border-blue-200' : 'hover:bg-gray-50'}
              `}
            >
              <span className="flex items-center justify-center h-full">
                {format(day, 'd')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => handleDateClick(new Date())}
          className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );
};

export default Calendar;