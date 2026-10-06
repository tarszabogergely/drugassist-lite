/*
=========================================
DrugAssist

Fájl:
dashboard.js

Feladata:
A dashboard működése.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

document.addEventListener("DOMContentLoaded", () => {

    // Ideiglenes tesztfelhasználó
    // A login elkészülésekor ezt töröljük.

    Storage.saveUser({

        id: "G03",

        name: "Tarszabó Gergely"

    });

const today =
    Utils.getToday();

const workDate =
    Storage.loadWorkDate();

if (workDate !== today) {

    Storage.clearWards();

    Storage.saveWorkDate(
        today
    );

}

    const pdfInput = document.getElementById("pdfInput");

    if (!pdfInput) {

        Utils.log("Nem található a pdfInput.");

        return;

    }

    pdfInput.addEventListener("change", handlePdfImport);

    Utils.log("Dashboard betöltve.");

const wards =

    Storage.loadWards();

Render.renderWardCards(
    wards
);

});

async function handlePdfImport(event) {

    const file = event.target.files[0];

    if (!file) {

        return;

    }

    Utils.log("PDF kiválasztva:", file.name);

    try {

        const ward = await PdfImport.importWardPdf(file);

Storage.mergeWard(ward);

const wards =

    Storage.loadWards();

Render.renderWardCards(
    wards
);

Utils.log(
    "Osztály betöltve:",
    ward.wardName
);


    }

    catch (error) {

        console.error(error);

    }

}