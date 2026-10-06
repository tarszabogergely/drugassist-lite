/*
=========================================
DrugAssist

Fájl:
completed.js

Feladata:
Gyógyszerészileg ellenőrzött
betegek megjelenítése (Supabase adatbázissal).

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

    await renderPatients();

}

async function renderPatients() {

    const container = document.getElementById(
        "patientList"
    );

    // Osztályok aszinkron betöltése Supabase-ből
    const wards = await Storage.loadWards();

    const patients = wards
        .flatMap(ward => ward.patients || [])
        .filter(patient =>
            patient.status === CONFIG.status.REVIEWED
        );

    container.innerHTML = "";

    if (!patients.length) {

        container.innerHTML = `
<div class="empty">
Nincs ellenőrzött beteg.
</div>`;

        return;

    }

    patients.forEach(patient => {

        const card = document.createElement("div");

        card.className = "patient-card";

        card.innerHTML = `
<div>

    <div class="patient-name">
        ${patient.name}
    </div>

    <div class="patient-info">
        ${patient.patientId}
        •
        ${patient.wardName}
        •
        Ágy: ${patient.bed}
    </div>

</div>

<div class="patient-status">
    ✅
</div>
`;

        card.onclick = async () => {

            await Storage.saveCurrentPatient(
                patient.patientId
            );

            location.href = "review.html";

        };

        container.appendChild(card);

    });

}
