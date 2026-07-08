/* =====================================
   PASSWORD VAULT PRO
   ENCRYPTED VAULT
===================================== */

/* =====================================
   DOM ELEMENTS
===================================== */

const masterPasswordInput = document.getElementById("masterPassword");
const vaultPlatformSelect = document.getElementById("vaultPlatformSelect");
const vaultPlatformInput = document.getElementById("vaultPlatform");
const vaultUsernameInput = document.getElementById("vaultUsername");
const vaultPasswordInput = document.getElementById("vaultPassword");
const vaultAutofillBtn = document.getElementById("vaultAutofillBtn");
const addCredentialBtn = document.getElementById("addCredentialBtn");
const credentialsTableBody = document.getElementById("credentialsTableBody");
const loadVaultBtn = document.getElementById("loadVaultBtn");
const lockVaultBtn = document.getElementById("lockVaultBtn");
const clearVaultBtn = document.getElementById("clearVaultBtn");
const vaultLockedState = document.getElementById("vaultLockedState");
const vaultUnlockedState = document.getElementById("vaultUnlockedState");

/* =====================================
   STORAGE KEYS & STATE
===================================== */

const VAULT_KEY = "encryptedVault";
const MASTER_HASH_KEY = "masterPasswordHash";
let vaultCredentials = [];

/* =====================================
   HASH & CRYPTO HELPERS
===================================== */

function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

function createMasterPassword(password) {
    const hash = hashPassword(password);
    localStorage.setItem(MASTER_HASH_KEY, hash);
}

function verifyMasterPassword(password) {
    const storedHash = localStorage.getItem(MASTER_HASH_KEY);
    if (!storedHash) {
        createMasterPassword(password);
        return true;
    }
    return hashPassword(password) === storedHash;
}

function encryptVaultData(text, password) {
    return CryptoJS.AES.encrypt(text, password).toString();
}

function decryptVaultData(encrypted, password) {
    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, password);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption error:", error);
        return "";
    }
}

/* =====================================
   VAULT RENDERING & STATE TOGGLING
==================================== */

function showUnlockedState() {
    vaultLockedState.style.display = "none";
    vaultUnlockedState.style.display = "block";
    masterPasswordInput.disabled = true;
}

