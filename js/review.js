/*
==========================================================
DrugAssist Lite
Modul: Gyógyszerészi ellenőrzés
Fájl: review.js
Verzió: 2.0.0

Leírás:
A gyógyszerészi ellenőrzési oldal működését vezérlő modul
(Supabase adatbázis integrációval).

Fejlesztő:
Tarszabó Gergely + ChatGPT
==========================================================
*/

"use strict";

let patient = null;
let readOnly = false;

const reviewTable = document.getElementById("medicationTable");
const reviewButton = document.getElementById("reviewButton");
const patientName = document.getElementById("patientName");
const patientId = document.getElementById("patientId");
const patientWard = document.getElementById("patientWard");
const patientBed = document.getElementById("patientBed");
const productionId = document.getElementById("productionId");
const preparedBy = document.getElementById("preparedBy");
const reviewTitle = document.getElementById("reviewTitle");

const barcodeModal = document.getElementById("barcodeModal");
const barcodeInput = document.getElementById("barcodeInput");
const barcodeError = document.getElementById("barcodeError");
const cancelBarcode = document.getElementById("cancelBarcode");
const confirmBarcode = document.getElementById("confirmBarcode");

document.addEventListener("DOMContentLoaded", init);

async function init() {

    if (typeof Morphology !== "undefined" && Morphology.load) {
        await Morphology.load();
    }

    await loadPatient();

    if (!patient) {

        alert("Nincs kiválasztott beteg.");

        history.back();

        return;

    }

    readOnly = patient.status === CONFIG.status.REVIEWED;

    renderPatient();

    await renderMedicationTable();

    updateReviewButton();

    if (reviewButton) {
        reviewButton.onclick = finishReview;
    }

    if (cancelBarcode) {
        cancelBarcode.onclick = () => {
            barcodeModal.classList.add("hidden");
        };
    }

    if (confirmBarcode) {
        confirmBarcode.onclick = checkBarcode;
    }

    if (barcodeInput) {

        barcodeInput.addEventListener("keydown", async event => {

            if (event.key !== "Enter") {

                return;

            }

            event.preventDefault();

            await checkBarcode();

        });

    }

}

async function loadPatient() {

    patient = await Storage.loadPatient();

}

function renderPatient() {

    patientName.textContent = patient.name;

    patientId.textContent = patient.patientId || "-";

    patientWard.textContent = patient.wardName || "-";

    patientBed.textContent = patient.bed || "-";

    productionId.textContent = patient.preparation
        ? patient.preparation.id
        : "-";

    preparedBy.textContent = patient.preparation?.preparedBy || "-";

    const medCount = (patient.medications || []).length;

    reviewTitle.textContent = `💊 Gyógyszerészi ellenőrzés (${medCount} gyógyszer)`;

}

async function renderMedicationTable() {

    reviewTable.innerHTML = "";

    const medications = patient.medications || [];

    for (let index = 0; index < medications.length; index++) {

        const medication = medications[index];

        if (medication.checked === undefined) {

            medication.checked = false;

            await Storage.savePatient(patient);

        }

        const row = document.createElement("tr");

        row.dataset.index = index;

        if (medication.checked) {

            row.classList.add("reviewed");

        }

        const schedule = medication.schedule || {};

        const description = (typeof Morphology !== "undefined" && Morphology.getDescription)
            ? Morphology.getDescription(medication.medication)
            : "";

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

        const checkButton = row.querySelector(".check-button");

        if (readOnly) {

            checkButton.classList.add("disabled");

        }

        checkButton.onclick = async () => {

            if (readOnly) {

                return;

            }

            medication.checked = !medication.checked;

            await Storage.savePatient(patient);

            row.classList.toggle("reviewed", medication.checked);

            checkButton.classList.toggle("checked", medication.checked);

            checkButton.textContent = medication.checked ? "✔" : "✓";

            updateReviewButton();

        };

        reviewTable.appendChild(row);

    }

}

function updateReviewButton() {

    if (!reviewButton) return;

    if (readOnly) {

        reviewButton.disabled = true;

        reviewButton.textContent = "✔ Ellenőrzés befejezve";

        return;

    }

    const medications = patient.medications || [];

    const allChecked = medications.length > 0 && medications.every(
        medication => medication.checked
    );

    reviewButton.disabled = !allChecked;

    reviewButton.textContent = "Ellenőrzés lezárása";

}

function finishReview() {

    if (readOnly) {

        return;

    }

    openBarcodeModal();

}

function openBarcodeModal() {

    if (barcodeError) barcodeError.textContent = "";

    if (barcodeInput) barcodeInput.value = "";

    if (barcodeModal) barcodeModal.classList.remove("hidden");

    if (barcodeInput) barcodeInput.focus();

}

async function checkBarcode() {

    const barcode = barcodeInput.value.trim();

    const expectedId = patient.preparation ? patient.preparation.id : null;

    if (barcode !== expectedId) {

        barcodeError.textContent = "❌ Hibás készítési azonosító!";

        barcodeInput.select();

        return;

    }

    patient.status = CONFIG.status.REVIEWED;

    await Storage.savePatient(patient);

    if (barcodeModal) {
        barcodeModal.classList.add("hidden");
    }

    alert("A gyógyszerelés sikeresen lezárva.");

    location.href = "completed.html";

}
