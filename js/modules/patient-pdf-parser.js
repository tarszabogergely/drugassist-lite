/*
=========================================
DrugAssist

Fájl:
patient-pdf-parser.js

Feladata:
Beteg gyógyszerelési PDF
feldolgozása.

Lépések:

- PDF beolvasása
- Fejléc felismerése
- Oszlopok meghatározása
- Adagolások felismerése
- Gyógyszernév hozzárendelése
- Gyógyszerek összevonása

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "js/pdf.worker.min.js";

const PatientPdfParser = {

    async parse(file) {

        const buffer =
            await file.arrayBuffer();

        const pdf =
            await pdfjsLib
                .getDocument({
                    data: buffer
                })
                .promise;

        const page =
            await pdf.getPage(1);

        const content =
            await page.getTextContent();

        const headers =
            this.findHeaders(
                content.items
            );

        const columns =
            this.buildColumns(
                headers
            );

        const doses =
            this.findDoses(
                content.items,
                columns
            );

        const located =
    MedicationLocator.locate(
        content.items,
        doses
    );

const merged =
    MedicationMerger.merge(
        located
    );

DrugDatabase.attachData(
    merged
);

const pdfText =

    content.items

        .map(item => item.str)

        .join(" ");

return {

    medications: merged,

    pdfText

};

    },

    /*
    =====================================
    Fejléc felismerése
    =====================================
    */

    findHeaders(items) {

        const headers = {};

        items.forEach(item => {

            const text =
                item.str.trim();

            switch (text) {

                case "Éjjel 0-4":

                    headers.night =
                        Math.round(
                            item.transform[4]
                        );

                    break;

                case "Hajnal 4-8":

                    headers.dawn =
                        Math.round(
                            item.transform[4]
                        );

                    break;

                case "Reggel 8-12":

                    headers.morning =
                        Math.round(
                            item.transform[4]
                        );

                    break;

                case "Dél 12-16":

                    headers.noon =
                        Math.round(
                            item.transform[4]
                        );

                    break;

                case "Délután 16-20":

                    headers.afternoon =
                        Math.round(
                            item.transform[4]
                        );

                    break;

                case "Este 20-24":

                    headers.evening =
                        Math.round(
                            item.transform[4]
                        );

                    break;

            }

        });

        return headers;

    },

    /*
    =====================================
    Oszlophatárok kiszámítása
    =====================================
    */

    buildColumns(headers) {

        const list = [

            ["Éjjel", headers.night],

            ["Hajnal", headers.dawn],

            ["Reggel", headers.morning],

            ["Dél", headers.noon],

            ["Délután", headers.afternoon],

            ["Este", headers.evening]

        ];

        const columns = [];

        for (let i = 0; i < list.length; i++) {

            const current = list[i];

            const prev = list[i - 1];

            const next = list[i + 1];

            columns.push({

                period: current[0],

                x: current[1],

                min: prev
                    ? Math.round(
                        (prev[1] + current[1]) / 2
                    )
                    : -Infinity,

                max: next
                    ? Math.round(
                        (current[1] + next[1]) / 2
                    )
                    : Infinity

            });

        }

        return columns;

    },

    /*
    =====================================
    Adagolások felismerése
    =====================================
    */

    findDoses(items, columns) {

        const doses = [];

        items.forEach(item => {

            const text =
                item.str.trim();

            // Gyógyszeradag felismerése
            // Később bővíthető:
            // AMP, ML, CSEPP, PUFF stb.

            if (!this.isDose(text)) {

            return;

            }

            const x =
                Math.round(
                    item.transform[4]
                );

            const y =
                Math.round(
                    item.transform[5]
                );

            const column =

                columns.find(col =>

                    x >= col.min &&
                    x < col.max

                );

            doses.push({

                dose: text,

                period:

                    column

                    ? column.period

                    : "Ismeretlen",

                x,

                y

            });

        });

        return doses;

    },

    /*
    =====================================
    Adagolás felismerése
    =====================================
    */

    isDose(text) {

        return /^\d+\s+[A-Z]+$/i
            .test(text);

    }

};