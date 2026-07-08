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

function getServiceIcon(platform) {
    const p = (platform || "").toLowerCase();
    const icons = {
        github:   { emoji: "🐙", cls: "svc-github" },
        netflix:  { emoji: "N",  cls: "svc-netflix" },
        swiggy:   { emoji: "🛵", cls: "svc-swiggy" },
        google:   { emoji: "G",  cls: "svc-google" },
        facebook: { emoji: "f",  cls: "svc-facebook" },
        amazon:   { emoji: "📦", cls: "svc-amazon" },
    };
    return icons[p] || { emoji: platform ? platform[0].toUpperCase() : "?", cls: "svc-default" };
}

function getStrengthInfo(password) {
    if (!password) return { score: 0, label: "None", level: "danger" };
    const len = password.length;
    let score = 0;
    if (len >= 8) score++;
    if (len >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Strong"];
    const levels = ["danger", "danger", "warn", "warn", "", ""];
    return { score, label: labels[score], level: levels[score] };
}

function renderVault() {
    credentialsTableBody.innerHTML = "";
    if (vaultCredentials.length === 0) {
        credentialsTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px 0;font-size:0.85rem;">
                    🔒 No credentials saved yet. Add one above!
                </td>
            </tr>
        `;
        return;
    }

    vaultCredentials.forEach((cred, index) => {
        const tr = document.createElement("tr");
        const svc = getServiceIcon(cred.platform);
        const str = getStrengthInfo(cred.password);

        // Service / Platform
        const tdService = document.createElement("td");
        tdService.innerHTML = `
            <div class="service-cell">
                <div class="service-icon ${svc.cls}">${svc.emoji}</div>
                <span class="service-name">${cred.platform || "Unknown"}</span>
            </div>
        `;
        tr.appendChild(tdService);

        // Username
        const tdUsername = document.createElement("td");
        tdUsername.style.color = "var(--text-muted)";
        tdUsername.style.fontSize = "0.85rem";
        tdUsername.textContent = cred.username || "—";
        tr.appendChild(tdUsername);

        // Password (masked)
        const tdPassword = document.createElement("td");
        tdPassword.innerHTML = `
            <span id="pass-text-${index}" class="pass-cell-text"
                  data-real-password="${cred.password}"
                  data-visible="false">••••••••</span>
        `;
        tr.appendChild(tdPassword);

        // Strength dots
        const tdStrength = document.createElement("td");
        const filledDotClass = str.level ? `filled ${str.level}` : "filled";
        const dotsHtml = Array.from({ length: 5 }, (_, i) =>
            `<div class="dot ${i < str.score ? filledDotClass : ""}"></div>`
        ).join("");
        tdStrength.innerHTML = `
            <div>
                <span class="strength-text-sm">${str.label}</span>
                <div class="strength-dots">${dotsHtml}<span style="font-size:0.7rem;color:var(--text-muted);margin-left:4px">${str.score}/5</span></div>
            </div>
        `;
        tr.appendChild(tdStrength);

        // Actions
        const tdActions = document.createElement("td");
        tdActions.innerHTML = `
            <div class="action-wrap">
                <button class="act-btn act-copy" title="Copy password"
                    onclick="copyToClipboard(document.getElementById('pass-text-${index}').dataset.realPassword)">📋</button>
                <button class="act-btn act-edit" title="Show/Hide"
                    onclick="togglePasswordVisibility(${index})">👁</button>
                <button class="act-btn act-del" title="Delete"
                    onclick="deleteCredential(${index})">🗑️</button>
            </div>
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