import React, { useEffect, useState } from "react";

const BACKEND = "https://n8n.cupidworld.com";
// Read credentials from environment variables (Vite uses import.meta.env)
const BACKEND_USERNAME = import.meta.env.BACKEND_USERNAME || "username";
const BACKEND_PASSWORD = import.meta.env.BACKEND_PASSWORD || "password";

// Helper to create Basic Auth header
const getAuthHeaders = () => {
  const credentials = btoa(`${BACKEND_USERNAME}:${BACKEND_PASSWORD}`);
  return {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };
};

export default function AdminPane() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // page size
  const [total, setTotal] = useState(0);

  async function fetchLogs(p = page) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${BACKEND}/api/logs?page=${p}&limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      const ct = res.headers.get("content-type") || "";

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
        setTotal(0);
        return;
      }

      if (ct.includes("text/html")) {
        const html = await res.text();
        setErrorMsg(
          "Unexpected HTML response from logs endpoint. Service may be down."
        );
        console.error("HTML response (200) from logs endpoint:", html);
        setLogs([]);
        setTotal(0);
        return;
      }

      const payload = await res.json();
      // payload: { logs: [...], total, page, limit } ; backend returns newest-first
      setLogs(Array.isArray(payload.logs) ? payload.logs : []);
      setTotal(typeof payload.total === "number" ? payload.total : 0);
      setPage(typeof payload.page === "number" ? payload.page : p);
    } catch (err) {
      console.error("Error fetching logs", err);
      setErrorMsg(String(err.message || err));
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  async function clearLogs() {
    if (!confirm("Clear all logs? (demo)")) return;
    try {
      const res = await fetch(`${BACKEND}/api/logs/clear`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setLogs([]);
      setTotal(0);
      setErrorMsg(null);
    } catch (err) {
      console.error("Error clearing logs", err);
      setErrorMsg("Failed to clear logs: " + err.message);
    }
  }

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrev = () => {
    if (page <= 1) return;
    fetchLogs(page - 1);
  };
  const handleNext = () => {
    if (page * limit >= total) return;
    fetchLogs(page + 1);
  };

  // Helper to get badge color based on type - FIXED color for waiting
  const getTypeBadge = (type) => {
    const styles = {
      success: { bg: "#d4edda", color: "#155724", border: "#c3e6cb" },
      failure: { bg: "#f8d7da", color: "#721c24", border: "#f5c6cb" },
      waiting: { bg: "#fff3cd", color: "#856404", border: "#ffc107" }, // FIXED: Changed border color
      info: { bg: "#d1ecf1", color: "#0c5460", border: "#bee5eb" },
    };
    const style = styles[type] || styles.info;
    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 8px",
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          textTransform: "capitalize",
          background: style.bg,
          color: style.color,
          border: `1px solid ${style.border}`,
        }}
      >
        {type === "waiting" ? "Waiting for Approval" : type}
      </span>
    );
  };

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "system-ui, Arial",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Admin — Workflow Logs</h1>
        <div>
          <button
            onClick={() => fetchLogs(page)}
            disabled={loading}
            style={{
              marginRight: 8,
              padding: "8px 16px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Refreshing..." : "🔄 Refresh"}
          </button>
          <button
            onClick={clearLogs}
            style={{
              background: "#dc3545",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            🗑️ Clear Logs
          </button>
          <button
            onClick={() => {
              window.location.hash = "/";
            }}
            style={{ marginLeft: 8, padding: "8px 16px" }}
          >
            ← Back
          </button>
        </div>
      </div>

      {errorMsg ? (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#fff3f3",
            border: "1px solid #f2c2c2",
            color: "#801111",
            borderRadius: 4,
          }}
        >
          <strong>Error:</strong> {errorMsg}
          <div style={{ marginTop: 8, color: "#555", fontSize: 13 }}>
            If you see an HTML/503 page, your backend host (Render) may be
            unavailable. Try running the backend locally at{" "}
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#0070f3" }}
            >
              http://localhost:3001
            </a>
          </div>
        </div>
      ) : null}

      <div
        style={{
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#666" }}>
          Showing page {page} — {Math.min(total, (page - 1) * limit + 1)} to{" "}
          {Math.min(total, page * limit)} of {total}
        </div>
        <div>
          <button
            onClick={handlePrev}
            disabled={page <= 1}
            style={{ marginRight: 8 }}
          >
            ◀ Prev
          </button>
          <button onClick={handleNext} disabled={page * limit >= total}>
            Next ▶
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "#999",
            border: "2px dashed #ddd",
            borderRadius: 8,
          }}
        >
          No logs yet.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              border: "1px solid #dee2e6",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8f9fa",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Workflow</th>
                <th style={thStyle}>Execution ID</th>
                <th style={thStyle}>Platform</th>
                <th style={thStyle}>Details</th>
                <th style={thStyle}>Links</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  style={{
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  <td style={tdStyle}>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td style={tdStyle}>{getTypeBadge(log.type)}</td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {log.data?.workflow_name || "—"}
                    </div>
                    {log.data?.workflow_id && (
                      <div
                        style={{ fontSize: 11, color: "#999", marginTop: 2 }}
                      >
                        ID: {log.data.workflow_id}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <strong>{log.data?.execution_id || "—"}</strong>
                  </td>
                  <td style={tdStyle}>
                    {log.data?.platform ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 3,
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "capitalize",
                          background: "#e9ecef",
                          color: "#495057",
                        }}
                      >
                        {log.data.platform}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ ...tdStyle, maxWidth: 350 }}>
                    {/* Success details */}
                    {log.type === "success" && (
                      <div style={{ fontSize: 12 }}>
                        <div>✅ Posted successfully</div>
                        {log.data?.draft_workflow_execution_id && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#666",
                              marginTop: 2,
                            }}
                          >
                            Draft Execution:{" "}
                            {log.data.draft_workflow_execution_id}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Waiting details */}
                    {log.type === "waiting" && (
                      <div style={{ fontSize: 12, color: "#856404" }}>
                        ⏳ Awaiting manual approval
                      </div>
                    )}

                    {/* Failure details */}
                    {log.type === "failure" && (
                      <div style={{ fontSize: 12 }}>
                        {log.data?.node && (
                          <div>
                            <strong>Node:</strong> {log.data.node}
                          </div>
                        )}
                        {log.data?.error_message && (
                          <div style={{ color: "#721c24", marginTop: 4 }}>
                            ❌ {log.data.error_message}
                          </div>
                        )}
                        {log.data?.error_description && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#666",
                              marginTop: 2,
                            }}
                          >
                            {log.data.error_description}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {log.data?.post_link && (
                        <a
                          href={log.data.post_link}
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          📱 View Post
                        </a>
                      )}
                      {log.data?.article_url && (
                        <a
                          href={log.data.article_url}
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          📄 Article
                        </a>
                      )}
                      {log.data?.article_edit_url && (
                        <a
                          href={log.data.article_edit_url}
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          ✏️ Edit Article
                        </a>
                      )}
                      {log.data?.database_link && (
                        <a
                          href={log.data.database_link}
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          🗄️ Database
                        </a>
                      )}
                      {log.data?.execution_link && (
                        <a
                          href={log.data.execution_link}
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          🔗 Execution
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 13,
  color: "#495057",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  borderRight: "1px solid #dee2e6", // ADD: vertical borders between columns
};

const tdStyle = {
  padding: "12px 16px",
  fontSize: 13,
  verticalAlign: "top",
  borderRight: "1px solid #dee2e6", // ADD: vertical borders between columns
};

const linkStyle = {
  display: "inline-block",
  fontSize: 12,
  color: "#0070f3",
  textDecoration: "none",
  padding: "2px 0",
};

// Helper reused from previous file (badge rendering)
function getTypeBadge(type) {
  const styles = {
    success: { bg: "#d4edda", color: "#155724", border: "#c3e6cb" },
    failure: { bg: "#f8d7da", color: "#721c24", border: "#f5c6cb" },
    waiting: { bg: "#fff3cd", color: "#856404", border: "#ffc107" },
    info: { bg: "#d1ecf1", color: "#0c5460", border: "#bee5eb" },
  };
  const style = styles[type] || styles.info;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        textTransform: "capitalize",
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {type === "waiting" ? "Waiting for Approval" : type}
    </span>
  );
}
