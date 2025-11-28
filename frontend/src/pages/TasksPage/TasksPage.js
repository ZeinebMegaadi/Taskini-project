import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskList from '../../components/TaskList/TaskList';
import TaskForm from '../../components/TaskForm/TaskForm';
import api from '../../utils/api';
import './TasksPage.css';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('list');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
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

  // Enhanced Calendar navigation
  const navigateMonth = (direction) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateToToday = () => {
    setSelectedDate(new Date());
  };

  const selectDate = (day) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    setSelectedDate(newDate);
    
    // Auto-create task for selected date
    setEditingTask(null);
    setShowForm(true);
  };

  // Enhanced Calendar calculations
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (day) => {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getTasksForSelectedDate = () => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === selectedDate.toDateString();
    });
  };

  // Enhanced Task handlers
  const handleCreateTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      if (response.data.success) {
        setTasks([response.data.data, ...tasks]);
        setShowForm(false);
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
          task._id === editingTask._id 
            ? response.data.data
            : task
        ));
        setEditingTask(null);
        setShowForm(false);
        setShowTaskDetails(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
    setShowTaskDetails(false);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await api.delete(`/tasks/${taskId}`);
        if (response.data.success) {
          setTasks(tasks.filter(task => task._id !== taskId));
          setShowTaskDetails(false);
          setSelectedTasks(prev => {
            const newSelected = new Set(prev);
            newSelected.delete(taskId);
            return newSelected;
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.size} tasks?`)) {
      try {
        const deletePromises = Array.from(selectedTasks).map(taskId => 
          api.delete(`/tasks/${taskId}`)
        );
        
        await Promise.all(deletePromises);
        setTasks(tasks.filter(task => !selectedTasks.has(task._id)));
        setSelectedTasks(new Set());
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete tasks');
      }
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedTasks.size === 0) return;

    try {
      const updatePromises = Array.from(selectedTasks).map(taskId => 
        api.put(`/tasks/${taskId}`, { status: newStatus })
      );
      
      await Promise.all(updatePromises);
      setTasks(tasks.map(task => 
        selectedTasks.has(task._id) 
          ? { ...task, status: newStatus }
          : task
      ));
      setSelectedTasks(new Set());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update tasks');
    }
  };

  const handleFormSubmit = (taskData) => {
    if (editingTask) {
      handleUpdateTask(taskData);
    } else {
      handleCreateTask(taskData);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleTaskSelect = (taskId, isSelected) => {
    setSelectedTasks(prev => {
      const newSelected = new Set(prev);
      if (isSelected) {
        newSelected.add(taskId);
      } else {
        newSelected.delete(taskId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task._id)));
    }
  };

  const handleQuickStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (response.data.success) {
        setTasks(tasks.map(task => 
          task._id === taskId 
            ? { ...task, status: newStatus }
            : task
        ));
        if (selectedTask && selectedTask._id === taskId) {
          setSelectedTask({ ...selectedTask, status: newStatus });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  // Enhanced filtering and sorting
  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'all') return true;
      return task.status === filter;
    })
    .filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  const tasksForSelectedDate = getTasksForSelectedDate();

  if (loading) {
    return (
      <div className="tasks-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      {/* Enhanced Header */}
      <div className="tasks-header">
        <div className="header-main">
          <h1>My Tasks</h1>
          <div className="header-stats">
            <span className="stat">{tasks.length} total</span>
            <span className="stat">{tasks.filter(t => t.status === 'completed').length} completed</span>
            <span className="stat">{tasks.filter(t => t.status === 'pending').length} pending</span>
          </div>
        </div>
        
        <div className="tasks-header-actions">
          <div className="view-controls">
            <div className="view-toggle">
              <button 
                className={`view-btn ${view === 'list' ? 'active' : ''}`}
                onClick={() => setView('list')}
              >
                <span className="btn-icon">📋</span>
                List View
              </button>
              <button 
                className={`view-btn ${view === 'calendar' ? 'active' : ''}`}
                onClick={() => setView('calendar')}
              >
                <span className="btn-icon">📅</span>
                Calendar View
              </button>
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              className="btn-create" 
              onClick={() => {
                setEditingTask(null);
                setShowForm(true);
              }}
            >
              <span className="btn-icon">⚡</span>
              New Task
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Enhanced Filters and Search */}
      <div className="tasks-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="controls-right">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Title</option>
            <option value="createdAt">Sort by Created</option>
          </select>

          <div className="tasks-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
              onClick={() => setFilter('in-progress')}
            >
              In Progress
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTasks.size > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <span>{selectedTasks.size} tasks selected</span>
          </div>
          <div className="bulk-buttons">
            <button 
              className="bulk-btn success"
              onClick={() => handleBulkStatusUpdate('completed')}
            >
              Mark Complete
            </button>
            <button 
              className="bulk-btn warning"
              onClick={() => handleBulkStatusUpdate('in-progress')}
            >
              Mark In Progress
            </button>
            <button 
              className="bulk-btn danger"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
            <button 
              className="bulk-btn secondary"
              onClick={() => setSelectedTasks(new Set())}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {view === 'calendar' ? (
        <div className="calendar-view">
          <div className="calendar-header">
            <button className="calendar-nav-btn" onClick={() => navigateMonth(-1)}>
              ←
            </button>
            <div className="calendar-month-controls">
              <h2 className="calendar-month">
                {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button className="btn-today" onClick={navigateToToday}>
                Today
              </button>
            </div>
            <button className="calendar-nav-btn" onClick={() => navigateMonth(1)}>
              →
            </button>
          </div>

          <div className="calendar-selected-date">
            <h3>Selected: {selectedDate.toLocaleDateString()}</h3>
            {tasksForSelectedDate.length > 0 ? (
              <div className="date-tasks-preview">
                <span>{tasksForSelectedDate.length} task(s) due</span>
                <button 
                  className="btn-view-tasks"
                  onClick={() => setView('list')}
                >
                  View Tasks
                </button>
              </div>
            ) : (
              <p>No tasks due on this date</p>
            )}
          </div>
          
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}
            
            {Array.from({ length: getFirstDayOfMonth(selectedDate) }).map((_, index) => (
              <div key={`empty-${index}`} className="calendar-day empty"></div>
            ))}
            
            {Array.from({ length: getDaysInMonth(selectedDate) }, (_, i) => i + 1).map(day => {
              const dayTasks = getTasksForDate(day);
              const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
              const isToday = new Date().toDateString() === date.toDateString();
              const isSelected = selectedDate.toDateString() === date.toDateString();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              
              return (
                <div 
                  key={day} 
                  className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isWeekend ? 'weekend' : ''} ${dayTasks.length > 0 ? 'has-tasks' : ''}`}
                  onClick={() => selectDate(day)}
                >
                  <div className="day-header">
                    <span className="calendar-day-number">{day}</span>
                    {dayTasks.length > 0 && (
                      <span className="task-count-badge">{dayTasks.length}</span>
                    )}
                  </div>
                  {dayTasks.length > 0 && (
                    <div className="calendar-tasks">
                      {dayTasks.slice(0, 3).map(task => (
                        <div
                          key={task._id}
                          className={`calendar-task ${task.status} ${task.priority}`}
                          title={task.title}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskClick(task);
                          }}
                        >
                          <span className="task-dot"></span>
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="calendar-more-tasks">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTaskClick={handleTaskClick}
          onTaskSelect={handleTaskSelect}
          selectedTasks={selectedTasks}
          onSelectAll={handleSelectAll}
          allSelected={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
        />
      )}

      {/* Enhanced Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowTaskDetails(false)}>
          <div className="task-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Task Details</h3>
              <button 
                className="modal-close"
                onClick={() => setShowTaskDetails(false)}
              >
                ×
              </button>
            </div>
            <div className="task-details-content">
              <div className="detail-section">
                <label>Title</label>
                <div className="detail-value">{selectedTask.title}</div>
              </div>
              
              <div className="detail-section">
                <label>Description</label>
                <div className="detail-value">
                  {selectedTask.description || <em>No description provided</em>}
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-section">
                  <label>Due Date</label>
                  <div className="detail-value">
                    {new Date(selectedTask.dueDate).toLocaleDateString()} at {' '}
                    {new Date(selectedTask.dueDate).toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="detail-section">
                  <label>Priority</label>
                  <div className="detail-value">
                    <span className={`priority-badge ${selectedTask.priority}`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <label>Status</label>
                <div className="status-controls">
                  <select 
                    value={selectedTask.status}
                    onChange={(e) => handleQuickStatusUpdate(selectedTask._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="in-progress">🔄 In Progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="detail-section">
                <label>Created</label>
                <div className="detail-value">
                  {new Date(selectedTask.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={() => handleEdit(selectedTask)}
              >
                ✏️ Edit Task
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDelete(selectedTask._id)}
              >
                🗑️ Delete
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowTaskDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-overlay">
          <TaskForm
            task={editingTask}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            defaultDate={selectedDate}
          />
        </div>
      )}
    </div>
  );
};

export default TasksPage;