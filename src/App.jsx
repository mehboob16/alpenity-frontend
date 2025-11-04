import { useState, useEffect } from "react";
import ArticlePage from "./components/ArticlePage";
import "./components/AppHeaderFooter.css"; // <-- IMPORT THE NEW CSS

// --- URLs (Same as before) ---
const BACKEND_API_URL = "https://alpenity-backend.onrender.com/api/article";
// !!! PASTE YOUR WEBHOOK URL HERE (from your NEW n8n workflow)

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
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticle = () => {
    setIsLoading(true);
    setError(null);
    fetch(BACKEND_API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("No article found. Waiting for n8n...");
        return res.json();
      })
      .then(setArticle)
      .catch((err) => {
        setError(err.message);
        setArticle(null);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchArticle();
  }, []);

  const handleApproveAndSend = async () => {
    if (!article) return;

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
      alert(`Error sending to n8n: ${err.message}`);
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
