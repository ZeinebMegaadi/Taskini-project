import React from 'react';
import TaskCard from '../TaskCard/TaskCard';
import './TaskList.css';

const TaskList = ({ 
  tasks, 
  onEdit, 
  onDelete, 
  onTaskClick, 
  onTaskSelect, 
  selectedTasks, 
  onSelectAll,
  allSelected 
}) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No tasks found</h3>
          <p>Create your first task to get started!</p>
          <div className="empty-actions">
            <button className="btn btn-primary">Create Task</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list">
      {/* List Header with Select All */}
      {onTaskSelect && (
        <div className="task-list-header">
          <div className="select-all">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="select-all-checkbox"
            />
            <span>Select all ({tasks.length} tasks)</span>
          </div>
          <div className="list-stats">
            <span className="stat">
              {tasks.filter(t => t.status === 'completed').length} completed
            </span>
            <span className="stat">
              {tasks.filter(t => t.status === 'pending').length} pending
            </span>
            <span className="stat">
              {tasks.filter(t => t.status === 'in-progress').length} in progress
            </span>
          </div>
        </div>
      )}

      {/* Tasks Grid */}
      <div className="tasks-grid">
        {tasks.map((task) => (
          <TaskCard
            key={task._id || task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onTaskClick={onTaskClick}
            onTaskSelect={onTaskSelect}
            isSelected={selectedTasks ? selectedTasks.has(task._id) : false}
          />
        ))}
      </div>

      {/* List Footer */}
      <div className="task-list-footer">
        <span>Showing {tasks.length} tasks</span>
        {tasks.some(t => t.priority === 'high') && (
          <span className="priority-warning">
            ⚠️ You have {tasks.filter(t => t.priority === 'high').length} high priority tasks
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskList;