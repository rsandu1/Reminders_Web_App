import React, { useState } from 'react';

const LoginForm = ({ onAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }
  
    const endpoint = isLogin ? '/api/login' : '/api/register';
  
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (data.token) {
        onAuth(data.token, data.username);  // ✅ This now works as expected
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Network or server error. Try again.");
    }
  };
  

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body">
          <h4 className="card-title text-center mb-3">
            {isLogin ? 'Login' : 'Register'}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-2">
              {isLogin ? 'Login' : 'Register'}
            </button>
            <button
              type="button"
              className="btn btn-link w-100"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Register"
                : 'Already have an account? Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

