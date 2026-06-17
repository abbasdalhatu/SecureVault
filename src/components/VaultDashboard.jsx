import React, { useState } from "react";
import logoImg from "../assets/logo.png";

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
  onCopyPassword
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [revealedPasswords, setRevealedPasswords] = useState({});

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }} className="gradient-text">
            <img src={logoImg} alt="Logo" style={{ width: "40px", height: "40px", borderRadius: "8px", boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)" }} /> SecureVault
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            AES-GCM 256 Local Encrypted Password Manager
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
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
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Search and Vault Items Grid */}
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
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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

      </div>
    </div>
  );
}
