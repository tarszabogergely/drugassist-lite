/*
==========================================================
DrugAssist Lite
Modul: Gyógyszerészi ellenőrzés
Fájl: review.js
Verzió: 0.1.0

Leírás:
A gyógyszerészi ellenőrzési oldal működését vezérlő modul.

Feladatai:
- A kiválasztott beteg betöltése
- Betegadatok megjelenítése
- Gyógyszerlista felépítése
- Morfológiai leírások megjelenítése
- Adagolási időpontok megjelenítése
- Gyógyszerenkénti ellenőrző pipa kezelése
- Az ellenőrzési állapot nyilvántartása
- Az "Ellenőrzés lezárása" gomb engedélyezése
- A gyógyszerelés lezárása

Felhasznált modulok:
- config.js
- storage.js
- utils.js
- morphology.js

Használt objektumok:
- patient
- patient.medications
- medication.schedule
- medication.checked

Működési folyamat:

review-ward.html
        │
        ▼
Beteg kiválasztása
        │
        ▼
Storage.loadPatient()
        │
        ▼
Betegadatok megjelenítése
        │
        ▼
Gyógyszerlista felépítése
        │
        ▼
Morfológiai leírások betöltése
        │
        ▼
Gyógyszerenkénti ellenőrzés
        │
        ▼
Minden gyógyszer ellenőrizve?
        │
        ├── Nem → Lezárás gomb tiltva
        │
        └── Igen
              │
              ▼
Gyógyszerelés lezárása

Fejlesztő:
Tarszabó Gergely + ChatGPT

==========================================================
*/

"use strict";

let patient = null;
let readOnly = false;

const reviewTable =
    document.getElementById("medicationTable");

const reviewButton =
    document.getElementById("reviewButton");

const patientName =
    document.getElementById("patientName");

const patientId =
    document.getElementById("patientId");

const patientWard =
    document.getElementById("patientWard");

const patientBed =
    document.getElementById("patientBed");

const productionId =
    document.getElementById("productionId");

const preparedBy =
    document.getElementById("preparedBy");

const reviewTitle =
    document.getElementById("reviewTitle");

const barcodeModal =
    document.getElementById(
        "barcodeModal"
    );

const barcodeInput =
    document.getElementById(
        "barcodeInput"
    );

const barcodeError =
    document.getElementById(
        "barcodeError"
    );

const cancelBarcode =
    document.getElementById(
        "cancelBarcode"
    );

const confirmBarcode =
    document.getElementById(
        "confirmBarcode"
    );


document.addEventListener(
    "DOMContentLoaded",
    init
);

async function init(){

    await Morphology.load();

    loadPatient();

    if(!patient){

        alert("Nincs kiválasztott beteg.");

        history.back();

        return;

    }

    readOnly =
        patient.status ===
        CONFIG.status.REVIEWED;

    renderPatient();

    renderMedicationTable();

    updateReviewButton();

    reviewButton.onclick =
        finishReview;

    cancelBarcode.onclick = ()=>{

        barcodeModal.classList.add(
            "hidden"
        );

    };

    confirmBarcode.onclick =
        checkBarcode;

    barcodeInput.addEventListener(

        "keydown",

        event=>{

            if(event.key !== "Enter"){

                return;

            }

            event.preventDefault();

            checkBarcode();

        }

    );

}


function loadPatient(){

    patient =
        Storage.loadPatient();

}

function renderPatient(){

    patientName.textContent =
        patient.name;

    patientId.textContent =
        patient.patientId || "-";

    patientWard.textContent =
        patient.wardName || "-";

    patientBed.textContent =
        patient.bed;

    productionId.textContent =

        patient.preparation

            ? patient.preparation.id

            : "-";

    preparedBy.textContent =

        patient.preparation?.preparedBy ||

        "-";

    reviewTitle.textContent =
        `💊 Gyógyszerészi ellenőrzés (${patient.medications.length} gyógyszer)`;

}

function renderMedicationTable(){

    reviewTable.innerHTML = "";

    patient.medications.forEach((medication,index)=>{

        if(medication.checked === undefined){

    medication.checked = false;

    Storage.savePatient(patient);

}

        const row =
            document.createElement("tr");

        row.dataset.index = index;

        if(medication.checked){

            row.classList.add("reviewed");

        }

        const schedule =
            medication.schedule || {};

        const description =
            Morphology.getDescription(
                medication.medication
            );

        row.innerHTML = `

<td class="drug-cell">

    <div class="drug-name">

        ${medication.medication}

    </div>

    <div class="drug-morphology">

        ${description}

    </div>

</td>

<td class="dose">${schedule["Éjjel"] || ""}</td>

<td class="dose">${schedule["Hajnal"] || ""}</td>

<td class="dose">${schedule["Reggel"] || ""}</td>

<td class="dose">${schedule["Dél"] || ""}</td>

<td class="dose">${schedule["Délután"] || ""}</td>

<td class="dose">${schedule["Este"] || ""}</td>

<td class="check-cell">

    <div class="check-button ${medication.checked ? "checked" : ""}">

        ${medication.checked ? "✔" : "✓"}

    </div>

</td>

`;

        const checkButton =
    row.querySelector(".check-button");

if(readOnly){

    checkButton.classList.add(
        "disabled"
    );

}

checkButton.onclick = ()=>{

    if(readOnly){

        return;

    }

            medication.checked =
    !medication.checked;

Storage.savePatient(
    patient
);

row.classList.toggle(
    "reviewed",
    medication.checked
);

checkButton.classList.toggle(
    "checked",
    medication.checked
);

checkButton.textContent =
    medication.checked
        ? "✔"
        : "✓";

updateReviewButton();

        };

        reviewTable.appendChild(row);

    });

}

function updateReviewButton(){

    if(readOnly){

        reviewButton.disabled = true;

        reviewButton.textContent =
            "✔ Ellenőrzés befejezve";

        return;

    }

    const allChecked =
        patient.medications.every(
            medication => medication.checked
        );

    reviewButton.disabled =
        !allChecked;

    reviewButton.textContent =
        "Ellenőrzés lezárása";

}

function finishReview(){

    if(readOnly){

        return;

    }

    openBarcodeModal();

}

function openBarcodeModal(){

    barcodeError.textContent = "";

    barcodeInput.value = "";

    barcodeModal.classList.remove(
        "hidden"
    );

    barcodeInput.focus();

}

function checkBarcode(){

    const barcode =
        barcodeInput.value.trim();

    if(
        barcode !==
        patient.preparation.id
    ){

        barcodeError.textContent =
            "❌ Hibás készítési azonosító!";

        barcodeInput.select();

        return;

    }

    patient.status =
        CONFIG.status.REVIEWED;

    Storage.savePatient(
        patient
    );

    barcodeModal.classList.add(
        "hidden"
    );

    alert(
        "A gyógyszerelés sikeresen lezárva."
    );

    location.href =
        "completed.html";

}