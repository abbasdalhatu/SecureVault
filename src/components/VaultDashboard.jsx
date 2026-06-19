import { useState } from "react";
import logoImg from "../assets/logo.png";
import PasswordGen from "./PasswordGen";

const CATEGORIES = [
  { id: "all", label: "All Items", icon: "📦" },
  { id: "login", label: "Logins", icon: "🔑" },
  { id: "card", label: "Payment Cards", icon: "💳" },
  { id: "note", label: "Secure Notes", icon: "📝" }
];

export default function VaultDashboard({
  items,
  onAddNewItem,
  onEditItem,
  onDeleteItem,
  onLock,
  onExportVault,
  onImportVault,
  onCopyPassword,
  onSaveItem
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [revealedPasswords, setRevealedPasswords] = useState({});

  // Password Generator - Save to Vault form state
  const [genTitle, setGenTitle] = useState("");
  const [genUsername, setGenUsername] = useState("");
  const [genCategory, setGenCategory] = useState("login");
  const [genUrl, setGenUrl] = useState("");
  const [genNotes, setGenNotes] = useState("");
  const [activePassword, setActivePassword] = useState("");
  const [genErrors, setGenErrors] = useState({});
  const [keyForReset, setKeyForReset] = useState(0);

  const handleSaveGenerated = (e) => {
    e.preventDefault();
    const errors = {};
    if (!genTitle.trim()) {
      errors.title = "Title is required";
    }
    if (!activePassword.trim()) {
      errors.password = "Please generate a password first";
    }

    if (Object.keys(errors).length > 0) {
      setGenErrors(errors);
      return;
    }

    onSaveItem({
      id: Date.now().toString(),
      title: genTitle.trim(),
      category: genCategory,
      username: genUsername.trim(),
      password: activePassword,
      url: genUrl.trim(),
      notes: genNotes.trim(),
      updatedAt: new Date().toISOString()
    });

    // Reset states
    setGenTitle("");
    setGenUsername("");
    setGenUrl("");
    setGenNotes("");
    setGenErrors({});
    
    // Recreate PasswordGen to get a new password
    setKeyForReset(prev => prev + 1);
  };

  // Toggle quick-peek password visibility in list row
  const togglePasswordVisibility = (itemId, e) => {
    e.stopPropagation();
    setRevealedPasswords(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Filter vault items
  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(searchLower) ||
      (item.username && item.username.toLowerCase().includes(searchLower)) ||
      (item.url && item.url.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  // Calculate counts for badges
  const getCategoryCount = (catId) => {
    if (catId === "all") return items.length;
    return items.filter(item => item.category === catId).length;
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        onImportVault(data);
      } catch (err) {
        alert("Invalid file format. Please import a valid SecureVault export file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  return (
    <div className="container">
      {/* Dashboard Top bar */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1 className="dashboard-title gradient-text">
            <img src={logoImg} alt="Logo" style={{ width: "40px", height: "40px", borderRadius: "8px", boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)" }} /> SecureVault
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            AES-GCM 256 Local Encrypted Password Manager
          </p>
        </div>

        <div className="dashboard-actions-group">
          <button className="btn btn-secondary" onClick={onExportVault}>
            📥 Export Encrypted
          </button>
          
          <label className="btn btn-secondary" style={{ margin: 0 }}>
            📤 Import JSON
            <input
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleImportFileChange}
            />
          </label>

          <button className="btn btn-danger" onClick={onLock}>
            🔒 Lock Vault
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        
        {/* LEFT COLUMN: Sidebar Navigation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Action button */}
          <button className="btn btn-primary" style={{ width: "100%", padding: "0.8rem" }} onClick={onAddNewItem}>
            ＋ Add New Item
          </button>

          {/* Sidebar categories */}
          <div className="glass-panel" style={{ padding: "0.8rem" }}>
            <ul className="sidebar-list">
              <span className="sidebar-group-header">Categories</span>
              {CATEGORIES.map(cat => (
                <li
                  key={cat.id}
                  className={`sidebar-item ${activeCategory === cat.id ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                  <span className="item-count-badge">{getCategoryCount(cat.id)}</span>
                </li>
              ))}
              
              <div style={{ borderTop: "1px solid var(--border-glass)", margin: "0.6rem 0" }} />
              
              <span className="sidebar-group-header">Tools</span>
              <li
                className={`sidebar-item ${activeCategory === "generator" ? "active" : ""}`}
                onClick={() => setActiveCategory("generator")}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span>⚡</span>
                  <span>Password Generator</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Search and Vault Items Grid OR Password Generator */}
        {activeCategory === "generator" ? (
          <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <h2 className="gradient-text" style={{ fontSize: "1.6rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                ⚡ Password Generator & Saver
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                Configure parameters to generate a highly secure password, and optionally encrypt & save it directly to your vault.
              </p>
            </div>

            <div className="generator-dashboard-view" style={{ marginTop: "1rem" }}>
              
              {/* LEFT COLUMN: Configuration and Output */}
              <div className="generator-col-left">
                <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>1. Configure Password</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Generated Result</label>
                  <div className="generator-display-box">
                    {activePassword || "No character pool selected"}
                  </div>
                </div>

                <PasswordGen
                  key={keyForReset}
                  inlineMode={false}
                  onGenerate={setActivePassword}
                  onCopyPassword={onCopyPassword}
                />
              </div>

              {/* RIGHT COLUMN: Save Form */}
              <div>
                <form onSubmit={handleSaveGenerated} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>2. Save to Secure Vault</h3>
                  
                  {/* Category */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                      Item Category
                    </label>
                    <select
                      className="input-field"
                      value={genCategory}
                      onChange={(e) => setGenCategory(e.target.value)}
                    >
                      <option value="login">Login / Account</option>
                      <option value="card">Payment Card Details</option>
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                      Title / Name *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Google, GitHub, Netflix"
                      value={genTitle}
                      onChange={(e) => setGenTitle(e.target.value)}
                      required
                    />
                    {genErrors.title && <span style={{ color: "#ef4444", fontSize: "0.78rem" }}>{genErrors.title}</span>}
                  </div>

                  {/* Username */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                      Username / Email
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. user@example.com"
                      value={genUsername}
                      onChange={(e) => setGenUsername(e.target.value)}
                    />
                  </div>

                  {/* Website URL */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                      Website URL
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="https://example.com"
                      value={genUrl}
                      onChange={(e) => setGenUrl(e.target.value)}
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                      Notes
                    </label>
                    <textarea
                      className="input-field"
                      style={{ minHeight: "70px", resize: "vertical" }}
                      placeholder="Additional descriptions or recovery codes..."
                      value={genNotes}
                      onChange={(e) => setGenNotes(e.target.value)}
                    />
                  </div>

                  {genErrors.password && <div style={{ color: "#ef4444", fontSize: "0.82rem" }}>{genErrors.password}</div>}

                  <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                    💾 Encrypt & Save to Vault
                  </button>
                </form>
              </div>

            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Search bar */}
            <input
              type="text"
              className="input-field"
              style={{ padding: "0.85rem 1.2rem" }}
              placeholder="Search vault items by title, username, or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* List items */}
            <div className="credentials-list">
              {filteredItems.length === 0 ? (
                <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                  <h3>No Items Found</h3>
                  <p style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>
                    {items.length === 0 ? "Your vault is empty. Click 'Add New Item' to secure your first password." : "No entries matched your search keywords."}
                  </p>
                </div>
              ) : (
                filteredItems.map(item => {
                  const categoryInfo = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[1];
                  const isPasswordRevealed = !!revealedPasswords[item.id];
                  
                  return (
                    <div key={item.id} className="credential-item-card">
                      
                      <div className="cred-title-row">
                        <div className="cred-icon-placeholder">
                          {categoryInfo.icon}
                        </div>
                        <div className="cred-details">
                          <div className="cred-title">{item.title}</div>
                          <div className="cred-meta">
                            {item.username && (
                              <span>👤 {item.username}</span>
                            )}
                            {item.url && (
                              <span>
                                🔗 <a href={item.url.startsWith("http") ? item.url : `https://${item.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)", textDecoration: "none" }} onClick={e => e.stopPropagation()}>
                                  {item.url.replace(/^https?:\/\/(www\.)?/, "")}
                                </a>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Masked Password Row + Quick Eye Icons */}
                      <div className="cred-password-actions-container">
                        <div style={{ fontFamily: "monospace", color: isPasswordRevealed ? "#a78bfa" : "var(--text-secondary)", background: "rgba(0,0,0,0.2)", padding: "0.3rem 0.6rem", borderRadius: "6px", fontSize: "0.9rem", minWidth: "120px", textAlign: "center" }}>
                          {isPasswordRevealed ? item.password : "••••••••"}
                        </div>
                        
                        <div className="cred-actions-row">
                          {/* Eye icon for peeking */}
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: "32px", height: "32px", fontSize: "0.85rem" }}
                            onClick={(e) => togglePasswordVisibility(item.id, e)}
                            title={isPasswordRevealed ? "Hide Password" : "Show Password"}
                          >
                            {isPasswordRevealed ? "🙈" : "👁️"}
                          </button>

                          {/* Copy Clipboard button */}
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: "32px", height: "32px", fontSize: "0.85rem" }}
                            onClick={() => onCopyPassword(item.password)}
                            title="Copy Password"
                          >
                            📋
                          </button>

                          {/* Edit details */}
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: "32px", height: "32px", fontSize: "0.85rem" }}
                            onClick={() => onEditItem(item)}
                            title="Edit Item"
                          >
                            ✏️
                          </button>

                          {/* Delete details */}
                          <button
                            className="btn btn-danger btn-icon"
                            style={{ width: "32px", height: "32px", fontSize: "0.85rem" }}
                            onClick={() => onDeleteItem(item.id)}
                            title="Delete Item"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
