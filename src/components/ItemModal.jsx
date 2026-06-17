import React, { useState } from "react";
import PasswordGen from "./PasswordGen";

export default function ItemModal({ item, onSave, onClose }) {
  const isEdit = !!item;

  const [title, setTitle] = useState(item?.title || "");
  const [category, setCategory] = useState(item?.category || "login");
  const [username, setUsername] = useState(item?.username || "");
  const [password, setPassword] = useState(item?.password || "");
  const [url, setUrl] = useState(item?.url || "");
  const [notes, setNotes] = useState(item?.notes || "");

  const [showPass, setShowPass] = useState(false);
  const [showGen, setShowGen] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (category !== "note" && !password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: item?.id || Date.now().toString(),
      title,
      category,
      username: category === "note" ? "" : username,
      password: category === "note" ? "" : password,
      url,
      notes,
      updatedAt: new Date().toISOString()
    });
  };

  const handleGeneratedPassword = (genPass) => {
    setPassword(genPass);
    setShowPass(true); // reveal so they can see the generated characters
    setShowGen(false); // close generator
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: showGen ? "800px" : "520px", transition: "max-width 0.3s ease" }}>
        
        <div style={{ display: "flex", gap: "2rem" }}>
          
          {/* MAIN EDIT FORM */}
          <div style={{ flexGrow: 1, minWidth: "280px" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "1.2rem" }} className="gradient-text">
              {isEdit ? "Edit Vault Item" : "Secure New Credential"}
            </h2>

            <form onSubmit={handleSaveSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Category */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                  Item Category
                </label>
                <select
                  className="input-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="login">Login / Account</option>
                  <option value="card">Payment Card Details</option>
                  <option value="note">Secure Note</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                  Title / Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Google, Bank Account"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                {errors.title && <span style={{ color: "#ef4444", fontSize: "0.78rem" }}>{errors.title}</span>}
              </div>

              {/* Conditionally render Username and Password if not a secure note */}
              {category !== "note" && (
                <>
                  {/* Username */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                      Username / Email
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Username, email, or client ID"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.3rem", display: "flex", justifyContent: "space-between" }}>
                      <span>Password</span>
                      <button
                        type="button"
                        style={{ background: "transparent", border: "none", color: "#a78bfa", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600" }}
                        onClick={() => setShowGen(!showGen)}
                      >
                        ⚡ Generate Password
                      </button>
                    </label>
                    <div className="input-wrapper">
                      <input
                        type={showPass ? "text" : "password"}
                        className="input-field"
                        placeholder="Secret key..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="input-icon-right"
                        onClick={() => setShowPass(!showPass)}
                        title="Toggle visibility"
                      >
                        {showPass ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {errors.password && <span style={{ color: "#ef4444", fontSize: "0.78rem" }}>{errors.password}</span>}
                  </div>
                </>
              )}

              {/* Website URL */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                  Website / URL
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                  {category === "note" ? "Secure Text Content" : "Additional Notes"}
                </label>
                <textarea
                  className="input-field"
                  style={{ minHeight: "80px", resize: "vertical" }}
                  placeholder="Insert secure descriptions, codes, or instructions here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Save/Close buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? "Update Item" : "Encrypt & Save"}
                </button>
              </div>
            </form>
          </div>

          {/* SIDE PANEL: PASSWORD GENERATOR (COLLAPSIBLE DRAWER) */}
          {showGen && (
            <div style={{ width: "300px", borderLeft: "1px solid var(--border-glass)", paddingLeft: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem" }} className="gradient-text">⚡ Password Generator</h3>
                <button
                  type="button"
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem" }}
                  onClick={() => setShowGen(false)}
                >
                  ✕
                </button>
              </div>
              <PasswordGen
                inlineMode={true}
                onSelectPassword={handleGeneratedPassword}
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
