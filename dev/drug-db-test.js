/*
=========================================
DrugAssist

Fájl:
drug-db-test.js

Feladata:
A DrugDatabase modul tesztelése.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

document.addEventListener(
    "DOMContentLoaded",
    init
);

function init() {

    document
        .getElementById("csvInput")
        .addEventListener(
            "change",
            loadCsv
        );

    document
        .getElementById("btnName")
        .addEventListener(
            "click",
            searchByName
        );

    document
        .getElementById("btnSubstance")
        .addEventListener(
            "click",
            searchBySubstance
        );

}

async function loadCsv(event) {

    const file =
        event.target.files[0];

    if (!file) {

        return;

    }

    await DrugDatabase.load(file);

    Utils.log(
        "Gyógyszertörzs betöltve"
    );

    Utils.log(
        DrugDatabase.count()
    );

    // <<< IDE
    Utils.log(
        DrugDatabase.drugs
    );

    document
        .getElementById("result")
        .textContent =

        "Betöltött rekordok: " +

        DrugDatabase.count();

Utils.log(
    DrugDatabase.byName
);

Utils.log(
    DrugDatabase.bySubstance
);

Utils.log(
    DrugDatabase.byEan
);

}

function searchByName() {

    const text =

        document
            .getElementById(
                "searchName"
            )
            .value
            .trim();

    if (!text) {

        return;

    }

    const result =

        DrugDatabase.findByName(
            text
        );

    show(result);

}

function searchBySubstance() {

    const text =

        document
            .getElementById(
                "searchSubstance"
            )
            .value
            .trim();

    if (!text) {

        return;

    }

    const result =

        DrugDatabase.findBySubstance(
            text
        );

    show(result);

}

function show(data) {

    document
        .getElementById(
            "result"
        )
        .textContent =

        JSON.stringify(

            data,

            null,

            4

        );

}