let databaseLoaded = false;

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "../js/pdf.worker.min.js";

document
    .getElementById("pdfInput")
    .addEventListener(
        "change",
        loadPdf
    );

document
    .getElementById("drugCsv")
    .addEventListener(
        "change",
        loadDrugDatabase
    );

async function loadPdf(event) {

if (!databaseLoaded) {

    alert(
        "Előbb töltsd be a gyógyszertörzs CSV-t!"
    );

    return;

}

    const file =
        event.target.files[0];

    if (!file) {

        return;

    }

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

    // ============================
    // Fejléc felismerése
    // ============================

    const headers = {};

    content.items.forEach(item => {

        const text = item.str.trim();

        switch (text) {

            case "Éjjel 0-4":
                headers.night = Math.round(item.transform[4]);
                break;

            case "Hajnal 4-8":
                headers.dawn = Math.round(item.transform[4]);
                break;

            case "Reggel 8-12":
                headers.morning = Math.round(item.transform[4]);
                break;

            case "Dél 12-16":
                headers.noon = Math.round(item.transform[4]);
                break;

            case "Délután 16-20":
                headers.afternoon = Math.round(item.transform[4]);
                break;

            case "Este 20-24":
                headers.evening = Math.round(item.transform[4]);
                break;

        }

    });

    Utils.log(headers);

    // ============================
    // Oszlophatárok kiszámítása
    // ============================

   const columns = buildColumns(headers);

const doses = [];

content.items.forEach(item => {

    const text = item.str.trim();

    if (/^\d+\s+[A-Z]+$/i.test(text)) {

        const x = Math.round(item.transform[4]);
        const y = Math.round(item.transform[5]);

        const column = columns.find(col =>
            x >= col.min &&
            x < col.max
        );

        doses.push({

            dose: text,

            period: column
                ? column.period
                : "Ismeretlen",

            x,
            y

        });

    }

});

const located =

    MedicationLocator.locate(

        content.items,

        doses

    );

const merged =

    MedicationMerger.merge(

        located

    );

merged.forEach(med => {

    const drug =

        DrugDatabase.findByName(

            med.medication

        );

    if(!drug){

        med.found = false;

        return;

    }

    med.found = true;

    med.ean =
        drug.ean;

    med.substance =
        drug.substance;

    med.active =
        drug.active;

    med.canSubstitute =

        DrugDatabase.canSubstitute(

            drug.substance

        );

    med.alternatives =

        DrugDatabase

            .findActiveBySubstance(

                drug.substance

            );

});

renderResult(merged);

    // Utils.log(columns);

    // ============================
    // Tokenek
    // ============================

    renderTokens(
        content.items
    );

    // ============================
    // Sorok
    // ============================

    const rows =
        PdfLayoutParser.parse(
            content.items
        );

    renderRows(rows);

    // ============================
    // Gyógyszersorok
    // ============================

    /*
const medicationRows =
    rows.filter(
        row =>
            row.type ===
            "medication"
    );

const result =
    MedicationParser.parse(
        medicationRows
    );
*/

    // Egyelőre az oszlopokat jelenítjük meg

    // renderResult(columns);

}

function buildColumns(headers) {

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

}

function renderTokens(items) {

    const tbody =
        document.querySelector(
            "#tokenTable tbody"
        );

    tbody.innerHTML = "";

    items.forEach((item, index) => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

<td>${index}</td>

<td>${Math.round(item.transform[4])}</td>

<td>${Math.round(item.transform[5])}</td>

<td>${item.fontName}</td>

<td>${Math.round(item.width)}</td>

<td>${Math.round(item.height)}</td>

<td>${item.str}</td>

`;

        tbody.appendChild(tr);

    });

}

function renderResult(result) {

    document
        .getElementById("result")
        .textContent =

        JSON.stringify(

            result,

            null,

            4

        );

}

function renderRows(rows) {

    const output =
        rows.map(row => {

            const icon =

                row.type ===
                "medication"

                ? "💊"

                : "•";

            return (

                icon +

                " " +

                row.text

            );

        });

    document
        .getElementById("rows")
        .textContent =

        output.join("\n");

}

function getPeriod(x, columns) {

    return columns.find(col =>

        x >= col.min &&
        x < col.max

    );

}


async function loadDrugDatabase(event){

    const file =
        event.target.files[0];

    if(!file){

        return;

    }

    await DrugDatabase.load(file);

    databaseLoaded = true;

    alert(

        "Gyógyszertörzs betöltve: " +

        DrugDatabase.count() +

        " rekord"

    );

}
