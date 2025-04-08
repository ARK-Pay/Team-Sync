import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays, isSameWeek } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faPlus, faCalendarAlt, faCalendarWeek, faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`http://localhost:3001/task/user/${userId}`);
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      const taskData = {
        ...newTask,
        userId,
        status: 'pending'
      };

      const response = await axios.post('http://localhost:3001/task/create', taskData);
      if (response.data.success) {
        setTasks([...tasks, response.data.task]);
        setShowAddTask(false);
        setNewTask({
          title: '',
          description: '',
          dueDate: '',
          priority: 'medium'
        });
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      isSameDay(new Date(task.dueDate), date)
    );
  };

  const renderCalendar = () => {
    if (viewMode === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const days = eachDayOfInterval({ start, end });

      return (
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg shadow-sm">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-600 tracking-wider uppercase bg-white border-b border-gray-100">
                {day}
              </div>
            ))}
            {days.map(day => {
              const dayTasks = getTasksForDate(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);
              return (
                <div
                  key={day.toString()}
                  onClick={() => {
                    setSelectedDate(day);
                    setShowAddTask(true);
                    setNewTask(prev => ({ ...prev, dueDate: format(day, 'yyyy-MM-dd') }));
                  }}
                  className={`
                    relative p-2 bg-white cursor-pointer transition-all min-h-[120px]
                    ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                    ${isToday ? 'bg-blue-50 ring-2 ring-blue-200' : ''}
                    hover:bg-gray-50 group
                  `}
                >
                  <div className={`flex items-center justify-between mb-1`}>
                    <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                      {format(day, 'd')}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {dayTasks.length > 0 && (
                    <div className="mt-1 space-y-1 max-h-[80px] overflow-auto">
                      {dayTasks.map(task => (
                        <div
                          key={task._id}
                          className={`text-xs p-2 rounded-md truncate mb-1 cursor-pointer shadow-sm
                            ${task.priority === 'high' ? 'bg-red-50 text-red-700 border-l-2 border-red-500' :
                              task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-l-2 border-amber-500' :
                                'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500'
                            } hover:opacity-90 transition-all`}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );

    }

    if (viewMode === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      const days = eachDayOfInterval({ start, end });

      return (
        <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg shadow-sm h-full">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-600 tracking-wider uppercase bg-white border-b border-gray-100">
              {day}
            </div>
          ))}
          {days.map(day => {
            const dayTasks = getTasksForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);
            return (
              <div
                key={day.toString()}
                onClick={() => {
                  setSelectedDate(day);
                  setShowAddTask(true);
                  setNewTask(prev => ({ ...prev, dueDate: format(day, 'yyyy-MM-dd') }));
                }}
                className={`
                  relative p-2 bg-white cursor-pointer transition-all h-full min-h-[120px]
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                  ${isToday ? 'bg-blue-50 ring-2 ring-blue-200' : ''}
                  hover:bg-gray-50 group
                `}
              >
                <div className={`flex items-center justify-between mb-1`}>
                  <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {dayTasks.length > 0 && (
                  <div className="mt-1 space-y-1 max-h-[80px] overflow-auto">
                    {dayTasks.map(task => (
                      <div
                        key={task._id}
                        className={`text-xs p-2 rounded-md truncate mb-1 cursor-pointer shadow-sm
                          ${task.priority === 'high' ? 'bg-red-50 text-red-700 border-l-2 border-red-500' :
                            task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-l-2 border-amber-500' :
                              'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500'
                          } hover:opacity-90 transition-all`}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (viewMode === 'day') {
      const dayTasks = getTasksForDate(currentDate);
      return (
        <div className="space-y-4">
          <div className="text-xl font-semibold text-gray-800">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </div>
          {dayTasks.length > 0 ? (
            <div className="space-y-3">
              {dayTasks.map(task => (
                <div
                  key={task._id}
                  className={`p-4 rounded-lg shadow-sm ${task.priority === 'high' ? 'bg-red-50 border-red-200' :
                    task.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200'
                  } border`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{task.title}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{task.description}</div>
                  <div className="mt-3 text-xs text-gray-500">
                    Due: {format(new Date(task.dueDate), 'h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-lg">No tasks scheduled for today</div>
              <button
                onClick={() => {
                  setSelectedDate(currentDate);
                  setShowAddTask(true);
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Task
              </button>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-6">
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setShowAddTask(true);
            }}
            className="w-full flex items-center px-4 py-3 bg-white text-gray-800 rounded-lg hover:shadow-md border border-gray-200 transition-all"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-3" />
            Create
          </button>
        </div>
        {/* Main Calendar Container */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => {
                  if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
                  if (viewMode === 'week') setCurrentDate(subDays(currentDate, 7));
                  if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
                }}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-600 hover:text-gray-900"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button
                onClick={() => {
                  if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
                  if (viewMode === 'week') setCurrentDate(addDays(currentDate, 7));
                  if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
                }}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-600 hover:text-gray-900"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
              <h2 className="text-xl font-semibold text-gray-800">
                {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                {viewMode === 'week' && `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`}
                {viewMode === 'day' && format(currentDate, 'MMMM d, yyyy')}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 text-sm font-medium ${viewMode === 'month' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 text-sm font-medium ${viewMode === 'week' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-4 py-2 text-sm font-medium ${viewMode === 'day' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Day
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {renderCalendar()}

      {showAddTask && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-100">
            <h3 className="text-xl font-semibold mb-4">
              Add Task for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Today'}
            </h3>
            <form onSubmit={handleAddTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;