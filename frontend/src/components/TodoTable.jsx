import React from 'react';
import '../styles.css';

const TodoTable = ({ todos, onMarkDone, onDelete }) => {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'done':
        return 'status-done';
      case 'working on it':
        return 'status-working';
      case 'stuck':
        return 'status-stuck';
      default:
        return 'status-neutral';
    }
  };

  const getDueIcon = (status) => {
    if (status.toLowerCase() === 'done') return '✅';
    if (status.toLowerCase() === 'stuck') return '⏱️';
    return '❗';
  };

  return (
    <table className="table table-hover todo-table">
      <thead className="table-light">
        <tr>
          <th>Name</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {todos.map((todo, idx) => (
          <tr key={idx}>
            <td>{todo.what_to_do}</td>
            <td className={`due-date ${todo.status === 'done' ? 'done' : ''}`}>
              {getDueIcon(todo.status)} {todo.due_date}
            </td>
            <td>
              <span className={`status-badge ${getStatusClass(todo.status)}`}>
                {todo.status}
              </span>
            </td>
            <td>
              {todo.status !== 'done' && (
                <button
                  className="btn btn-sm btn-outline-success action-btn"
                  onClick={() => onMarkDone(todo.what_to_do)}
                >
                  Done
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => onDelete(todo.what_to_do)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TodoTable;
