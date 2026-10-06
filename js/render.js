/*
=========================================
DrugAssist

Fájl:
render.js

Feladata:
A felhasználói felület kirajzolása.

Nem tartalmaz:
- PDF feldolgozást
- LocalStorage műveleteket
- Programlogikát

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

const Render = {

    /*
    =====================================
    Státusz jelvény
    =====================================
    */

    createStatusBadge(status) {

        const badge = document.createElement("span");

        badge.classList.add("status-badge");

        switch (status) {

            case CONFIG.status.NEW:

                badge.classList.add("status-new");

                badge.textContent = "⚪ Nincs elkezdve";

                break;

            case CONFIG.status.LABEL_PRINTED:

                badge.classList.add("status-progress");

                badge.textContent = "🟡 Gyógyszerelés elkezdve";

                break;

            case CONFIG.status.CHECKED:

                badge.classList.add("status-done");

                badge.textContent = "🟢 Lezárva";

                break;

        }

        return badge;

    },

    /*
    =====================================
    Osztálykártya
    =====================================
    */

    createWardCard(ward) {

        const card = document.createElement("div");

        card.className = "ward-card";

        const activePatients = (ward.patients || []).filter(
            patient => patient.onWard !== false
        );

        const total = (ward.patients || []).length;

        const completed = activePatients.filter(
            patient => patient.status === CONFIG.status.CHECKED
        ).length;

        card.innerHTML = `
<div class="ward-header">
    <div>
        <div class="ward-name">
            ${ward.wardName}
        </div>
        <div class="ward-count">
            ${total} beteg
        </div>
        <div class="ward-date">
            ${ward.importDate || ""}
        </div>
    </div>
    <div class="completion">
        ✔ ${completed} / ${total}
    </div>
</div>
`;

        card.addEventListener("click", async () => {

            if (Storage.saveCurrentWard) {
                await Storage.saveCurrentWard(ward.wardCode);
            }

            window.location.href = "ward.html";

        });

        return card;

    },

    /*
    =====================================
    Betegkártya
    =====================================
    */

    createPatientCard(patient) {

        const card = document.createElement("div");

        card.className = "patient-card";

        card.innerHTML = `
<h3>
    ${patient.name}
</h3>
<div>
    ${patient.wardName || ""}
</div>
<div>
    Ágy: ${patient.bed || "-"}
</div>
<div>
    Azonosító: ${patient.patientId || "-"}
</div>
`;

        card.appendChild(
            this.createStatusBadge(patient.status)
        );

        card.addEventListener("click", async () => {

            if (Storage.saveCurrentPatient) {
                await Storage.saveCurrentPatient(patient.patientId);
            }

            window.location.href = "patient.html";

        });

        return card;

    },

    /*
    =====================================
    Osztálykártyák kirajzolása
    =====================================
    */

    renderWardCards(wards) {

        const container = document.getElementById("wardContainer");

        if (!container) {

            return;

        }

        container.innerHTML = "";

        if (!wards || !wards.length) {

            container.innerHTML = `
<div class="empty">
Nincs betöltött osztály.
</div>
`;

            return;

        }

        wards.forEach(ward => {

            const card = this.createWardCard(ward);

            container.appendChild(card);

        });

    }

};
