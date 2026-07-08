/* =====================================
   PASSWORD VAULT PRO
   ENCRYPTED VAULT
===================================== */

/* =====================================
   DOM ELEMENTS
===================================== */

const masterPasswordInput =
document.getElementById(
    "masterPassword"
);

const vaultDataInput =
document.getElementById(
    "vaultData"
);

const saveVaultBtn =
document.getElementById(
    "saveVaultBtn"
);

const loadVaultBtn =
document.getElementById(
    "loadVaultBtn"
);

/* =====================================
   STORAGE KEYS
===================================== */

const VAULT_KEY =
"encryptedVault";

const MASTER_HASH_KEY =
"masterPasswordHash";

/* =====================================
   STATUS MESSAGE
===================================== */

function showVaultMessage(
    message,
    type = "info"
){

    console.log(
        `[Vault] ${message}`
    );

    if(type === "error"){

        alert(
            "❌ " + message
        );

    }
    else{

        alert(
            "✅ " + message
        );

    }

}

/* =====================================
   HASH MASTER PASSWORD
===================================== */

function hashPassword(
    password
){

    return CryptoJS.SHA256(
        password
    ).toString();

}

/* =====================================
   CREATE MASTER PASSWORD
===================================== */

function createMasterPassword(
    password
){

    const hash =
        hashPassword(
            password
        );

    localStorage.setItem(
        MASTER_HASH_KEY,
        hash
    );

}

/* =====================================
   VERIFY MASTER PASSWORD
===================================== */

function verifyMasterPassword(
    password
){

    const storedHash =
        localStorage.getItem(
            MASTER_HASH_KEY
        );

    if(!storedHash){

        createMasterPassword(
            password
        );

        return true;
    }

    return (
        hashPassword(
            password
        ) === storedHash
    );

}

/* =====================================
   ENCRYPT DATA
===================================== */

function encryptVaultData(
    text,
    password
){

    return CryptoJS.AES.encrypt(
        text,
        password
    ).toString();

}

/* =====================================
   DECRYPT DATA
===================================== */

function decryptVaultData(
    encrypted,
    password
){

    try{

        const bytes =
            CryptoJS.AES.decrypt(
                encrypted,
                password
            );

        return bytes.toString(
            CryptoJS.enc.Utf8
        );

    }
    catch(error){

        console.error(
            error
        );

        return "";
    }

}

/* =====================================
   SAVE VAULT
===================================== */

function saveVault(){

    const masterPassword =
        masterPasswordInput.value
        .trim();

    const vaultData =
        vaultDataInput.value
        .trim();

    if(!masterPassword){

        showVaultMessage(
            "Enter a master password",
            "error"
        );

        return;
    }

    if(!vaultData){

        showVaultMessage(
            "Vault is empty",
            "error"
        );

        return;
    }

    if(
        !verifyMasterPassword(
            masterPassword
        )
    ){

        showVaultMessage(
            "Invalid master password",
            "error"
        );

        return;
    }

    const encrypted =
        encryptVaultData(
            vaultData,
            masterPassword
        );

    localStorage.setItem(
        VAULT_KEY,
        encrypted
    );

    localStorage.setItem(
        "vaultLastSaved",
        new Date().toISOString()
    );

    showVaultMessage(
        "Vault saved successfully"
    );

}

/* =====================================
   LOAD VAULT
===================================== */

function loadVault(){

    const masterPassword =
        masterPasswordInput.value
        .trim();

    if(!masterPassword){

        showVaultMessage(
            "Enter master password",
            "error"
        );

        return;
    }

    const encrypted =
        localStorage.getItem(
            VAULT_KEY
        );

    if(!encrypted){

        showVaultMessage(
            "No vault found",
            "error"
        );

        return;
    }

    if(
        !verifyMasterPassword(
            masterPassword
        )
    ){

        showVaultMessage(
            "Wrong master password",
            "error"
        );

        return;
    }

    const decrypted =
        decryptVaultData(
            encrypted,
            masterPassword
        );

    if(!decrypted){

        showVaultMessage(
            "Unable to decrypt vault",
            "error"
        );

        return;
    }

    vaultDataInput.value =
        decrypted;

    showVaultMessage(
        "Vault loaded"
    );

}

/* =====================================
   LOCK VAULT
===================================== */

function lockVault(){

    vaultDataInput.value =
        "";

}

/* =====================================
   CLEAR VAULT
===================================== */

function clearVault(){

    const confirmed =
        confirm(
            "Delete encrypted vault?"
        );

    if(!confirmed){
        return;
    }

    localStorage.removeItem(
        VAULT_KEY
    );

    vaultDataInput.value =
        "";

    showVaultMessage(
        "Vault deleted"
    );

}

/* =====================================
   EXPORT ENCRYPTED BACKUP
===================================== */

function exportVaultBackup(){

    const encrypted =
        localStorage.getItem(
            VAULT_KEY
        );

    if(!encrypted){

        showVaultMessage(
            "No vault found",
            "error"
        );

        return;
    }

    const blob =
        new Blob(
            [encrypted],
            {
                type:
                "text/plain"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        "vault-backup.txt";

    link.click();

    URL.revokeObjectURL(
        url
    );

}

/* =====================================
   IMPORT BACKUP
===================================== */

function importVaultBackup(
    file
){

    const reader =
        new FileReader();

    reader.onload =
    function(event){

        const encrypted =
            event.target.result;

        localStorage.setItem(
            VAULT_KEY,
            encrypted
        );

        showVaultMessage(
            "Backup imported"
        );

    };

    reader.readAsText(
        file
    );

}

/* =====================================
   AUTO LOCK
===================================== */

let autoLockTimer;

function resetAutoLock(){

    clearTimeout(
        autoLockTimer
    );

    autoLockTimer =
    setTimeout(()=>{

        lockVault();

        showVaultMessage(
            "Vault locked"
        );

    },300000);

}

document.addEventListener(
    "mousemove",
    resetAutoLock
);

document.addEventListener(
    "keydown",
    resetAutoLock
);

resetAutoLock();

/* =====================================
   BUTTON EVENTS
===================================== */

if(saveVaultBtn){

    saveVaultBtn.addEventListener(
        "click",
        saveVault
    );

}

if(loadVaultBtn){

    loadVaultBtn.addEventListener(
        "click",
        loadVault
    );

}

/* =====================================
   EXPOSE GLOBALS
===================================== */

window.lockVault =
lockVault;

window.clearVault =
clearVault;

window.exportVaultBackup =
exportVaultBackup;

window.importVaultBackup =
importVaultBackup;

/* =====================================
   STARTUP
===================================== */

console.log(
    "Vault Module Loaded"
);