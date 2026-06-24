import React, { useState, useEffect, useRef } from "react";
import AuthScreen from "./components/AuthScreen";
import VaultDashboard from "./components/VaultDashboard";
import ItemModal from "./components/ItemModal";
import PinSetupScreen from "./components/PinSetupScreen";
import { setupVault, unlockVault, encryptData, decryptData, encryptMasterPassword, decryptMasterPassword, setupPin, verifyPin } from "./utils/crypto";
import { generateRecoveryPhrase } from "./utils/words";
import logoImg from "./assets/logo.png";
import { Capacitor } from "@capacitor/core";

export default function App() {
  // Global Vault Verification state (from localStorage)
  const [isFirstTime, setIsFirstTime] = useState(() => {
    return !localStorage.getItem("securevault_salt");
  });

  // Dynamic vault reset helper for developer testing
  useEffect(() => {
    if (window.location.search.includes("reset=true")) {
      localStorage.clear();
      window.location.href = window.location.origin;
    }
  }, []);

  // Secure In-Memory States (Wiped on Lock)
  const [masterKey, setMasterKey] = useState(null);
  const [decryptedItems, setDecryptedItems] = useState([]);
  const [needsPinSetup, setNeedsPinSetup] = useState(false);
  
  // UI Control states
  const [activeModalItem, setActiveModalItem] = useState(null); // null, 'new', or item object
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const inactivityTimerRef = useRef(null);
  const autoLockTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  // 1. Lock vault: Wipes everything in-memory immediately
  const handleLockVault = () => {
    setMasterKey(null);
    setDecryptedItems([]);
    setNeedsPinSetup(false);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  };

  // 2. Setup Vault (first-time initialization)
  const handleSetupVault = async (masterPassword, recoveryPhrase, pin) => {
    try {
      const result = await setupVault(masterPassword);
      const recoveryData = await encryptMasterPassword(masterPassword, recoveryPhrase);
      const pinResult = await setupPin(pin);
      
      // Save verifier details to localStorage
      localStorage.setItem("securevault_salt", result.salt);
      localStorage.setItem("securevault_verifier_cipher", result.verifierCipher);
      localStorage.setItem("securevault_verifier_iv", result.verifierIv);
      localStorage.setItem("securevault_items", JSON.stringify([]));

      // Save recovery details to localStorage
      localStorage.setItem("securevault_recovery_salt", recoveryData.recoverySalt);
      localStorage.setItem("securevault_recovery_encrypted_password", recoveryData.recoveryEncryptedPassword);
      localStorage.setItem("securevault_recovery_encrypted_iv", recoveryData.recoveryEncryptedIv);

      // Save PIN details to localStorage
      localStorage.setItem("securevault_pin_salt", pinResult.pinSalt);
      localStorage.setItem("securevault_pin_verifier_cipher", pinResult.pinVerifierCipher);
      localStorage.setItem("securevault_pin_verifier_iv", pinResult.pinVerifierIv);

      setMasterKey(result.key);
      setDecryptedItems([]);
      setIsFirstTime(false);
      resetInactivityTimer();
    } catch (e) {
      console.error("Setup failed:", e);
      alert("Failed to initialize vault due to a system cryptography error.");
    }
  };

  // 2b. Recover master password using recovery phrase
  const handleRecoverVault = async (recoveryPhrase) => {
    const salt = localStorage.getItem("securevault_recovery_salt");
    const encryptedPassword = localStorage.getItem("securevault_recovery_encrypted_password");
    const encryptedIv = localStorage.getItem("securevault_recovery_encrypted_iv");

    if (!salt || !encryptedPassword || !encryptedIv) {
      throw new Error("No recovery information found in this vault.");
    }

    try {
      const oldMasterPassword = await decryptMasterPassword(
        recoveryPhrase,
        salt,
        encryptedPassword,
        encryptedIv
      );
      return oldMasterPassword;
    } catch (e) {
      console.error("Recovery decryption failed:", e);
      throw new Error("Incorrect recovery phrase. Verification failed.");
    }
  };

  // 2c. Reset Master Password using recovery phrase and new password
  const handleResetMasterPassword = async (oldMasterPassword, newMasterPassword, recoveryPhrase) => {
    try {
      // 1. Decrypt all existing items in localStorage using oldMasterPassword
      const oldSalt = localStorage.getItem("securevault_salt");
      const oldKey = await unlockVault(
        oldMasterPassword,
        oldSalt,
        localStorage.getItem("securevault_verifier_cipher"),
        localStorage.getItem("securevault_verifier_iv")
      );

      const encryptedItemsString = localStorage.getItem("securevault_items") || "[]";
      const encryptedItems = JSON.parse(encryptedItemsString);
      const decrypted = [];

      for (const encItem of encryptedItems) {
        try {
          const decryptedPayload = await decryptData(encItem.ciphertext, encItem.iv, oldKey);
          const parsed = JSON.parse(decryptedPayload);
          decrypted.push({
            id: encItem.id,
            ...parsed
          });
        } catch (e) {
          console.error(`Failed to decrypt item ${encItem.id} during reset:`, e);
        }
      }

      // 2. Setup vault with new master password
      const result = await setupVault(newMasterPassword);
      
      // Save new verifiers
      localStorage.setItem("securevault_salt", result.salt);
      localStorage.setItem("securevault_verifier_cipher", result.verifierCipher);
      localStorage.setItem("securevault_verifier_iv", result.verifierIv);

      // Re-encrypt the new master password using the recovery phrase
      const recoveryData = await encryptMasterPassword(newMasterPassword, recoveryPhrase);
      localStorage.setItem("securevault_recovery_salt", recoveryData.recoverySalt);
      localStorage.setItem("securevault_recovery_encrypted_password", recoveryData.recoveryEncryptedPassword);
      localStorage.setItem("securevault_recovery_encrypted_iv", recoveryData.recoveryEncryptedIv);

      // 3. Re-encrypt all items with the new master key
      const reEncryptedItems = [];
      for (const item of decrypted) {
        const { id, title, category, username, password, url, notes, updatedAt } = item;
        const plainTextPayload = JSON.stringify({ title, category, username, password, url, notes, updatedAt });
        const encrypted = await encryptData(plainTextPayload, result.key);
        reEncryptedItems.push({
          id,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv
        });
      }

      localStorage.setItem("securevault_items", JSON.stringify(reEncryptedItems));

      // Clear old PIN so they must set up a new one
      localStorage.removeItem("securevault_pin_salt");
      localStorage.removeItem("securevault_pin_verifier_cipher");
      localStorage.removeItem("securevault_pin_verifier_iv");

      setMasterKey(result.key);
      setDecryptedItems(decrypted);
      setNeedsPinSetup(true);
      setIsFirstTime(false);
      resetInactivityTimer();
    } catch (e) {
      console.error("Password reset failed:", e);
      throw new Error("Failed to reset master password due to a system cryptography error.");
    }
  };

  // 3. Unlock Vault
  const handleUnlockVault = async (masterPassword) => {
    const salt = localStorage.getItem("securevault_salt");
    const verifierCipher = localStorage.getItem("securevault_verifier_cipher");
    const verifierIv = localStorage.getItem("securevault_verifier_iv");

    // Decrypt verifier token to confirm password
    const key = await unlockVault(masterPassword, salt, verifierCipher, verifierIv);
    setMasterKey(key);

    // Decrypt all items in localStorage into state memory
    const encryptedItemsString = localStorage.getItem("securevault_items") || "[]";
    const encryptedItems = JSON.parse(encryptedItemsString);
    const decrypted = [];

    for (const encItem of encryptedItems) {
      try {
        const decryptedPayload = await decryptData(encItem.ciphertext, encItem.iv, key);
        const parsed = JSON.parse(decryptedPayload);
        decrypted.push({
          id: encItem.id,
          ...parsed
        });
      } catch (e) {
        console.error(`Failed to decrypt item ${encItem.id}:`, e);
      }
    }

    setDecryptedItems(decrypted);
    resetInactivityTimer();

    // Check if Security PIN has been set
    const pinSalt = localStorage.getItem("securevault_pin_salt");
    if (!pinSalt) {
      setNeedsPinSetup(true);
    } else {
      setNeedsPinSetup(false);
    }
  };

  // 4. Save Credential (New or Edited)
  const handleSaveItem = async (itemPayload) => {
    // Encrypt content
    const { id, title, category, username, password, url, notes, updatedAt } = itemPayload;
    const plainTextPayload = JSON.stringify({ title, category, username, password, url, notes, updatedAt });
    const encrypted = await encryptData(plainTextPayload, masterKey);

    // Retrieve active items
    const encryptedItemsString = localStorage.getItem("securevault_items") || "[]";
    const encryptedItems = JSON.parse(encryptedItemsString);

    const targetIdx = encryptedItems.findIndex(x => x.id === id);
    const updatedEncryptedItem = {
      id,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv
    };

    if (targetIdx >= 0) {
      // Edit existing
      encryptedItems[targetIdx] = updatedEncryptedItem;
      
      setDecryptedItems(prev => {
        const copy = [...prev];
        const idx = copy.findIndex(x => x.id === id);
        copy[idx] = itemPayload;
        return copy;
      });
    } else {
      // Add new
      encryptedItems.push(updatedEncryptedItem);
      
      setDecryptedItems(prev => [...prev, itemPayload]);
    }

    localStorage.setItem("securevault_items", JSON.stringify(encryptedItems));
    setActiveModalItem(null);
    resetInactivityTimer();

    // Trigger success toast
    setToastMessage("Credential encrypted & saved successfully.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // 5. Delete Credential
  const handleDeleteItem = (itemId) => {
    if (window.confirm("Are you sure you want to permanently delete this password entry?")) {
      const encryptedItemsString = localStorage.getItem("securevault_items") || "[]";
      const encryptedItems = JSON.parse(encryptedItemsString);
      const filteredEncrypted = encryptedItems.filter(x => x.id !== itemId);
      
      localStorage.setItem("securevault_items", JSON.stringify(filteredEncrypted));
      
      setDecryptedItems(prev => prev.filter(x => x.id !== itemId));
      resetInactivityTimer();
    }
  };

  // 6. Copy password to clipboard & auto-clear
  const handleCopyPassword = (pass) => {
    if (!pass) return;
    
    navigator.clipboard.writeText(pass).then(() => {
      setToastMessage("Password copied! Clipboard will auto-clear in 15 seconds.");
      setShowToast(true);

      // Hide toast in 4 seconds
      setTimeout(() => setShowToast(false), 4000);

      // Overwrite clipboard after 15 seconds to prevent vulnerability
      setTimeout(() => {
        navigator.clipboard.readText().then(current => {
          if (current === pass) {
            navigator.clipboard.writeText("");
            console.log("Clipboard cleared for security.");
          }
        }).catch(() => {
          // If browser restricts read access, just clear it anyway
          navigator.clipboard.writeText("");
        });
      }, 15000);
    });
  };

  // 7. Export Vault (Downloader)
  const handleExportVault = async () => {
    const salt = localStorage.getItem("securevault_salt");
    const verifierCipher = localStorage.getItem("securevault_verifier_cipher");
    const verifierIv = localStorage.getItem("securevault_verifier_iv");
    const encryptedItems = JSON.parse(localStorage.getItem("securevault_items") || "[]");
    const recoverySalt = localStorage.getItem("securevault_recovery_salt") || "";
    const recoveryEncryptedPassword = localStorage.getItem("securevault_recovery_encrypted_password") || "";
    const recoveryEncryptedIv = localStorage.getItem("securevault_recovery_encrypted_iv") || "";

    const exportData = {
      app: "SecureVault",
      version: "1.1",
      salt,
      verifierCipher,
      verifierIv,
      items: encryptedItems,
      recoverySalt,
      recoveryEncryptedPassword,
      recoveryEncryptedIv
    };

    const fileName = `securevault_backup_${new Date().toISOString().split("T")[0]}.json`;

    if (Capacitor.isNativePlatform()) {
      try {
        const { Filesystem, Directory } = await import("@capacitor/filesystem");
        const { Share } = await import("@capacitor/share");

        const jsonString = JSON.stringify(exportData, null, 2);

        // Write the file to Cache directory
        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: jsonString,
          directory: Directory.Cache,
          encoding: "utf8"
        });

        // Open the native Share sheet
        await Share.share({
          title: "Export SecureVault Backup",
          text: "Here is your encrypted SecureVault backup file.",
          url: writeResult.uri,
          dialogTitle: "Save or Share Backup"
        });
      } catch (err) {
        console.error("Native export failed:", err);
        alert("Failed to export backup: " + err.message);
      }
    } else {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", fileName);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  // 8. Import Vault
  const handleImportVault = (importedData) => {
    if (importedData.app !== "SecureVault") {
      alert("Unsupported file type. Please upload a SecureVault backup file.");
      return;
    }

    if (window.confirm("Warning: Importing this backup will overwrite all current passwords. Continue?")) {
      localStorage.setItem("securevault_salt", importedData.salt);
      localStorage.setItem("securevault_verifier_cipher", importedData.verifierCipher);
      localStorage.setItem("securevault_verifier_iv", importedData.verifierIv);
      localStorage.setItem("securevault_items", JSON.stringify(importedData.items));
      
      // Restore recovery details
      if (importedData.recoverySalt) {
        localStorage.setItem("securevault_recovery_salt", importedData.recoverySalt);
        localStorage.setItem("securevault_recovery_encrypted_password", importedData.recoveryEncryptedPassword);
        localStorage.setItem("securevault_recovery_encrypted_iv", importedData.recoveryEncryptedIv);
      } else {
        localStorage.removeItem("securevault_recovery_salt");
        localStorage.removeItem("securevault_recovery_encrypted_password");
        localStorage.removeItem("securevault_recovery_encrypted_iv");
      }

      // Lock vault to force re-authentication using the backup's master password
      handleLockVault();
      setIsFirstTime(false);
      alert("Vault backup imported successfully. Please unlock using the master password of the imported backup.");
    }
  };

  // Security auto-lock mechanisms
  const resetInactivityTimer = () => {
    if (!masterKey) return;

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      handleLockVault();
      setToastMessage("Vault auto-locked due to inactivity.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, autoLockTime);
  };

  // Listen for user actions to reset inactivity timer
  useEffect(() => {
    const events = ["mousemove", "keydown", "mousedown", "scroll"];
    const handleActivity = () => resetInactivityTimer();

    if (masterKey) {
      events.forEach(event => window.addEventListener(event, handleActivity));
    }

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [masterKey]);

  // Lock vault instantly when tab goes inactive / hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && masterKey) {
        handleLockVault();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [masterKey]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* NAVBAR */}
      <header className="navbar" style={{ padding: "0.8rem 2rem", background: "#111318", borderBottom: "1px solid var(--border-glass)" }}>
        <div className="nav-brand" style={{ fontSize: "1.4rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img src={logoImg} alt="Logo" style={{ width: "32px", height: "32px", borderRadius: "6px" }} />
          <span>SecureVault</span>
        </div>
        <div className="nav-stats">
          <div className="stat-badge confidence" style={{ color: masterKey ? "#10b981" : "#ef4444", borderColor: masterKey ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)" }}>
            <span>{masterKey ? "🔓 Decrypted Session" : "🔒 Session Locked"}</span>
          </div>
        </div>
      </header>

      {/* CORE ROUTER VIEW */}
      <main style={{ flexGrow: 1, paddingBottom: "3rem" }}>
        {!masterKey ? (
          <AuthScreen
            isFirstTime={isFirstTime}
            onUnlock={handleUnlockVault}
            onSetup={handleSetupVault}
            onRecover={handleRecoverVault}
            onResetPassword={handleResetMasterPassword}
            onImport={handleImportVault}
          />
        ) : needsPinSetup ? (
          <PinSetupScreen
            onSetupPin={async (pin) => {
              const pinResult = await setupPin(pin);
              localStorage.setItem("securevault_pin_salt", pinResult.pinSalt);
              localStorage.setItem("securevault_pin_verifier_cipher", pinResult.pinVerifierCipher);
              localStorage.setItem("securevault_pin_verifier_iv", pinResult.pinVerifierIv);
              setNeedsPinSetup(false);
            }}
          />
        ) : (
          <VaultDashboard
            items={decryptedItems}
            onAddNewItem={() => setActiveModalItem("new")}
            onEditItem={(item) => setActiveModalItem(item)}
            onDeleteItem={handleDeleteItem}
            onLock={handleLockVault}
            onExportVault={handleExportVault}
            onImportVault={handleImportVault}
            onCopyPassword={handleCopyPassword}
            onSaveItem={handleSaveItem}
          />
        )}
      </main>

      {/* ITEM CREATE/EDIT MODAL OVERLAY */}
      {activeModalItem && (
        <ItemModal
          item={activeModalItem === "new" ? null : activeModalItem}
          onSave={handleSaveItem}
          onClose={() => setActiveModalItem(null)}
        />
      )}

      {/* CLIPBOARD COPIED TOAST */}
      {showToast && (
        <div className="clipboard-toast">
          {toastMessage}
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border-glass)", padding: "1.5rem", textAlign: "center", fontSize: "0.82rem", color: "var(--text-secondary)", background: "#111318" }}>
        <div>
          <strong>SecureVault</strong> — Zero-Knowledge Client-Side Password Manager
        </div>
        <div style={{ marginTop: "0.3rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          Data is encrypted with AES-GCM-256 and derived using PBKDF2 (100,000 iterations). Your credentials never touch our servers.
        </div>
      </footer>

    </div>
  );
}
