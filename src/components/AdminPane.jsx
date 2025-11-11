import React, { useEffect, useState } from "react";

const BACKEND = "https://alpenity-backend.onrender.com";

export default function AdminPane() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  async function fetchLogs() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${BACKEND}/api/logs`);
      const ct = res.headers.get("content-type") || "";

      // Detect HTML (e.g., Render 503 page) and show a useful message
      if (!res.ok) {
        if (ct.includes("text/html")) {
          const html = await res.text();
          setErrorMsg(
            `Remote service returned HTML (${res.status}). Service may be down.`
          );
          console.error("HTML response from logs endpoint:", html);
        } else {
          const json = await res.json().catch(() => null);
          setErrorMsg(
            `Failed to fetch logs: ${res.status} ${res.statusText}` +
              (json && json.message ? ` - ${json.message}` : "")
          );
        }
        setLogs([]);
        return;
      }

      if (ct.includes("text/html")) {
        // Unexpected HTML on 200
        const html = await res.text();
        setErrorMsg(
          "Unexpected HTML response from logs endpoint. Service may be down."
        );
        console.error("HTML response (200) from logs endpoint:", html);
        setLogs([]);
        return;
      }

      const data = await res.json();
      // Expecting an array (backend returns newest-first array). Guard if it returns object.
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching logs", err);
      setErrorMsg(String(err.message || err));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  async function clearLogs() {
    if (!confirm("Clear all logs? (demo)")) return;
    try {
      const res = await fetch(`${BACKEND}/api/logs/clear`, { method: "POST" });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setLogs([]);
      setErrorMsg(null);
    } catch (err) {
      console.error("Error clearing logs", err);
      setErrorMsg("Failed to clear logs: " + err.message);
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

          {/* Back using hash routing so direct /admin visits don't 404 */}
          <button
            onClick={() => {
              window.location.hash = "/";
              // trigger hashchange if needed (browsers do this automatically)
            }}
            style={{ marginLeft: 8 }}
          >
            Back
          </button>
        </div>
      </div>

      {errorMsg ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#fff3f3",
            border: "1px solid #f2c2c2",
            color: "#801111",
          }}
        >
          <strong>Error:</strong> {errorMsg}
          <div
            style={{
              marginTop: 8,
              color: "#555",
              fontSize: 13,
            }}
          >
            If you see an HTML/503 page, your backend host (Render) may be
            unavailable. Try running the backend locally at{" "}
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#0070f3" }}
            >
              http://localhost:3001
            </a>{" "}
            for tests.
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 16 }}>
        {logs.length === 0 && !errorMsg ? (
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

              {/* Render known workflow fields if present (incoming schema) */}
              {log.data &&
              (log.data.workflow_name ||
                log.data.execution_id ||
                log.data.post_link ||
                typeof log.data.article_url !== "undefined") ? (
                <div style={{ fontSize: 13, marginBottom: 8 }}>
                  {log.data.workflow_name && (
                    <div>
                      <strong>Workflow:</strong> {log.data.workflow_name}
                    </div>
                  )}
                  {log.data.execution_id && (
                    <div>
                      <strong>Execution ID:</strong> {log.data.execution_id}
                    </div>
                  )}
                  {log.data.workflow_id && (
                    <div>
                      <strong>Workflow ID:</strong> {log.data.workflow_id}
                    </div>
                  )}
                  {log.data.post_link && (
                    <div>
                      <strong>Post:</strong>{" "}
                      <a
                        href={log.data.post_link}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#0070f3" }}
                      >
                        {log.data.post_link}
                      </a>
                    </div>
                  )}
                  {typeof log.data.article_url !== "undefined" && (
                    <div>
                      <strong>Article URL:</strong>{" "}
                      {log.data.article_url ? (
                        <a
                          href={log.data.article_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#0070f3" }}
                        >
                          {log.data.article_url}
                        </a>
                      ) : (
                        <em>null</em>
                      )}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Raw JSON details */}
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 12,
                  margin: 0,
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                {JSON.stringify(log.data, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
