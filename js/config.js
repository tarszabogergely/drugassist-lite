/*
=========================================
DrugAssist

config.js

Projekt beállításai

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0

A fájl kizárólag konfigurációs adatokat
tartalmaz.

Programlogika nem kerülhet bele.

=========================================
*/

const CONFIG = {

    // ----- Program -----

    appName: "DrugAssist",

    version: "1.0.0",

    developer: "Tarszabó Gergely + ChatGPT",

    // ----- Címke -----

    label: {

        widthMM: 58,

        heightMM: 43,

        orientation: "landscape",

        barcodePrefix: "DA"

    },

    // ----- Státuszok -----

    status: {

        NEW: "new",

        LABEL_PRINTED: "label-printed",

        CHECKED: "checked",

        REVIEWED: "reviewed"

    },

    // ----- LocalStorage -----

    storage: {

        WARDS: "drugassist_wards",

        USER: "drugassist_user",

        SETTINGS: "drugassist_settings",

        CURRENT_WARD: "drugassist_current_ward",

        CURRENT_PATIENT: "drugassist_current_patient",

        WORK_DATE: "drugassist_work_date"

    },

    // ----- Adagolási időszakok -----

    doseTimes: [

        "Éjjel",
        "Hajnal",
        "Reggel",
        "Dél",
        "Délután",
        "Este"

    ],

    // ----- PDF -----

    pdf: {

        worker: "js/pdf.worker.min.js"

    },

    // ----- Dátum formátum -----

    dateFormat: {

        label: "YYYY.MM.DD",

        dateTime: "YYYY.MM.DD HH:mm"

    }

};