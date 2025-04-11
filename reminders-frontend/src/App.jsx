import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ what_to_do: "", due_date: "" });

  const API_BASE = "http://localhost:5001/api";

  useEffect(() => {
    fetch(`${API_BASE}/items`)
      .then(res => res.json())
      .then(setTasks)
      .catch(err => console.error("Error loading tasks", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const addTask = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then(() => {
        setTasks(prev => [...prev, { ...newTask, status: "pending" }]);
        setNewTask({ what_to_do: "", due_date: "" });
        setShowForm(false);
      });
  };

  const deleteTask = (taskText) => {
    fetch(`${API_BASE}/delete/${encodeURIComponent(taskText)}`, {
      method: "DELETE",
    }).then(() => {
      setTasks(prev => prev.filter(t => t.what_to_do !== taskText));
    });
  };

  const markAsDone = (taskText) => {
    fetch(`${API_BASE}/mark/${encodeURIComponent(taskText)}`, {
      method: "PUT",
    }).then(() => {
      setTasks(prev => prev.map(t =>
        t.what_to_do === taskText ? { ...t, status: "done" } : t
      ));
    });
  };

  return (
    <div className="App container">
      <h3>oh, so many things to do...</h3>
      <table className="table">
        <tbody>
          {tasks.length === 0 ? (
            <tr><td><em>Unbelievable. Nothing to do for now.</em></td></tr>
          ) : (
            tasks.map((entry, index) => (
              <tr key={index}>
                <td className={entry.status === "done" ? "done" : ""}>
                  {entry.what_to_do}
                </td>
                <td>{entry.due_date}</td>
                <td>
                  <button
                    onClick={() => markAsDone(entry.what_to_do)}
                    disabled={entry.status === "done"}
                  >
                    mark as done
                  </button>
                  <button onClick={() => deleteTask(entry.what_to_do)}>delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "cancel the new entry" : "add a new item"}
      </button>

      {showForm && (
        <form onSubmit={addTask} className="form-inline mt-3">
          <input
            type="text"
            name="what_to_do"
            placeholder="What to do"
            value={newTask.what_to_do}
            onChange={handleInputChange}
            required
            className="form-control mx-2"
          />
          <input
            type="text"
            name="due_date"
            placeholder="When"
            value={newTask.due_date}
            onChange={handleInputChange}
            className="form-control mx-2"
          />
          <button type="submit" className="btn btn-primary">save the new item</button>
        </form>
      )}
    </div>
  );
}

export default App;
