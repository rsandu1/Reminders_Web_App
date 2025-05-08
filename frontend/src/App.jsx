import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import TodoTable from './components/TodoTable';
import './styles.css';

// const API_BASE = 'http://34.70.223.84:5001';
const API_BASE = import.meta.env.VITE_API_URL;


function App() {
  const [todos, setTodos] = useState([]);
  const [whatToDo, setWhatToDo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');
  const [loginInfo, setLoginInfo] = useState({ username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // ✅ Apply theme class to body
    useEffect(() => {
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(theme);
      localStorage.setItem('theme', theme);
    }, [theme]);
  
    const toggleTheme = () => {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

  // ✅ Fetch todos from the backend and sort them by due date
  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/items`, {
        headers: { Authorization: token },
      });
      const data = await response.json();
  
      if (response.ok) {
        // Sort todos by due_date (earliest first)
        const sorted = data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        setTodos(sorted);
      } else {
        console.warn('Unauthorized fetchTodos()', data);
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  };
  

  // ✅ Fetch todos when token is available
  useEffect(() => {
    if (!token) return;
    fetchTodos();
  }, [token]);

  // ✅ Add a new todo
  const addTodo = async () => {
    if (!whatToDo || !dueDate) return;

    await fetch(`${API_BASE}/api/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ what_to_do: whatToDo, due_date: dueDate }),
    });

    setWhatToDo('');
    setDueDate('');
    fetchTodos();
  };

  // ✅ Mark todo as done
  const markAsDone = async (task) => {
    await fetch(`${API_BASE}/api/mark_done/${encodeURIComponent(task)}`, {
      method: 'PUT',
      headers: { Authorization: token },
    });
    fetchTodos();
  };

  // ✅ Delete a todo
  const deleteTodo = async (task) => {
    await fetch(`${API_BASE}/api/delete/${encodeURIComponent(task)}`, {
      method: 'DELETE',
      headers: { Authorization: token },
    });
    fetchTodos();
  };

  // ✅ Auth success handler (called from LoginForm)
  const handleAuth = (token, username) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUsername(username);
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUsername('');
    setTodos([]);
  };

  // ✅ Show login/register screen if not logged in
  if (!token) {
    return (
      <LoginForm
        loginInfo={loginInfo}
        setLoginInfo={setLoginInfo}
        isLogin={isLogin}
        onAuth={handleAuth}
        toggleForm={() => setIsLogin(!isLogin)}
      />
    );
  }

  return (
    <>
    <div className="header-bar">
      <div className="header-left">
        <span className="logo">🗂️ Reminders</span>
      </div>
      <div className="header-right d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        <div className="dropdown">
          <button
          className="btn btn-light dropdown-toggle account-icon"
          type="button"
          id="accountDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          👤
        </button>
        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown">
          <li><button className="dropdown-item">User: {username}</button></li>
          <li><hr className="dropdown-divider" /></li>
          <li><button className="dropdown-item text-danger" onClick={logout}>Logout</button></li>
          </ul>
        </div>

      </div>
    </div>

    <div className="fullpage-wrapper with-header">
      <div className="app-wrapper">
        <div className="welcome-card mb-4 p-3">
          <h4>Good morning, {username}!</h4>
          <p className="text-muted">Quickly manage your reminders and stay on track.</p>
        </div>

        <h5 className="mb-3">Your To-Do List</h5>
        <TodoTable
          todos={todos}
          onMarkDone={markAsDone}
          onDelete={deleteTodo}
        />
        <div className="input-section">
          <h5 className="mb-3">Add a Reminder</h5>
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <input
                className="form-control todo-input"
                type="text"
                placeholder="What to do?"
                value={whatToDo}
                onChange={(e) => setWhatToDo(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <input
                className="form-control todo-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn btn-success" onClick={addTodo}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );  
}

export default App;



