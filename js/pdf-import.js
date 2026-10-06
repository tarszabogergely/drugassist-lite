/*
=========================================
DrugAssist

Fájl:
pdf-import.js

Feladata:
PDF állományok feldolgozása és átemelése
a Supabase adatbázisba.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

pdfjsLib.GlobalWorkerOptions.workerSrc = CONFIG.pdf.worker;

const PdfImport = {

    async importWardPdf(file) {

        if (!file) {
            throw new Error("Nincs kiválasztott fájl.");
        }

        Utils.log("PDF feldolgozás indítása:", file.name);

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            fullText += pageText + "\n";
        }

        // PDF szöveg parser hívása
        const wardData = DmParser ? DmParser.parseWardText(fullText) : null;

        if (!wardData) {
            throw new Error("Nem sikerült feldolgozni a PDF tartalmát.");
        }

        // Adatok mentése Supabase-be a Storage modulon keresztül
        if (Storage.mergeWard) {
            await Storage.mergeWard(wardData);
        }

        return wardData;

    }

};
