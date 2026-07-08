const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

/* ==========================
   MIDDLEWARE
========================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==========================
   STATIC FILES
========================== */

app.use(express.static(path.join(__dirname, "public")));

/* ==========================
   PASSWORD GENERATOR
========================== */

app.get("/api/password", (req, res) => {

    const length =
        parseInt(req.query.length) || 12;

    const useUpper =
        req.query.uppercase !== "false";

    const useLower =
        req.query.lowercase !== "false";

    const useNumbers =
        req.query.numbers !== "false";

    const useSymbols =
        req.query.symbols !== "false";

    let charset = "";

    if (useLower)
        charset += "abcdefghijklmnopqrstuvwxyz";

    if (useUpper)
        charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    if (useNumbers)
        charset += "0123456789";

    if (useSymbols)
        charset += "!@#$%^&*()_+[]{}<>?/|";

    if (!charset.length) {

        return res.status(400).json({
            success: false,
            message: "Select at least one character type"
        });

    }

    let password = "";

    for (let i = 0; i < length; i++) {

        const randomIndex =
            crypto.randomInt(
                0,
                charset.length
            );

        password +=
            charset[randomIndex];

    }

    const entropy =
        (
            length *
            Math.log2(charset.length)
        ).toFixed(2);

    res.json({

        success: true,

        password,

        entropy

    });

});

/* ==========================
   PASSPHRASE GENERATOR
========================== */

app.get("/api/passphrase", (req, res) => {

    const words = [

        "correct",
        "horse",
        "battery",
        "staple",
        "secure",
        "vault",
        "crypto",
        "dragon",
        "sunset",
        "galaxy",
        "ocean",
        "shadow",
        "rocket",
        "falcon",
        "nebula",
        "quantum",
        "matrix",
        "tiger",
        "planet",
        "phoenix"

    ];

    const wordCount =
        parseInt(req.query.words) || 4;

    const selected = [];

    for (let i = 0; i < wordCount; i++) {

        selected.push(

            words[
                crypto.randomInt(
                    0,
                    words.length
                )
            ]

        );

    }

    const passphrase =
        selected.join("-");

    const entropy =
        (
            wordCount *
            Math.log2(words.length)
        ).toFixed(2);

    res.json({

        success: true,

        passphrase,

        entropy

    });

});

/* ==========================
   HOME PAGE
========================== */

app.get("/", (req, res) => {

    res.sendFile(

        path.join(
            __dirname,
            "public",
            "index.html"
        )

    );

});

/* ==========================
   START SERVER
========================== */

app.listen(PORT, () => {

    console.log(
        `🚀 Password Vault Pro running at http://localhost:${PORT}`
    );

});