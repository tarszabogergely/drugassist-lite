/*
=========================================
DrugAssist

Fájl:
patient.js

Feladata:
Az aktuális beteg betöltése és kezelése
(Supabase adatbázis integrációval).

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

document.addEventListener(
    "DOMContentLoaded",
    init
);

async function init() {

    await DrugDatabase.init();

    await loadPatient();

    SubstitutionModal.init();

    DmInput.init(

        async code => {

            const dm = DmParser.parse(code);

            const drug = DrugDatabase.findByGTIN(dm.gtin);

            if (!drug) {

                alert("Ismeretlen gyógyszer!");

                return;

            }

            console.log("Felismert gyógyszer:", drug.name);

            await assignScannedDrug(drug, dm);

        }

    );

    DmInput.focus();
    initCloseMedication();

}

async function assignScannedDrug(drug, dm) {

    if (await isPatientClosed()) {

        return;

    }

    const patient = await Storage.loadPatient();

    if (!patient) {

        return;

    }

    // Előző aktív gyógyszer lezárása
    patient.medications.forEach(med => {

        if (med.status === "active") {

            med.status = "completed";

        }

    });

    // Következő megfelelő gyógyszer keresése
    const medication = patient.medications.find(med =>

        med.ean === drug.ean &&

        med.status !== "completed"

    );

    if (!medication) {

        alert("Ehhez a beteghez nincs ilyen gyógyszer.");

        return;

    }

    medication.status = "active";

    medication.lot = dm.lot;

    medication.expiry = dm.expiry;

    await Storage.savePatient(patient);

    renderMedications(patient.medications);

}

async function loadPatient() {

    const patient = await Storage.loadPatient();

    if (!patient) {

        alert("Nincs kiválasztott beteg.");

        window.location.href = "ward.html";

        return;

    }

    if (patient.pdfVerified === undefined) {

        patient.pdfVerified = false;

    }

    // Készítési azonosító létrehozása első megnyitáskor
    if (!patient.preparation) {

        patient.preparation = Preparation.create();

        if (patient.status === CONFIG.status.NEW) {

            patient.status = CONFIG.status.LABEL_PRINTED;

        }

    }

    await Storage.savePatient(patient);

    renderPatient(patient);

    await initPatientNote();

    const pdfInput = document.getElementById("patientPdfInput");

    if (pdfInput) {

        pdfInput.addEventListener(
            "change",
            handlePatientPdf
        );

    }

    renderMedications(patient.medications || []);

    if (patient.closed) {

        setReadOnlyMode();

    }

}

function renderPatient(patient) {

    document.getElementById("patientName").textContent = patient.name;

    document.getElementById("patientId").textContent = patient.patientId;

    document.getElementById("patientWard").textContent = patient.wardName;

    document.getElementById("patientBed").textContent = patient.bed;

    // Készítési azonosító
    document.getElementById("preparationId").textContent =
        patient.preparation ? patient.preparation.id : "-";

    // Címkenyomtatás
    document.getElementById("printLabelButton").onclick = () => {

        Label.print(patient);

    };

    // PDF ellenőrzés jelzése
    const verified = document.getElementById("patientVerified");

    verified.innerHTML = patient.pdfVerified
        ? "<span class='verified'>✔</span>"
        : "";

}

function normalizeName(name) {

    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .toUpperCase()
        .trim();

}

function canVerifyPatientName(name) {

    return !/[őűŐŰ]/.test(name);

}

async function handlePatientPdf(event) {

    if (await isPatientClosed()) {

        return;

    }

    const file = event.target.files[0];

    if (!file) {

        return;

    }

    const patient = await Storage.loadPatient();

    const result = await PatientPdfParser.parse(file);

    if (!canVerifyPatientName(patient.name)) {

        patient.pdfVerified = false;

        await Storage.savePatient(patient);

        renderPatient(patient);

        alert(
            "Automatikus betegazonosítás nem végezhető el ennél a betegnél.\n\nA gyógyszerelési PDF betöltése folytatódik.\n\nKérjük, ellenőrizze manuálisan, hogy a megfelelő dokumentumot választotta ki."
        );

    } else {

        const pdfOk = normalizeName(result.pdfText).includes(
            normalizeName(patient.name)
        );

        if (!pdfOk) {

            patient.pdfVerified = false;

            await Storage.savePatient(patient);

            renderPatient(patient);

            alert("⚠ A kiválasztott PDF nem ehhez a beteghez tartozik!");

            return;

        }

        patient.pdfVerified = true;

    }

    patient.medications = result.medications.map(med => ({

        ...med,

        status: "pending",

        lot: "",

        expiry: ""

    }));

    await Storage.savePatient(patient);

    renderPatient(patient);

    renderMedications(patient.medications);

}

/*
=====================================
Gyógyszerek megjelenítése
=====================================
*/

