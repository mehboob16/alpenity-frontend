import React, { useEffect, useState } from "react";

const BACKEND = "https://alpenity-backend.onrender.com";

export default function AdminPane() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/logs`);
      if (!res.ok) throw new Error("Failed to load logs");
      setLogs(await res.json());
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  async function clearLogs() {
    if (!confirm("Clear all logs? (demo)")) return;
    try {
      const res = await fetch(`${BACKEND}/api/logs/clear`, { method: "POST" });
      if (res.ok) setLogs([]);
      else console.error("Failed to clear logs", res.status);
    } catch (err) {
      console.error("Error clearing logs", err);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div
      style={{ padding: 20, fontFamily: "system-ui, Arial", maxWidth: 1100 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Admin — Logs</h1>
        <div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            style={{ marginRight: 8 }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={clearLogs}
            style={{ background: "#c33", color: "#fff" }}
          >
            Clear Logs
          </button>
          <button
            onClick={() => {
              window.history.pushState({}, "", "/");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            style={{ marginLeft: 8 }}
          >
            Back
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {logs.length === 0 ? (
          <div style={{ color: "#666" }}>No logs yet.</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              style={{
                border: "1px solid #e6e6e6",
                padding: 12,
                marginBottom: 8,
                borderLeft:
                  log.type === "failure"
                    ? "4px solid #c33"
                    : "4px solid #2a9d8f",
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <div>
                  <strong style={{ textTransform: "capitalize" }}>
                    {log.type}
                  </strong>{" "}
                  <span style={{ color: "#666", marginLeft: 8 }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div style={{ color: "#999", fontSize: 12 }}>{log.id}</div>
              </div>

              <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, margin: 0 }}>
                {JSON.stringify(log.data, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
