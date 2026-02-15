import { useEffect, useMemo, useState } from "react";

const LS_KEY = "tasks_v1";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function readLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [tasks, setTasks] = useState(readLS);
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => {
    const todo = tasks.filter((t) => t.status === "todo").length;
    const prog = tasks.filter((t) => t.status === "in-progress").length;
    const done = tasks.filter((t) => t.status === "done").length;
    return { todo, prog, done, total: tasks.length };
  }, [tasks]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const okQ = !q || t.title.toLowerCase().includes(q);
      const okF = filter === "all" || t.status === filter;
      return okQ && okF;
    });
  }, [tasks, query, filter]);

  function addTask(e) {
    e.preventDefault();
    const t = title.trim();
    if (t.length < 3) return alert("Task nomi kamida 3 ta harf bo'lsin.");
    const item = { id: uid(), title: t, status: "todo", createdAt: Date.now() };
    setTasks([item, ...tasks]);
    setTitle("");
  }

  function removeTask(id) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  function changeStatus(id, status) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  function editTask(id) {
    const current = tasks.find((t) => t.id === id);
    const next = prompt("Yangi nom:", current?.title ?? "");
    if (next == null) return;
    const clean = next.trim();
    if (clean.length < 3) return alert("Kamida 3 ta harf bo'lsin.");
    setTasks(tasks.map((t) => (t.id === id ? { ...t, title: clean } : t)));
  }

  function clearAll() {
    if (confirm("Hammasini o'chirasizmi?")) setTasks([]);
  }

  return (
    <div className="container">
      <h1>Task Manager</h1>

      <div className="row" style={{ marginBottom: 12 }}>
        <span className="badge">
          Total: <b>{stats.total}</b>
        </span>
        <span className="badge">
          Todo: <b>{stats.todo}</b>
        </span>
        <span className="badge">
          In progress: <b>{stats.prog}</b>
        </span>
        <span className="badge">
          Done: <b>{stats.done}</b>
        </span>
      </div>

      <div className="card">
        <form onSubmit={addTask} className="row">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Yangi task..."
            style={{ flex: 1, minWidth: 220 }}
          />
          <button>Add</button>
          <button type="button" className="danger" onClick={clearAll}>
            Clear
          </button>
        </form>

        <div className="row" style={{ marginTop: 10 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qidirish..."
            style={{ flex: 1, minWidth: 220 }}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <ul className="list">
        {visible.map((t) => (
          <li key={t.id} className="card" style={{ marginTop: 10 }}>
            <div className="item">
              <div>
                <div style={{ fontWeight: 800 }}>{t.title}</div>
                <small>Status: {t.status}</small>
              </div>

              <div className="row" style={{ justifyContent: "flex-end" }}>
                <select
                  value={t.status}
                  onChange={(e) => changeStatus(t.id, e.target.value)}
                >
                  <option value="todo">todo</option>
                  <option value="in-progress">in-progress</option>
                  <option value="done">done</option>
                </select>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => editTask(t.id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => removeTask(t.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
        {visible.length === 0 && (
          <p style={{ opacity: 0.7, marginTop: 14 }}>Hech narsa topilmadi.</p>
        )}
      </ul>
    </div>
  );
}
