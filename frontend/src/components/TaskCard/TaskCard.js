import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      <p className="task-description">{task.description}</p>
      
      {task.assignedTo && (
        <div className="task-assigned">
          <span className="assigned-label">Assigned to:</span>
          <div className="assigned-user">
            {task.assignedTo.profilePhoto ? (
              <img 
                src={`http://localhost:5000/${task.assignedTo.profilePhoto}`}
                alt={task.assignedTo.name}
                className="assigned-avatar"
              />
            ) : (
              <div className="assigned-avatar-placeholder">
                {task.assignedTo.name ? task.assignedTo.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <span className="assigned-name">{task.assignedTo.name}</span>
          </div>
        </div>
      )}

      <div className="task-footer">
        <span className={`status-badge ${getStatusClass(task.status)}`}>
          {task.status}
        </span>
        <div className="task-actions">
          <button className="btn-edit" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(task._id)}>
            Delete
          </button>
        </div>
      </div>
      {task.dueDate && (
        <p className="task-date">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
      )}
    </div>
  );
};

export default TaskCard;

