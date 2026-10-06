/*
=========================================
DrugAssist

Fájl:
completed.js

Feladata:
Gyógyszerészileg ellenőrzött
betegek megjelenítése.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

document.addEventListener(
    "DOMContentLoaded",
    init
);

function init(){

    renderPatients();

}

function renderPatients(){

    const container =
        document.getElementById(
            "patientList"
        );

    const patients =
        Storage
            .loadWards()
            .flatMap(ward => ward.patients)
            .filter(patient =>
                patient.status ===
                CONFIG.status.REVIEWED
            );

    container.innerHTML = "";

    if(!patients.length){

        container.innerHTML = `
<div class="empty">
Nincs ellenőrzött beteg.
</div>`;

        return;

    }

    patients.forEach(patient=>{

        const card =
            document.createElement("div");

        card.className =
            "patient-card";

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

        card.onclick = ()=>{

            Storage.saveCurrentPatient(
                patient.patientId
            );

            location.href =
                "review.html";

        };

        container.appendChild(card);

    });

}