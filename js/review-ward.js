/*
=========================================
DrugAssist

Fájl:
review-ward.js

Feladata:
Az adott napra vonatkozó ÖSSZES OSZTÁLY
gyógyszerészi ellenőrzésre váró betegeinek
megjelenítése OSZTÁLYOK SZERINT CSOPORTOSÍTVA.

Fejlesztő:
Tarszabó Gergely + ChatGPT + Gemini

Verzió:
6.1.1
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

        this.renderAllWardsGrouped(wards);
    },

    renderAllWardsGrouped(wards) {
        // Cím frissítése
        const wardTitleEl = document.getElementById("wardTitle");
        if (wardTitleEl) {
            wardTitleEl.textContent = "Ellenőrzésre váró betegek osztályonként";
        }

        const container = document.getElementById("patientContainer");
        if (!container) return;

        container.innerHTML = "";

        let totalPatientsCount = 0;
        let activeWardsCount = 0;

        // Konténer elrendezés módosítása egyoszlopos struktúrára a csoportosításhoz
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "32px";

        (wards || []).forEach(ward => {
            // Lezárt (CHECKED) betegek szűrése az adott osztályon
            const reviewPatients = (ward.patients || []).filter(
                patient => patient.status === CONFIG.status.CHECKED
            );

            // Ha nincs ellenőrzésre váró beteg ezen az osztályon, átugorjuk
            if (reviewPatients.length === 0) return;

            activeWardsCount++;
            totalPatientsCount += reviewPatients.length;

            // Osztály blokk (Kártya / Szekció)
            const wardSection = document.createElement("div");
            wardSection.className = "ward-group-section";
            wardSection.style.background = "white";
            wardSection.style.borderRadius = "14px";
            wardSection.style.padding = "24px";
            wardSection.style.boxShadow = "0 4px 14px rgba(0,0,0,0.05)";

            // Osztály fejléc
            const wardHeader = document.createElement("div");
            wardHeader.style.display = "flex";
            wardHeader.style.justifyContent = "space-between";
            wardHeader.style.alignItems = "center";
            wardHeader.style.borderBottom = "2px solid #f4f6f9";
            wardHeader.style.paddingBottom = "12px";
            wardHeader.style.marginBottom = "20px";

            wardHeader.innerHTML = `
                <h3 style="margin:0; font-size:18px; color:#2c3e50;">
                    <i class="fa-solid fa-hospital-user" style="color:#3498db; margin-right:8px;"></i>
                    ${ward.wardName || ward.wardCode}
                </h3>
                <span style="background:#e8f4fc; color:#2980b9; padding:4px 12px; border-radius:12px; font-weight:600; font-size:13px;">
                    ${reviewPatients.length} beteg
                </span>
            `;

            wardSection.appendChild(wardHeader);

            // Osztályon belüli beteg rács
            const patientGrid = document.createElement("div");
            patientGrid.style.display = "grid";
            patientGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))";
            patientGrid.style.gap = "16px";

            reviewPatients.forEach(patient => {
                let card;

                if (typeof Render !== "undefined" && Render.createPatientCard) {
                    card = Render.createPatientCard(patient);
                } else {
                    card = document.createElement("div");
                    card.className = "patient-card";
                    card.innerHTML = `
                        <div class="patient-name">${patient.name || 'Ismeretlen beteg'}</div>
                        <div class="patient-bed">
                            <strong>Kórterem/Ágy:</strong> ${patient.room || patient.bed || '-'}
                        </div>
                        <span class="status">Ellenőrzésre vár</span>
                    `;
                }

                card.onclick = async () => {
                    if (Storage.saveCurrentWard) {
                        await Storage.saveCurrentWard(ward.wardCode);
                    }
                    if (Storage.saveCurrentPatient) {
                        await Storage.saveCurrentPatient(patient.patientId || patient.id);
                    }

                    window.location.href = "review.html";
                };

                patientGrid.appendChild(card);
            });

            wardSection.appendChild(patientGrid);
            container.appendChild(wardSection);
        });

        // Betegszámláló frissítése a fejléc alatt
        const patientCountEl = document.getElementById("patientCount");
        if (patientCountEl) {
            patientCountEl.textContent = `${totalPatientsCount} beteg vár ellenőrzésre (${activeWardsCount} osztályon)`;
        }

        // Ha egyetlen osztályon sincs lezárt beteg
        if (totalPatientsCount === 0) {
            container.innerHTML = `
                <div class="empty-state" style="background:white; border-radius:14px; padding:40px; text-align:center; color:#777; box-shadow: 0 4px 14px rgba(0,0,0,0.05);">
                    Ezen a napon egyetlen osztályon sincs gyógyszerészi ellenőrzésre váró beteg.
                </div>
            `;
        }
    }
};

// Automatikus betöltés oldalindításkor
document.addEventListener("DOMContentLoaded", async () => {
    if (typeof Auth !== "undefined" && Auth.getCurrentUser) {
        const queryDate = window.selectedWorkDate || Utils.getToday();
        await ReviewWard.init(queryDate);
    }
});
