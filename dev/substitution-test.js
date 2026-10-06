/*
=========================================
DrugAssist

Fájl:
substitution-test.js

Feladata:
Gyógyszerhelyettesítés
tesztelése.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "../js/pdf.worker.min.js";

let databaseLoaded = false;

document.addEventListener(

    "DOMContentLoaded",

    init

);

function init(){

    document

        .getElementById(
            "drugCsv"
        )

        .addEventListener(

            "change",

            loadDrugDatabase

        );

    document

        .getElementById(
            "pdfInput"
        )

        .addEventListener(

            "change",

            loadPdf

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

        "Gyógyszertörzs betöltve (" +

        DrugDatabase.count() +

        " rekord)"

    );

}

async function loadPdf(event){

    if(!databaseLoaded){

        alert(

            "Előbb töltsd be a gyógyszertörzset!"

        );

        return;

    }

    const file =
        event.target.files[0];

    if(!file){

        return;

    }

    const medications =

        await PatientPdfParser.parse(
            file
        );

console.log(
    JSON.stringify(
        medications,
        null,
        4
    )
);

    renderCards(

        medications

    );

}

function renderCards(medications){

    const container =

        document.getElementById(
            "cards"
        );

    container.innerHTML = "";

    medications.forEach(med=>{

        const card =
            document.createElement("div");

        card.className =
            "card";

        card.innerHTML = `

<h3>

${med.medication}

</h3>

<p>

Hatóanyag:

<strong>

${med.substance}

</strong>

</p>

<p>

EAN:

${med.ean}

</p>

<p>

Helyettesíthető:

<b>

${med.canSubstitute ? "Igen" : "Nem"}

</b>

</p>

<button
class="btnSubstitute">

🔄 Helyettesítés

</button>

`;

        const button =

            card.querySelector(

                ".btnSubstitute"

            );

        if(!med.canSubstitute){

            button.disabled = true;

        }

        button.onclick = ()=>{

            SubstitutionModal.open(

                med,

                selectedDrug=>{

                    med.medication =
                        selectedDrug.name;

                    med.ean =
                        selectedDrug.ean;

                    med.substance =
                        selectedDrug.substance;

                    med.active =
                        selectedDrug.active;

                    renderCards(

                        medications

                    );

                }

            );

        };

        container.appendChild(

            card

        );

    });

}