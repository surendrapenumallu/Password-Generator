/* =====================================
   DOM REFERENCES
===================================== */

const passwordField =
document.getElementById("password");

const lengthSlider =
document.getElementById("length");

const lengthValue =
document.getElementById("lengthValue");

const generateBtn =
document.getElementById("generateBtn");

const passphraseBtn =
document.getElementById("passphraseBtn");

const toggleBtn =
document.getElementById("toggleBtn");

const copyBtn =
document.getElementById("copyBtn");

const themeBtn =
document.getElementById("themeBtn");

const strengthBar =
document.getElementById("strengthBar");

const strengthText =
document.getElementById("strengthText");

const entropyText =
document.getElementById("entropyText");

const generatedCount =
document.getElementById("generatedCount");

const avgEntropy =
document.getElementById("avgEntropy");

const uppercase =
document.getElementById("uppercase");

const lowercase =
document.getElementById("lowercase");

const numbers =
document.getElementById("numbers");

const symbols =
document.getElementById("symbols");

/* =====================================
   APPLICATION STATE
===================================== */

let totalGenerated = 0;

let entropyHistory = [];

/* =====================================
   LOAD SAVED SETTINGS
===================================== */

function loadTheme() {

    const savedTheme =
        localStorage.getItem("theme");

    if(savedTheme === "light") {

        document.body.classList.add(
            "light"
        );

    }
}

loadTheme();

/* =====================================
   LENGTH SLIDER
===================================== */

lengthSlider.addEventListener(
    "input",
    () => {

        lengthValue.textContent =
            lengthSlider.value;

    }
);

/* =====================================
   THEME TOGGLE
===================================== */

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );

        const theme =
            document.body.classList.contains(
                "light"
            )
            ? "light"
            : "dark";

        localStorage.setItem(
            "theme",
            theme
        );

    }
);

/* =====================================
   PASSWORD GENERATOR
===================================== */

async function generatePassword() {

    try {

        const url =
            `/api/password?length=${lengthSlider.value}` +
            `&uppercase=${uppercase.checked}` +
            `&lowercase=${lowercase.checked}` +
            `&numbers=${numbers.checked}` +
            `&symbols=${symbols.checked}`;

        const response =
            await fetch(url);

        const data =
            await response.json();

        passwordField.value =
            data.password;

        updateStrength(
            data.password
        );

        updateEntropy(
            data.entropy
        );

        updateAnalytics(
            data.entropy
        );

    }
    catch(error) {

        console.error(
            "Password Generation Error:",
            error
        );

        alert(
            "Unable to generate password."
        );

    }
}

generateBtn.addEventListener(
    "click",
    generatePassword
);

/* =====================================
   PASSPHRASE GENERATOR
===================================== */

async function generatePassphrase() {

    try {

        const response =
            await fetch(
                "/api/passphrase?words=4"
            );

        const data =
            await response.json();

        passwordField.value =
            data.passphrase;

        updateStrength(
            data.passphrase
        );

        updateEntropy(
            data.entropy
        );

        updateAnalytics(
            data.entropy
        );

    }
    catch(error) {

        console.error(
            "Passphrase Error:",
            error
        );

    }
}

passphraseBtn.addEventListener(
    "click",
    generatePassphrase
);

/* =====================================
   SHOW / HIDE PASSWORD
===================================== */

toggleBtn.addEventListener(
    "click",
    () => {

        if(
            passwordField.type ===
            "password"
        ) {

            passwordField.type =
                "text";

            toggleBtn.textContent =
                "Hide";

        }
        else {

            passwordField.type =
                "password";

            toggleBtn.textContent =
                "Show";

        }

    }
);

/* =====================================
   PASSWORD STRENGTH
===================================== */

function updateStrength(
    password
) {

    // Show strength section
    const section = document.getElementById("strengthSection");
    if (section) section.style.display = "block";

    let score = 0;

    if(password.length >= 8)
        score++;

    if(password.length >= 12)
        score++;

    if(/[A-Z]/.test(password))
        score++;

    if(/[0-9]/.test(password))
        score++;

    if(/[^a-zA-Z0-9]/.test(password))
        score++;

    const width = Math.max(10, (score / 5) * 100);
    strengthBar.style.width = width + "%";

    if(score <= 2) {
        strengthBar.style.background = "var(--danger)";
        strengthText.textContent = "Weak";
    }
    else if(score <= 3) {
        strengthBar.style.background = "var(--warning)";
        strengthText.textContent = "Medium";
    }
    else {
        strengthBar.style.background = "var(--success)";
        strengthText.textContent = "Strong";
    }

}