function renderVault() {
    credentialsTableBody.innerHTML = "";
    if (vaultCredentials.length === 0) {
        credentialsTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-3">
                    No credentials saved yet.
                </td>
            </tr>
        `;
        return;
    }

    vaultCredentials.forEach((cred, index) => {
        const tr = document.createElement("tr");

        // Platform Badge
        const tdPlatform = document.createElement("td");
        const spanPlatform = document.createElement("span");
        
        const platformLower = (cred.platform || "").toLowerCase();
        let classSuffix = "default";
        if (["github", "netflix", "swiggy", "google", "facebook", "amazon"].includes(platformLower)) {
            classSuffix = platformLower;
        }
        
        spanPlatform.className = `vault-platform-badge vault-platform-${classSuffix}`;
        spanPlatform.textContent = cred.platform || "Unknown";
        tdPlatform.appendChild(spanPlatform);
        tr.appendChild(tdPlatform);

        // Username
        const tdUsername = document.createElement("td");
        tdUsername.className = "vault-mono";
        tdUsername.textContent = cred.username || "—";
        tr.appendChild(tdUsername);

        // Password Masked
        const tdPassword = document.createElement("td");
        tdPassword.className = "vault-mono";
        const spanPass = document.createElement("span");
        spanPass.id = `pass-text-${index}`;
        spanPass.textContent = "••••••••";
        spanPass.dataset.realPassword = cred.password;
        spanPass.dataset.visible = "false";
        tdPassword.appendChild(spanPass);
        tr.appendChild(tdPassword);

        // Actions
        const tdActions = document.createElement("td");
        tdActions.className = "text-end";
        tdActions.innerHTML = `
            <button class="btn btn-sm btn-outline-info me-1 vault-btn-sm" onclick="togglePasswordVisibility(${index})">👁️</button>
            <button class="btn btn-sm btn-outline-light me-1 vault-btn-sm" onclick="copyToClipboard(document.getElementById('pass-text-${index}').dataset.realPassword)">📋 Copy</button>
            <button class="btn btn-sm btn-outline-danger vault-btn-sm" onclick="deleteCredential(${index})">🗑️</button>
        `;
        tr.appendChild(tdActions);

        credentialsTableBody.appendChild(tr);
    });
}

function lockVault() {
    vaultCredentials = [];
    credentialsTableBody.innerHTML = "";
    vaultLockedState.style.display = "grid";
    vaultUnlockedState.style.display = "none";
    masterPasswordInput.disabled = false;
    masterPasswordInput.value = "";
    if (vaultPlatformSelect) {
        vaultPlatformSelect.selectedIndex = 0;
    }
    vaultPlatformInput.value = "";
    vaultPlatformInput.style.display = "none";
    vaultUsernameInput.value = "";
    vaultPasswordInput.value = "";
}

/* =====================================
   CORE ACTIONS
===================================== */

function loadVault() {
    const masterPassword = masterPasswordInput.value.trim();
    if (!masterPassword) {
        alert("❌ Enter a master password to unlock");
        return;
    }

    const encrypted = localStorage.getItem(VAULT_KEY);
    if (!encrypted) {
        // Initialize new vault
        if (!localStorage.getItem(MASTER_HASH_KEY)) {
            createMasterPassword(masterPassword);
        }
        vaultCredentials = [];
        showUnlockedState();
        renderVault();
        return;
    }

    if (!verifyMasterPassword(masterPassword)) {
        alert("❌ Invalid master password");
        return;
    }

    const decrypted = decryptVaultData(encrypted, masterPassword);
    if (!decrypted) {
        alert("❌ Unable to decrypt vault");
        return;
    }

    try {
        vaultCredentials = JSON.parse(decrypted);
        if (!Array.isArray(vaultCredentials)) {
            vaultCredentials = [];
        }
    } catch (e) {
        // Fallback for legacy plain text vault format
        vaultCredentials = [
            {
                platform: "Legacy Vault Notes",
                username: "notes",
                password: decrypted
            }
        ];
    }

    showUnlockedState();
    renderVault();
}

function addCredential() {
    let platform = "";
    if (vaultPlatformSelect) {
        const selectedVal = vaultPlatformSelect.value;
        if (selectedVal === "custom") {
            platform = vaultPlatformInput.value.trim();
        } else {
            platform = selectedVal;
        }
    } else {
        platform = vaultPlatformInput.value.trim();
    }

    const username = vaultUsernameInput.value.trim();
    const password = vaultPasswordInput.value.trim();
    const masterPassword = masterPasswordInput.value.trim();

    if (!platform || !username || !password) {
        alert("❌ Please fill out all fields: Platform, Username, and Password");
        return;
    }

    const newCred = { platform, username, password };
    vaultCredentials.push(newCred);

    const encrypted = encryptVaultData(JSON.stringify(vaultCredentials), masterPassword);
    localStorage.setItem(VAULT_KEY, encrypted);
    localStorage.setItem("vaultLastSaved", new Date().toISOString());

    // Clear form inputs
    if (vaultPlatformSelect) {
        vaultPlatformSelect.selectedIndex = 0;
    }
    vaultPlatformInput.value = "";
    vaultPlatformInput.style.display = "none";
    vaultUsernameInput.value = "";
    vaultPasswordInput.value = "";

    renderVault();
}

function deleteCredential(index) {
    if (!confirm("Are you sure you want to delete this credential?")) {
        return;
    }

    vaultCredentials.splice(index, 1);
    const masterPassword = masterPasswordInput.value.trim();
    const encrypted = encryptVaultData(JSON.stringify(vaultCredentials), masterPassword);
    localStorage.setItem(VAULT_KEY, encrypted);
    localStorage.setItem("vaultLastSaved", new Date().toISOString());

    renderVault();
}

function clearVault() {
    const confirmed = confirm("🔥 DANGER: Delete your encrypted vault permanently? This cannot be undone.");
    if (!confirmed) return;

    localStorage.removeItem(VAULT_KEY);
    localStorage.removeItem(MASTER_HASH_KEY);
    lockVault();
}

/* =====================================
   CLIPBOARD & VISIBILITY HELPERS
===================================== */

async function copyToClipboard(text) {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        const toastEl = document.getElementById("copyToast");
        if (toastEl) {
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
        }
    } catch (err) {
        console.error("Copy failed:", err);
    }
}

function togglePasswordVisibility(index) {
    const span = document.getElementById(`pass-text-${index}`);
    if (!span) return;
    const isVisible = span.dataset.visible === "true";
    if (isVisible) {
        span.textContent = "••••••••";
        span.dataset.visible = "false";
    } else {
        span.textContent = span.dataset.realPassword;
        span.dataset.visible = "true";
    }
}

/* =====================================
   BACKUP & RESTORE
===================================== */

function exportVaultBackup() {
    const encrypted = localStorage.getItem(VAULT_KEY);
    if (!encrypted) {
        alert("❌ No vault found to backup");
        return;
    }
    const blob = new Blob([encrypted], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vault-backup.txt";
    link.click();
    URL.revokeObjectURL(url);
}

function importVaultBackup(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const encrypted = event.target.result;
        localStorage.setItem(VAULT_KEY, encrypted);
        alert("✅ Backup imported. Please unlock your vault with the backup's master password.");
    };
    reader.readAsText(file);
}

/* =====================================
   AUTO LOCK TIMER (5 minutes)
===================================== */

let autoLockTimer;

function resetAutoLock() {
    clearTimeout(autoLockTimer);
    autoLockTimer = setTimeout(() => {
        if (vaultUnlockedState.style.display === "block") {
            lockVault();
            console.log("Vault auto-locked due to inactivity.");
        }
    }, 300000);
}

document.addEventListener("mousemove", resetAutoLock);
document.addEventListener("keydown", resetAutoLock);
resetAutoLock();

/* =====================================
   EVENT LISTENERS & EXPOSURE
===================================== */

if (loadVaultBtn) {
    loadVaultBtn.addEventListener("click", loadVault);
}

if (addCredentialBtn) {
    addCredentialBtn.addEventListener("click", addCredential);
}

if (lockVaultBtn) {
    lockVaultBtn.addEventListener("click", lockVault);
}

if (clearVaultBtn) {
    clearVaultBtn.addEventListener("click", clearVault);
}

if (vaultAutofillBtn) {
    vaultAutofillBtn.addEventListener("click", () => {
        const generatorPassword = document.getElementById("password").value;
        if (generatorPassword) {
            vaultPasswordInput.value = generatorPassword;
        } else {
            alert("❌ Generate a password first in the generator section!");
        }
    });
}

if (vaultPlatformSelect) {
    vaultPlatformSelect.addEventListener("change", () => {
        if (vaultPlatformSelect.value === "custom") {
            vaultPlatformInput.style.display = "block";
            vaultPlatformInput.focus();
        } else {
            vaultPlatformInput.style.display = "none";
            vaultPlatformInput.value = "";
        }
    });
}

// Expose click functions globally for inline HTML event handlers
window.togglePasswordVisibility = togglePasswordVisibility;
window.copyToClipboard = copyToClipboard;
window.deleteCredential = deleteCredential;
window.exportVaultBackup = exportVaultBackup;
window.importVaultBackup = importVaultBackup;

console.log("Vault Module Loaded Successfully");