/*
=========================================
DrugAssist

Fájl:
dashboard.js

Feladata:
A dashboard működése (Supabase adatbázis integrációval).

Fejlesztő:
Tarszabó Gergely + ChatGPT + Gemini

Verzió:
2.1.0
=========================================
*/

document.addEventListener("DOMContentLoaded", async () => {

    // Ideiglenes tesztfelhasználó
    if (Storage.saveUser) {
        await Storage.saveUser({
            id: "G03",
            name: "Tarszabó Gergely"
        });
    }

    const today = Utils.getToday();
    
    // Munkadátum frissítése (törlés nélkül!)
    if (Storage.saveWorkDate) {
        await Storage.saveWorkDate(today);
    }

    const pdfInput = document.getElementById("pdfInput");

    if (pdfInput) {
        pdfInput.addEventListener("change", handlePdfImport);
    } else {
        Utils.log("Nem található a pdfInput.");
    }

    Utils.log("Dashboard betöltve.");

    // Osztályok aszinkron betöltése Supabase-ből
    const wards = await Storage.loadWards();

    Render.renderWardCards(wards);

});

async function handlePdfImport(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    Utils.log("PDF kiválasztva:", file.name);

    try {

        const ward = await PdfImport.importWardPdf(file);

        if (Storage.mergeWard) {
            await Storage.mergeWard(ward);
        }

        const wards = await Storage.loadWards();

        Render.renderWardCards(wards);

        Utils.log(
            "Osztály betöltve:",
            ward.wardName
        );

    }

    catch (error) {

        console.error("Hiba a PDF importálása során:", error);

    }

}