/* =====================================
   ENTROPY DISPLAY
===================================== */

function updateEntropy(
    entropy
) {

    entropyText.textContent =
        `Entropy: ${entropy} bits`;

}

/* =====================================
   ANALYTICS
===================================== */

function updateAnalytics(
    entropy
) {

    totalGenerated++;

    entropyHistory.push(
        parseFloat(entropy)
    );

    generatedCount.textContent =
        totalGenerated;

    const average =
        entropyHistory.reduce(
            (a,b)=>a+b,
            0
        ) /
        entropyHistory.length;

    avgEntropy.textContent =
        average.toFixed(2);

}

/* =====================================
   INITIAL STATE
===================================== */

lengthValue.textContent =
    lengthSlider.value;

strengthText.textContent =
    "-";

entropyText.textContent =
    "Entropy: 0 bits";


    /* =====================================
   PART 2
   HISTORY + COPY + QR + EXPORT
===================================== */

/* =====================================
   DOM REFERENCES
===================================== */

const historyTable =
document.getElementById(
    "historyTable"
);

const categorySelect =
document.getElementById(
    "category"
);

const exportCsvBtn =
document.getElementById(
    "exportCsvBtn"
);

const exportPdfBtn =
document.getElementById(
    "exportPdfBtn"
);

const qrContainer =
document.getElementById(
    "qrcode"
);

/* =====================================
   COPY PASSWORD
===================================== */

copyBtn.addEventListener(
    "click",
    async () => {

        const password =
            passwordField.value;

        if(!password){
            return;
        }

        try{

            await navigator.clipboard.writeText(
                password
            );

            const toast =
                new bootstrap.Toast(
                    document.getElementById(
                        "copyToast"
                    )
                );

            toast.show();

        }
        catch(error){

            console.error(
                "Copy failed",
                error
            );

        }

    }
);

/* =====================================
   HISTORY STORAGE
===================================== */

function getHistory(){

    return JSON.parse(
        localStorage.getItem(
            "passwordHistory"
        )
    ) || [];

}

function saveHistory(
    password,
    entropy
){

    const history =
        getHistory();

    history.unshift({

        password,

        category:
            categorySelect.value,

        entropy,

        createdAt:
            new Date().toLocaleString()

    });

    const trimmed =
        history.slice(0,50);

    localStorage.setItem(
        "passwordHistory",
        JSON.stringify(trimmed)
    );

    renderHistory();

}

/* =====================================
   HISTORY TABLE
===================================== */

function renderHistory(){

    const history =
        getHistory();

    historyTable.innerHTML =
        "";

    history.forEach(item => {

        const row =
        `
        <tr>
            <td>
                ${item.password}
            </td>

            <td>
                ${item.category}
            </td>

            <td>
                ${item.createdAt}
            </td>
        </tr>
        `;

        historyTable.innerHTML +=
            row;

    });

}

/* =====================================
   QR GENERATION
===================================== */

function generateQRCode(
    text
){

    if(!qrContainer){
        return;
    }

    qrContainer.innerHTML =
        "";

    QRCode.toCanvas(
        text,
        {
            width:180
        },
        (err,canvas)=>{

            if(err){

                console.error(err);

                return;

            }

            qrContainer.appendChild(
                canvas
            );

        }
    );

}

/* =====================================
   OVERRIDE GENERATE PASSWORD
===================================== */

const originalGeneratePassword =
generatePassword;

generatePassword =
async function(){

    await originalGeneratePassword();

    const password =
        passwordField.value;

    const entropy =
        entropyText.textContent
        .replace(
            "Entropy: ",
            ""
        )
        .replace(
            " bits",
            ""
        );

    saveHistory(
        password,
        entropy
    );

    generateQRCode(
        password
    );

};

/* =====================================
   OVERRIDE PASSPHRASE
===================================== */

const originalPassphrase =
generatePassphrase;

generatePassphrase =
async function(){

    await originalPassphrase();

    const password =
        passwordField.value;

    const entropy =
        entropyText.textContent
        .replace(
            "Entropy: ",
            ""
        )
        .replace(
            " bits",
            ""
        );

    saveHistory(
        password,
        entropy
    );

    generateQRCode(
        password
    );

};

