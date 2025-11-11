import { useState, useEffect } from "react";
import ArticlePage from "./components/ArticlePage";
import AdminPane from "./components/AdminPane"; // <-- IMPORT THE NEW ADMIN PANE
import "./components/AppHeaderFooter.css"; // <-- IMPORT THE NEW CSS

// --- URLs ---
const BACKEND_API_URL = "https://alpenity-backend.onrender.com/api/article"; // <- FIXED: full article endpoint
const BACKEND_BASE = "https://alpenity-backend.onrender.com"; // used for admin pane if needed

// NOTE: set your actual webhook here (or via env replacement). Keep empty to disable.
const N8N_WEBHOOK_URL = ""; // <-- SAFE default to avoid ReferenceError

// --- Simple Header Component (to match Alpenity) ---
function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Simplified Logo */}
        <div className="site-logo">Alpenity</div>
        <nav className="site-nav">
          <a href="#">About Us</a>
          <a href="#">Services</a>
          <a href="#">Industries</a>
          <a href="#">Newsroom</a>
          <a href="#" className="header-contact-btn">
            Contact Us
          </a>

          {/* Admin link — use hash routing to avoid server 404 on direct visits */}
          <a
            href="#/admin"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = "/admin";
            }}
            style={{ marginLeft: 12, color: "#2a9d8f" }}
          >
            Admin
          </a>
        </nav>
      </div>
    </header>
  );
}

// --- Simple Footer Component (to match Alpenity) ---
function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-col">
          <div className="footer-logo">Alpenity</div>
          <span>Your growth. Our mission.</span>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <a href="#">About us</a>
          <a href="#">Newsroom</a>
          <a href="#">Contact us</a>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
          <a href="#">Imprint</a>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>© All Rights Reserved 2025</span>
      </div>
    </footer>
  );
}

// --- Main App ---
function App() {
  // Use hash-based routing to avoid server 404 on direct /admin visits
  const getRouteFromHash = () =>
    window.location.hash ? window.location.hash.slice(1) : "/";
  const [route, setRoute] = useState(getRouteFromHash());

  useEffect(() => {
    const handleHash = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  if (route === "/admin") {
    return <AdminPane />;
  }

  // --- Original App Logic for Article View ---
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticle = async () => {
    setIsLoading(true);
    setError(null);
    setArticle(null);
    try {
      const res = await fetch(BACKEND_API_URL, { method: "GET" });
      const ct = res.headers.get("content-type") || "";

      if (!res.ok) {
        // If server returned HTML (e.g. Render 503 page) give helpful message
        if (ct.includes("text/html")) {
          const html = await res.text().catch(() => "");
          setError(
            `Backend returned ${res.status}. Service may be down (HTML response).`
          );
          console.error("HTML response from backend:", html);
        } else {
          // Try to parse JSON error message
          const json = await res.json().catch(() => null);
          setError(
            json && json.message
              ? json.message
              : `Request failed: ${res.status} ${res.statusText}`
          );
        }
        return;
      }

      if (ct.includes("text/html")) {
        // 200 but HTML -> treat as service down
        const html = await res.text().catch(() => "");
        setError("Unexpected HTML response from backend. Service may be down.");
        console.error("HTML (200) from backend:", html);
        return;
      }

      // Expect JSON article
      const data = await res.json().catch(() => null);
      if (!data) {
        setError("Backend returned invalid JSON.");
        return;
      }

      setArticle(data);
    } catch (err) {
      console.error("Error fetching article", err);
      setError(String(err && err.message ? err.message : err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, []);

  const handleApproveAndSend = async () => {
    if (!article) return;

    if (!N8N_WEBHOOK_URL) {
      alert(
        "N8N webhook URL is not configured. Set N8N_WEBHOOK_URL in App.jsx before sending."
      );
      return;
    }

    alert("Sending approval and URL to n8n...");
    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          heading: article.heading,
          imageUrl: article.image,
        }),
      });
      if (!res.ok) throw new Error("Failed to send data to n8n.");
      alert("Successfully sent to n8n!");
      setArticle(null); // Clear article after approval
      setError("Article approved. Waiting for next article from n8n...");
    } catch (err) {
      alert(`Error sending to n8n: ${err.message || err}`);
    }
  };

  const handleRefresh = () => {
    fetchArticle();
  };

  // --- Render Logic ---
  let content;
  if (isLoading) {
    content = <div className="status-message">Loading article...</div>;
  } else if (error) {
    content = (
      <div className="status-message">
        {error}
        <button className="refresh-btn" onClick={handleRefresh}>
          Check for New Article
        </button>
      </div>
    );
  } else if (article) {
    content = (
      <ArticlePage article={article} onApproveClick={handleApproveAndSend} />
    );
  } else {
    content = (
      <div className="status-message">
        No article available.
        <button className="refresh-btn" onClick={handleRefresh}>
          Check for New Article
        </button>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <SiteHeader />
      <main className="main-content">{content}</main>
      <SiteFooter />
    </div>
  );
}

export default App;
