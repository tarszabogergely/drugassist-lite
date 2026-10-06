/*
=========================================
DrugAssist

Fájl:
utils.js

Feladata:
Általános segédfüggvények.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

const Utils = {

    /*
    --------------------------------------
    Aktuális dátum
    2026.06.24
    --------------------------------------
    */
    getToday() {

        const d = new Date();

        return (
            d.getFullYear() + "." +
            String(d.getMonth() + 1).padStart(2, "0") + "." +
            String(d.getDate()).padStart(2, "0")
        );

    },

    /*
    --------------------------------------
    Aktuális dátum + idő
    2026.06.24 14:35
    --------------------------------------
    */
    getDateTime() {

        const d = new Date();

        return (

            this.getToday() +

            " " +

            String(d.getHours()).padStart(2, "0") +

            ":" +

            String(d.getMinutes()).padStart(2, "0")

        );

    },

    /*
    --------------------------------------
    Egyedi címkeazonosító
    DA260624000001
    --------------------------------------
    */
    generateLabelCode(counter = 1) {

        const d = new Date();

        const date =

            String(d.getFullYear()).slice(2) +

            String(d.getMonth() + 1).padStart(2, "0") +

            String(d.getDate()).padStart(2, "0");

        return (

            (CONFIG.label?.barcodePrefix || "DA") +

            date +

            String(counter).padStart(6, "0")

        );

    },

    /*
    --------------------------------------
    GUID / UUID generálás
    --------------------------------------
    */
    uuid() {

        if (typeof crypto !== "undefined" && crypto.randomUUID) {

            return crypto.randomUUID();

        }

        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {

            const r = Math.random() * 16 | 0;

            const v = c === "x" ? r : (r & 0x3 | 0x8);

            return v.toString(16);

        });

    },

    /*
    --------------------------------------
    Név formázása
    pharma gergő -> Pharma Gergő
    --------------------------------------
    */
    capitalize(text) {

        if (!text) return "";

        return text

            .toLowerCase()

            .replace(

                /\b\w/g,

                c => c.toUpperCase()

            );

    },

    /*
    --------------------------------------
    Console log naplózás
    --------------------------------------
    */
    log(...args) {

        console.log(

            "[DrugAssist]",

            ...args

        );

    },

    /*
    --------------------------------------
    PDF szöveg tisztítása (ékezetek, ékezet-szóköz hibák)
    --------------------------------------
    */
    cleanPdfText(text) {

        if (!text) return "";

        return text

            .replace(/([A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű])\s([őűŐŰ])/g, "$1$2")

            .replace(/\s+/g, " ")

            .trim();

    },

    /*
    --------------------------------------
    Dátum objektum formázása
    --------------------------------------
    */
    formatDateTime(date) {

        if (!(date instanceof Date) || isNaN(date)) {

            date = new Date();

        }

        const p = n => String(n).padStart(2, "0");

        return (

            date.getFullYear() +

            "." +

            p(date.getMonth() + 1) +

            "." +

            p(date.getDate()) +

            " " +

            p(date.getHours()) +

            ":" +

            p(date.getMinutes())

        );

    }

};