/* =====================================
   REBIND BUTTONS
===================================== */

generateBtn.removeEventListener(
    "click",
    originalGeneratePassword
);

generateBtn.addEventListener(
    "click",
    generatePassword
);

passphraseBtn.removeEventListener(
    "click",
    originalPassphrase
);

passphraseBtn.addEventListener(
    "click",
    generatePassphrase
);

/* =====================================
   EXPORT CSV
===================================== */

exportCsvBtn.addEventListener(
    "click",
    ()=>{

        const history =
            getHistory();

        if(
            history.length === 0
        ){
            return;
        }

        let csv =
        "Password,Category,Entropy,CreatedAt\n";

        history.forEach(item=>{

            csv +=
            `"${item.password}",` +
            `"${item.category}",` +
            `"${item.entropy}",` +
            `"${item.createdAt}"\n`;

        });

        const blob =
            new Blob(
                [csv],
                {
                    type:
                    "text/csv"
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
            "password-history.csv";

        link.click();

        URL.revokeObjectURL(
            url
        );

    }
);

/* =====================================
   EXPORT PDF
===================================== */

exportPdfBtn.addEventListener(
    "click",
    ()=>{

        const history =
            getHistory();

        if(
            history.length === 0
        ){
            return;
        }

        const {
            jsPDF
        } = window.jspdf;

        const pdf =
            new jsPDF();

        pdf.setFontSize(
            18
        );

        pdf.text(
            "Password Vault Report",
            15,
            20
        );

        let y = 35;

        history.forEach(
            (item,index)=>{

            pdf.setFontSize(
                10
            );

            pdf.text(

                `${index+1}. ` +
                `${item.password}` +
                ` | ${item.category}` +
                ` | ${item.createdAt}`,

                10,
                y

            );

            y += 8;

            if(y > 280){

                pdf.addPage();

                y = 20;

            }

        });

        pdf.save(
            "password-vault-report.pdf"
        );

    }
);

/* =====================================
   RESTORE HISTORY
===================================== */

renderHistory();

/* =====================================
   AUTO QR ON PAGE LOAD
===================================== */

if(
    passwordField.value
){

    generateQRCode(
        passwordField.value
    );

}
/* =====================================
   PART 3
   PWA + ANALYTICS + REMINDERS
===================================== */

/* =====================================
   INSTALL APP BUTTON
===================================== */

const installBtn =
document.getElementById(
    "installBtn"
);

let deferredPrompt =
null;

window.addEventListener(
    "beforeinstallprompt",
    (event)=>{

        event.preventDefault();

        deferredPrompt =
            event;

        if(installBtn){

            installBtn.style.display =
                "inline-block";

        }

    }
);

if(installBtn){

    installBtn.addEventListener(
        "click",
        async ()=>{

            if(!deferredPrompt){
                return;
            }

            deferredPrompt.prompt();

            await deferredPrompt.userChoice;

            deferredPrompt =
                null;

        }
    );

}

/* =====================================
   SERVICE WORKER
===================================== */

if(
    "serviceWorker"
    in navigator
){

    window.addEventListener(
        "load",
        ()=>{

            navigator
            .serviceWorker
            .register(
                "/sw.js"
            )
            .then(()=>{

                console.log(
                    "Service Worker Registered"
                );

            })
            .catch(error=>{

                console.error(
                    error
                );

            });

        }
    );

}

/* =====================================
   ANALYTICS STORAGE
===================================== */

function loadAnalytics(){

    const analytics =
        JSON.parse(
            localStorage.getItem(
                "vaultAnalytics"
            )
        );

    if(!analytics){

        return {
            generated:0,
            entropy:[]
        };

    }

    return analytics;

}

function saveAnalytics(
    generated,
    entropy
){

    localStorage.setItem(
        "vaultAnalytics",

        JSON.stringify({

            generated,

            entropy

        })

    );

}

function restoreAnalytics(){

    const analytics =
        loadAnalytics();

    totalGenerated =
        analytics.generated;

    entropyHistory =
        analytics.entropy;

    generatedCount.textContent =
        totalGenerated;

    if(
        entropyHistory.length
    ){

        const avg =

        entropyHistory.reduce(
            (a,b)=>a+b,
            0
        ) /

        entropyHistory.length;

        avgEntropy.textContent =
            avg.toFixed(2);

    }

}

restoreAnalytics();

/* =====================================
   WRAP ANALYTICS UPDATE
===================================== */

const originalUpdateAnalytics =
updateAnalytics;

updateAnalytics =
function(entropy){

    originalUpdateAnalytics(
        entropy
    );

    saveAnalytics(
        totalGenerated,
        entropyHistory
    );

};

/* =====================================
   COUNTER ANIMATION
===================================== */

function animateCounter(
    element,
    start,
    end,
    duration
){

    let startTime =
        null;

    function animation(
        currentTime
    ){

        if(!startTime){

            startTime =
                currentTime;

        }

        const progress =

        Math.min(

            (
                currentTime -
                startTime
            ) /

            duration,

            1

        );

        element.textContent =

        Math.floor(

            progress *
            (end-start)

            + start

        );

        if(progress < 1){

            requestAnimationFrame(
                animation
            );

        }

    }

    requestAnimationFrame(
        animation
    );

}

/* =====================================
   START COUNTERS
===================================== */

window.addEventListener(
    "load",
    ()=>{

        animateCounter(

            generatedCount,

            0,

            totalGenerated,

            1200

        );

    }
);

/* =====================================
   PASSWORD EXPIRATION
===================================== */

function saveExpirationReminder(){

    const history =
        getHistory();

    const reminders =

    history.map(item=>{

        const created =
            new Date(
                item.createdAt
            );

        const expire =
            new Date(
                created
            );

        expire.setDate(

            expire.getDate() + 90

        );

        return{

            password:
                item.password,

            category:
                item.category,

            expires:
                expire

        };

    });

    localStorage.setItem(

        "passwordReminders",

        JSON.stringify(
            reminders
        )

    );

}

function checkReminders(){

    const reminders =

    JSON.parse(

        localStorage.getItem(
            "passwordReminders"
        )

    ) || [];

    const today =
        new Date();

    reminders.forEach(item=>{

        const expire =
            new Date(
                item.expires
            );

        const diff =

        Math.ceil(

            (
                expire -
                today
            )

            /

            (
                1000*
                60*
                60*
                24
            )

        );

        if(
            diff > 0 &&
            diff <= 7
        ){

            console.warn(

                `Password in ${item.category}
                 expires in ${diff} days`

            );

        }

    });

}

saveExpirationReminder();

checkReminders();

/* =====================================
   HISTORY SEARCH
===================================== */

function searchHistory(
    keyword
){

    const history =
        getHistory();

    return history.filter(item=>

        item.password
        .toLowerCase()
        .includes(
            keyword.toLowerCase()
        )

        ||

        item.category
        .toLowerCase()
        .includes(
            keyword.toLowerCase()
        )

    );

}

/* =====================================
   OPTIONAL SEARCH INPUT
===================================== */

const searchBox =
document.getElementById(
    "searchHistory"
);

if(searchBox){

    searchBox.addEventListener(
        "keyup",
        ()=>{

            const results =

            searchHistory(
                searchBox.value
            );

            historyTable.innerHTML =
                "";

            results.forEach(item=>{

                historyTable.innerHTML +=

                `
                <tr>

                <td>
                ${item.password}
                </td>

                <td>
                ${item.category}
                </td>

                <td>
                ${item.createdAt}
                </td>

                </tr>
                `;

            });

        }
    );

}

/* =====================================
   THEME RESTORE
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        const theme =

        localStorage.getItem(
            "theme"
        );

        if(
            theme === "light"
        ){

            document.body
            .classList.add(
                "light"
            );

        }

    }
);

/* =====================================
   PARTICLES.JS
===================================== */

if(
    typeof particlesJS !==
    "undefined"
){

    particlesJS(

        "particles-js",

        {

            particles:{

                number:{
                    value:80
                },

                color:{
                    value:"#6366f1"
                },

                shape:{
                    type:"circle"
                },

                opacity:{
                    value:0.4
                },

                size:{
                    value:3
                },

                move:{
                    enable:true,
                    speed:2
                }

            },

            interactivity:{

                detect_on:
                    "canvas",

                events:{

                    onhover:{
                        enable:true,
                        mode:"repulse"
                    }

                }

            }

        }

    );

}

/* =====================================
   APP START
===================================== */

console.log(
    "Password Vault Pro Loaded"
);