function renderMedications(medications) {

    const container = document.getElementById("medicationList");

    container.innerHTML = "";

    if (!medications.length) {

        container.innerHTML =
            "<div class='empty'>Nincs gyógyszer.</div>";

        return;

    }

    const periods = [
        "Éjjel",
        "Hajnal",
        "Reggel",
        "Dél",
        "Délután",
        "Este"
    ];

    medications.forEach((med, index) => {

        const card = document.createElement("div");

        card.className = "medication-card";

        card.dataset.index = index;

        if (med.status === "active") {

            card.classList.add("active");

        }

        if (med.status === "completed") {

            card.classList.add("completed");

        }

        let schedule = "";

        periods.forEach(period => {

            schedule += `
<div class="period">
<div class="period-name">
${period}
</div>
<div class="period-dose">
${med.schedule[period] || ""}
</div>
</div>
`;

        });

        card.innerHTML = `
<div class="medication-info">
    <div class="medication-name-row">
        ${med.canSubstitute
            ? `<span class="swap-button" data-index="${index}">🔄</span>`
            : ""
        }
        <span class="medication-name">
            ${med.medication}
        </span>
        <span class="status-icon">
            ${med.status === "completed" ? "✅" : ""}
        </span>
    </div>
</div>
<div class="lot-column">
    <div class="lot-item">📦</div>
    <div class="lot-value">${med.lot || "-"}</div>
    <div class="lot-item">📅</div>
    <div class="lot-value">${med.expiry || "-"}</div>
</div>
${schedule}
`;

        const swapButton = card.querySelector(".swap-button");

        if (swapButton) {

            swapButton.onclick = () => {

                openSubstitution(medications, index);

            };

        }

        container.appendChild(card);

    });

    /*
    =====================================
    Aktív gyógyszer automatikus görgetése
    =====================================
    */

    const activeCard = container.querySelector(".medication-card.active");

    if (activeCard) {

        activeCard.scrollIntoView({

            behavior: "smooth",

            block: "nearest"

        });

    }

}

/*
=====================================
Helyettesítés
=====================================
*/

async function openSubstitution(medications, index) {

    if (await isPatientClosed()) {

        return;

    }

    const med = medications[index];

    SubstitutionModal.open(

        med,

        async selectedDrug => {

            med.medication = selectedDrug.name;

            med.ean = selectedDrug.ean;

            med.substance = selectedDrug.substance;

            med.active = selectedDrug.active;

            med.canSubstitute = false;

            renderMedications(medications);

            // Frissítés mentése
            const patient = await Storage.loadPatient();

            if (patient) {

                patient.medications = medications;

                await Storage.savePatient(patient);

            }

        }

    );

}

/*
=====================================
Gyógyszerelés lezárása
=====================================
*/

function initCloseMedication() {

    const button = document.getElementById("completeButton");

    if (!button) {

        return;

    }

    button.onclick = closeMedication;

}

async function closeMedication() {

    const patient = await Storage.loadPatient();

    if (!patient) {

        return;

    }

    if (
        !Array.isArray(patient.medications) ||
        patient.medications.length === 0
    ) {

        alert(
            "A gyógyszerelés nem zárható le!\n\nElőször töltse fel a beteg gyógyszerelési PDF-jét."
        );

        return;

    }

    const missingLot = patient.medications.filter(med => !med.lot).length;

    const missingExpiry = patient.medications.filter(med => !med.expiry).length;

    if (missingLot || missingExpiry) {

        const proceed = confirm(
            `Figyelem!\n\nHiányzó gyári szám:\n${missingLot}\n\nHiányzó lejárat:\n${missingExpiry}\n\nBiztosan lezárod?`
        );

        if (!proceed) {

            return;

        }

    }

    patient.status = CONFIG.status.CHECKED;

    patient.closed = true;

    patient.closedAt = new Date().toISOString();

    const user = Storage.loadUser ? Storage.loadUser() : { id: 'Rendszer' };

    patient.closedBy = user ? user.id : 'Rendszer';

    await Storage.savePatient(patient);

    PdfReport.generate(patient);

    alert("Gyógyszerelés lezárva.");

    window.location.href = "ward.html";

}

/*
=====================================
Csak olvasható mód
=====================================
*/

function setReadOnlyMode() {

    // PDF import tiltása
    const pdfInput = document.getElementById("patientPdfInput");

    if (pdfInput) {

        pdfInput.disabled = true;

    }

    // DM olvasó tiltása
    if (typeof DmInput !== "undefined" && DmInput.disable) {

        DmInput.disable();

    }

    // Lezárás gomb tiltása
    const completeButton = document.getElementById("completeButton");

    if (completeButton) {

        completeButton.disabled = true;

        completeButton.innerHTML = "Gyógyszerelés lezárva";

        completeButton.classList.add("completed");

    }

    // Helyettesítés gombok elrejtése
    document.querySelectorAll(".swap-button").forEach(button => {

        button.style.display = "none";

    });

}

/*
=====================================
Gyógyszerelés lezárva?
=====================================
*/

async function isPatientClosed() {

    const patient = await Storage.loadPatient();

    if (!patient) {

        return false;

    }

    if (!patient.closed) {

        return false;

    }

    alert("A gyógyszerelés már le lett zárva.");

    return true;

}

/*
=====================================
Megjegyzés
=====================================
*/

async function initPatientNote() {

    const note = document.getElementById("patientNote");

    if (!note) {

        return;

    }

    const patient = await Storage.loadPatient();

    if (!patient) {

        return;

    }

    note.value = patient.closeNote || "";

    note.readOnly = !!patient.closed;

    note.oninput = async () => {

        const currentPatient = await Storage.loadPatient();

        if (!currentPatient) {

            return;

        }

        currentPatient.closeNote = note.value.trimEnd();

        await Storage.savePatient(currentPatient);

    };

}
