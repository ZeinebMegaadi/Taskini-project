import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './CalendarPage.css';

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [view, setView] = useState('month'); // 'month' or 'week'
  const [currentWeek, setCurrentWeek] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTasks();
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calendar navigation
  const navigateMonth = (direction) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateWeek = (direction) => {
    setCurrentWeek(prev => prev + direction);
  };

  const navigateToToday = () => {
    setSelectedDate(new Date());
    setCurrentWeek(0);
  };

  // Task management functions
  const handleCreateTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      if (response.data.success) {
        setTasks([response.data.data, ...tasks]);
        setShowTaskForm(false);
        fetchTasks(); // Refresh to get all tasks
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const response = await api.put(`/tasks/${editingTask._id}`, taskData);
      if (response.data.success) {
        setTasks(tasks.map(task => 
          task._id === editingTask._id ? response.data.data : task
        ));
        setEditingTask(null);
        setShowTaskForm(false);
        setShowTaskDetails(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await api.delete(`/tasks/${taskId}`);
        if (response.data.success) {
          setTasks(tasks.filter(task => task._id !== taskId));
          setShowTaskDetails(false);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleQuickStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (response.data.success) {
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        ));
        if (selectedTask && selectedTask._id === taskId) {
          setSelectedTask({ ...selectedTask, status: newStatus });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  // Calendar calculations
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getWeekDates = () => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() + currentWeek * 7 - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getTasksForSelectedDate = () => {
    return getTasksForDate(selectedDate);
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks
      .filter(task => new Date(task.dueDate) >= today)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    // Auto-create task for this date
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleTaskClick = (task, e) => {
    if (e) e.stopPropagation();
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
    setShowTaskDetails(false);
  };

  const handleFormSubmit = (taskData) => {
    if (editingTask) {
      handleUpdateTask(taskData);
    } else {
      // Set the due date to the selected date if creating new task
      const taskWithDate = {
        ...taskData,
        dueDate: selectedDate.toISOString()
      };
      handleCreateTask(taskWithDate);
    }
  };

  // Stats calculations
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const overdue = tasks.filter(task => 
      new Date(task.dueDate) < new Date() && task.status !== 'completed'
    ).length;
    const today = tasks.filter(task => 
      new Date(task.dueDate).toDateString() === new Date().toDateString()
    ).length;

    return { total, completed, overdue, today };
  };

  const stats = getTaskStats();
  const upcomingTasks = getUpcomingTasks();
  const weekDates = getWeekDates();

  if (loading) {
    return (
      <div className="calendar-page">
        <div className="loading-message">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      {/* Header */}
      <div className="calendar-header">
        <div className="header-main">
          <h1>Calendar</h1>
          <div className="view-controls">
            <button 
              className={`view-btn ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button 
              className={`view-btn ${view === 'week' ? 'active' : ''}`}
              onClick={() => setView('week')}
            >
              Week
            </button>
          </div>
        </div>
        
        <div className="calendar-controls">
          <button className="btn-today" onClick={navigateToToday}>
            Today
          </button>
          <div className="navigation">
            <button className="nav-btn" onClick={() => view === 'month' ? navigateMonth(-1) : navigateWeek(-1)}>
              ←
            </button>
            <h2 className="current-period">
              {view === 'month' 
                ? selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                : `Week of ${weekDates[0].toLocaleDateString()}`
              }
            </h2>
            <button className="nav-btn" onClick={() => view === 'month' ? navigateMonth(1) : navigateWeek(1)}>
              →
            </button>
          </div>
          <button 
            className="btn-create"
            onClick={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
          >
            + New Task
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="calendar-content">
        {/* Sidebar with stats and upcoming tasks */}
        <div className="calendar-sidebar">
          <div className="stats-card">
            <h3>Task Overview</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.completed}</div>
                <div className="stat-label">Done</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.overdue}</div>
                <div className="stat-label">Overdue</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.today}</div>
                <div className="stat-label">Today</div>
              </div>
            </div>
          </div>

          <div className="upcoming-tasks">
            <h3>Upcoming Tasks</h3>
            {upcomingTasks.length > 0 ? (
              <div className="task-list">
                {upcomingTasks.map(task => (
                  <div 
                    key={task._id} 
                    className="upcoming-task-item"
                    onClick={(e) => handleTaskClick(task, e)}
                  >
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <span className="task-date">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`status-indicator ${task.status}`}></span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-tasks">No upcoming tasks</p>
            )}
            <button 
              className="btn-view-all"
              onClick={() => navigate('/tasks')}
            >
              View All Tasks →
            </button>
          </div>
        </div>

        {/* Main Calendar */}
        <div className="calendar-main">
          {view === 'month' ? (
            <div className="month-view">
              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
                
                {Array.from({ length: getFirstDayOfMonth(selectedDate) }).map((_, index) => (
                  <div key={`empty-${index}`} className="calendar-day empty"></div>
                ))}
                
                {Array.from({ length: getDaysInMonth(selectedDate) }, (_, i) => i + 1).map(day => {
                  const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                  const dayTasks = getTasksForDate(date);
                  const isToday = new Date().toDateString() === date.toDateString();
                  const isSelected = selectedDate.toDateString() === date.toDateString();
                  
                  return (
                    <div 
                      key={day} 
                      className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayTasks.length > 0 ? 'has-tasks' : ''}`}
                      onClick={() => handleDateClick(date)}
                    >
                      <div className="day-header">
                        <span className="day-number">{day}</span>
                        {dayTasks.length > 0 && (
                          <span className="task-count">{dayTasks.length}</span>
                        )}
                      </div>
                      <div className="day-tasks">
                        {dayTasks.slice(0, 3).map(task => (
                          <div
                            key={task._id}
                            className={`task-item ${task.status} ${task.priority}`}
                            onClick={(e) => handleTaskClick(task, e)}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="more-tasks">+{dayTasks.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="week-view">
              <div className="week-grid">
                <div className="time-column">
                  <div className="time-header">Time</div>
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="time-slot">{i + 8}:00</div>
                  ))}
                </div>
                {weekDates.map(date => (
                  <div key={date.toISOString()} className="day-column">
                    <div className="day-header">
                      <div className="day-name">{date.toLocaleDateString('en', { weekday: 'short' })}</div>
                      <div className="day-date">{date.getDate()}</div>
                    </div>
                    <div className="time-slots">
                      {Array.from({ length: 12 }, (_, i) => {
                        const hour = i + 8;
                        const hourTasks = tasks.filter(task => {
                          const taskDate = new Date(task.dueDate);
                          return taskDate.toDateString() === date.toDateString() && 
                                 taskDate.getHours() === hour;
                        });
                        
                        return (
                          <div 
                            key={i} 
                            className="time-slot"
                            onClick={() => {
                              const newDate = new Date(date);
                              newDate.setHours(hour, 0, 0, 0);
                              handleDateClick(newDate);
                            }}
                          >
                            {hourTasks.map(task => (
                              <div
                                key={task._id}
                                className={`time-task ${task.status}`}
                                onClick={(e) => handleTaskClick(task, e)}
                              >
                                {task.title}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowTaskDetails(false)}>
          <div className="task-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Task Details</h3>
              <button className="modal-close" onClick={() => setShowTaskDetails(false)}>×</button>
            </div>
            <div className="task-details-content">
              <div className="detail-row">
                <strong>Title:</strong>
                <span>{selectedTask.title}</span>
              </div>
              <div className="detail-row">
                <strong>Description:</strong>
                <span>{selectedTask.description || 'No description'}</span>
              </div>
              <div className="detail-row">
                <strong>Due Date:</strong>
                <span>{new Date(selectedTask.dueDate).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <strong>Priority:</strong>
                <span className={`priority-badge ${selectedTask.priority}`}>
                  {selectedTask.priority}
                </span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <select 
                  value={selectedTask.status}
                  onChange={(e) => handleQuickStatusUpdate(selectedTask._id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => handleEditTask(selectedTask)}>
                Edit Task
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteTask(selectedTask._id)}>
                Delete
              </button>
              <button className="btn btn-secondary" onClick={() => setShowTaskDetails(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="modal-overlay" onClick={() => setShowTaskForm(false)}>
          <div className="task-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
              <button className="modal-close" onClick={() => setShowTaskForm(false)}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const taskData = {
                title: formData.get('title'),
                description: formData.get('description'),
                dueDate: formData.get('dueDate'),
                priority: formData.get('priority'),
                status: formData.get('status')
              };
              handleFormSubmit(taskData);
            }}>
              <div className="form-group">
                <label>Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingTask?.title} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  defaultValue={editingTask?.description} 
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date *</label>
                  <input 
                    type="datetime-local" 
                    name="dueDate" 
                    defaultValue={editingTask?.dueDate ? new Date(editingTask.dueDate).toISOString().slice(0, 16) : selectedDate.toISOString().slice(0, 16)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" defaultValue={editingTask?.priority || 'medium'}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" defaultValue={editingTask?.status || 'pending'}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;