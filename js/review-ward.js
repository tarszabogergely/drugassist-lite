/*
=========================================
DrugAssist

Fájl:
review-ward.js

Feladata:
Az adott napra vonatkozó ÖSSZES OSZTÁLY
gyógyszerészi ellenőrzésre váró betegeinek
megjelenítése (Supabase adatbázissal).

Megjeleníti azokat a betegeket az összes
osztályról, akiknek a gyógyszerelése lezárásra
került (CHECKED státusz).

Fejlesztő:
Tarszabó Gergely + ChatGPT + Gemini

Verzió:
2.1.0
=========================================
*/

const ReviewWard = {

    async init(targetDate = null) {
        const queryDate = targetDate || window.selectedWorkDate || Utils.getToday();
        await this.loadAllWardsForDate(queryDate);
    },

    async loadAllWardsForDate(dateStr) {
        // Osztályok aszinkron betöltése a kiválasztott napra Supabase-ből
        const wards = await Storage.loadWards(dateStr);

        this.renderAllWards(wards);
    },

    renderAllWards(wards) {
        // Cím frissítése
        const wardTitleEl = document.getElementById("wardTitle");
        if (wardTitleEl) {
            wardTitleEl.textContent = "Összes osztály – Ellenőrzésre váró betegek";
        }

        // Összes lezárt (CHECKED) beteg kigyűjtése az összes osztályról
        let allReviewPatients = [];

        (wards || []).forEach(ward => {
            const checkedInWard = (ward.patients || []).filter(
                patient => patient.status === CONFIG.status.CHECKED
            ).map(patient => ({
                ...patient,
                wardName: ward.wardName || ward.wardCode || "Ismeretlen osztály",
                wardCode: ward.wardCode
            }));

            allReviewPatients = allReviewPatients.concat(checkedInWard);
        });

        // Betegszámláló kijelzése
        const patientCountEl = document.getElementById("patientCount");
        if (patientCountEl) {
            patientCountEl.textContent = `${allReviewPatients.length} beteg vár ellenőrzésre (${wards.length} osztályon)`;
        }

        const container = document.getElementById("patientContainer");
        if (!container) return;

        container.innerHTML = "";

        if (allReviewPatients.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #777;">
                    Ezen a napon egyetlen osztályon sincs ellenőrzésre váró beteg.
                </div>
            `;
            return;
        }

        // Betegkártyák kirajzolása
        allReviewPatients.forEach(patient => {
            let card;
            
            if (typeof Render !== "undefined" && Render.createPatientCard) {
                card = Render.createPatientCard(patient);
            } else {
                // Biztonsági kártya-generálás, ha a Render modulban nincs elkülönítve
                card = document.createElement("div");
                card.className = "patient-card";
                card.innerHTML = `
                    <div class="patient-name">${patient.name || 'Ismeretlen beteg'}</div>
                    <div class="patient-bed">
                        <strong>Osztály:</strong> ${patient.wardName}<br>
                        <strong>Ágy/Kórterem:</strong> ${patient.room || patient.bed || '-'}
                    </div>
                    <span class="status">Ellenőrzésre vár</span>
                `;
            }

            card.onclick = async () => {
                if (Storage.saveCurrentWard) {
                    await Storage.saveCurrentWard(patient.wardCode);
                }
                if (Storage.saveCurrentPatient) {
                    await Storage.saveCurrentPatient(patient.patientId || patient.id);
                }

                window.location.href = "review.html";
            };

            container.appendChild(card);
        });
    }
};

// Automatikus betöltés oldalindításkor
document.addEventListener("DOMContentLoaded", async () => {
    // Ha a review-ward.html nem a saját beépített scriptjével hívja meg
    if (typeof Auth !== "undefined" && Auth.getCurrentUser) {
        const queryDate = window.selectedWorkDate || Utils.getToday();
        await ReviewWard.init(queryDate);
    }
});
