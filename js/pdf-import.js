/*
=========================================
DrugAssist

Fájl:
pdf-import.js

Feladata:
PDF állományok feldolgozása, betegek és 
gyógyszerelések átemelése a tárolóba.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

pdfjsLib.GlobalWorkerOptions.workerSrc = CONFIG.pdf?.worker || "js/pdf.worker.min.js";

const PdfImport = {

    /*
    =====================================
    Osztályos PDF beolvasása és feldolgozása
    =====================================
    */
    async importWardPdf(file) {

        if (!file) {

            throw new Error("Nincs kiválasztott fájl.");

        }

        Utils.log("Osztályos PDF feldolgozás indítása:", file.name);

        const buffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

        let text = "";

        const allItems = [];

        for (let i = 1; i <= pdf.numPages; i++) {

            const page = await pdf.getPage(i);

            const content = await page.getTextContent();

            allItems.push(

                ...content.items.map(item => ({

                    text: item.str,

                    x: Math.round(item.transform[4]),

                    y: Math.round(item.transform[5]),

                    width: Math.round(item.width || 0),

                    height: Math.round(item.height || 0)

                }))

            );

            text += content.items.map(item => item.str).join(" ") + "\n";

        }

        const wardData = this.parseWardPdf(text, allItems);

        if (!wardData || !wardData.wardCode) {

            throw new Error("Nem sikerült feldolgozni az osztályos PDF tartalmát.");

        }

        // Adatok mentése a Storage modulon keresztül (Supabase / LocalStorage)
        if (Storage.mergeWard) {

            await Storage.mergeWard(wardData);

        }

        return wardData;

    },

    /*
    =====================================
    Osztályos PDF szövegtartalmának elemzése
    =====================================
    */
    parseWardPdf(text, items) {

        const lines = text

            .split(/\s{2,}|\n/)

            .map(line => Utils.cleanPdfText(line))

            .filter(line => line.length > 0);

        // Osztálykód és név keresése
        let wardCode = "";

        const wardLine = lines.find(line => /^\d{5}\b/.test(line));

        if (wardLine) {

            wardCode = wardLine.match(/^\d{5}/)[0];

        }

        const department = typeof Departments !== "undefined" ? Departments.find(wardCode) : null;

        const wardName = department ? department.name : "";

        // Betegek kinyerése
        const patients = [];

        for (let i = 0; i < lines.length; i++) {

            if (/^\d{9}$/.test(lines[i])) {

                const patient = {

                    patientId: lines[i],

                    name: lines[i - 1] || "",

                    wardCode: wardCode,

                    wardName: wardName,

                    bed: this.findBed(items, lines[i]),

                    onWard: true,

                    lastImport: Utils.getToday(),

                    workDate: null,

                    status: CONFIG.status.NEW,

                    preparation: null,

                    medications: []

                };

                patients.push(patient);

            }

        }

        return {

            wardCode,

            wardName,

            patients

        };

    },

    /*
    =====================================
    Egyéni beteg PDF lázlap beolvasása
    =====================================
    */
    async importPatientPdf(file) {

        if (!file) {

            throw new Error("Nincs kiválasztott fájl.");

        }

        Utils.log("Beteg PDF feldolgozás indítása:", file.name);

        const buffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {

            const page = await pdf.getPage(i);

            const content = await page.getTextContent();

            text += content.items.map(item => item.str).join(" ") + "\n";

        }

        text = Utils.cleanPdfText(text);

        const start = text.indexOf("Éjjel 0-4");

        const end = text.indexOf("Lázlap történet");

        if (start !== -1 && end !== -1) {

            text = text.substring(start, end);

        }

        return this.parsePatientPdf(text);

    },

    /*
    =====================================
    Ágy kinyerése koordináták alapján
    =====================================
    */
    findBed(items, patientId) {

        const idItem = items.find(item => item.text.trim() === patientId.trim());

        if (!idItem) {

            return "";

        }

        const doctor = items.find(item =>

            Math.abs(item.y - idItem.y) <= 2 &&

            item.x > 350 &&

            /^dr\.?/i.test(item.text)

        );

        if (!doctor) {

            return "";

        }

        const candidates = items.filter(item =>

            Math.abs(item.y - idItem.y) <= 2 &&

            item.x < doctor.x &&

            /\d/.test(item.text)

        );

        if (!candidates.length) {

            return "";

        }

        candidates.sort((a, b) => b.x - a.x);

        return candidates[0].text.trim();

    },

    /*
    =====================================
    Beteg lázlap gyógyszereinek kinyerése
    =====================================
    */
    parsePatientPdf(text) {

        if (typeof MedicationParser !== "undefined") {

            return MedicationParser.parse(text);

        }

        Utils.log("A MedicationParser nem található.");

        return [];

    }

};
