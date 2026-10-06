/*
=========================================
DrugAssist

Fájl:
drug-db-converter.js

Feladata:
CSV -> JSON konvertáló

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

document

    .getElementById(

        "convertBtn"

    )

    .addEventListener(

        "click",

        convertCsv

    );

async function convertCsv() {

    const file =

        document

            .getElementById(

                "csvInput"

            )

            .files[0];

    if (!file) {

        alert(

            "Válassz CSV fájlt!"

        );

        return;

    }

    const text =

        await file.text();

    const json =

        parseCsv(text);

    downloadJson(json);

}

/*
=====================================
CSV feldolgozása
=====================================
*/

function parseCsv(text) {

    const rows =

        text

            .trim()

            .split(/\r?\n/);

    // fejléc

    rows.shift();

    const drugs = [];

    rows.forEach(row => {

        if (!row.trim()) {

            return;

        }

        const cols =

            row.split(";");

        drugs.push({

            ean:

                cols[0].trim(),

            name:

                cols[1].trim(),

            substance:

                cols[2].trim(),

            active:

                cols[3].trim() === "1"

        });

    });

    return drugs;

}

/*
=====================================
JSON letöltése
=====================================
*/

function downloadJson(data) {

    const json =

        JSON.stringify(

            data,

            null,

            4

        );

    const blob =

        new Blob(

            [json],

            {

                type:

                "application/json"

            }

        );

    const url =

        URL.createObjectURL(

            blob

        );

    const a =

        document.createElement(

            "a"

        );

    a.href = url;

    a.download =

        "drug-database.json";

    a.click();

    URL.revokeObjectURL(

        url

    );

    document

        .getElementById(

            "result"

        )

        .innerHTML =

        `
        <b>Kész!</b><br>
        Rekordok:

        ${data.length}
        `;

}

