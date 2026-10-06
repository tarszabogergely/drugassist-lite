/*
=========================================
DrugAssist

Fájl:
review-ward.js

Feladata:
Az aktuális osztály gyógyszerészi
ellenőrzésre váró betegeinek
megjelenítése (Supabase adatbázissal).

Megjeleníti azokat a betegeket,
akiknek a gyógyszerelése lezárásra
került (CHECKED státusz).

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

document.addEventListener(
    "DOMContentLoaded",
    loadWard
);

async function loadWard() {

    const wardCode = Storage.loadCurrentWard ? Storage.loadCurrentWard() : null;

    if (!wardCode) {

        alert("Nincs kiválasztott osztály.");

        window.location.href = "dashboard.html";

        return;

    }

    // Osztályok aszinkron betöltése Supabase-ből
    const wards = await Storage.loadWards();

    const ward = wards.find(
        w => w.wardCode === wardCode
    );

    if (!ward) {

        alert("Az osztály nem található.");

        window.location.href = "dashboard.html";

        return;

    }

    renderWard(ward);

}

function renderWard(ward) {

    document.getElementById(
        "wardTitle"
    ).textContent = ward.wardName;

    const reviewPatients = (ward.patients || []).filter(
        patient => patient.status === CONFIG.status.CHECKED
    );

    document.getElementById(
        "patientCount"
    ).textContent =
        reviewPatients.length + " beteg vár ellenőrzésre";

    const container = document.getElementById(
        "patientContainer"
    );

    container.innerHTML = "";

    reviewPatients.forEach(patient => {

        const card = Render.createPatientCard(patient);

        card.onclick = async () => {

            if (Storage.saveCurrentPatient) {
                await Storage.saveCurrentPatient(patient.patientId);
            }

            location.href = "review.html";

        };

        container.appendChild(card);

    });

}
