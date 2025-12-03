import { useState, useEffect } from "react";
import AdminPane from "./components/AdminPane";
import "./components/AppHeaderFooter.css";

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

  // Always show AdminPane (regardless of route)
  return <AdminPane />;
}

export default App;
