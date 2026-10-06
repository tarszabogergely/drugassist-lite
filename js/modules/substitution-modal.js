/*
=========================================
DrugAssist

Fájl:
substitution-modal.js

Feladata:
Gyógyszer-helyettesítési modál kezelése
(Supabase integrációval).

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

"use strict";

const SubstitutionModal = {

    callback: null,

    selectedDrug: null,

    /*
    =====================================
    Megnyitás
    =====================================
    */

    open(medication, callback) {

        this.callback = callback;

        this.selectedDrug = null;

        const modal = document.getElementById("substitutionModal");

        if (!modal) return;

        const originalElem = document.getElementById("originalMedication");

        if (originalElem) {

            originalElem.textContent = medication?.medication || "";

        }

        const list = document.getElementById("substitutionList");

        if (!list) return;

        list.innerHTML = "";

        const alternatives = medication?.alternatives || [];

        alternatives.forEach(drug => {

            const item = document.createElement("div");

            item.className = "sub-item";

            item.innerHTML = `
<b>${drug.name}</b>
<br>
EAN: ${drug.ean || "-"}
`;

            item.onclick = () => {

                list.querySelectorAll(".sub-item").forEach(el =>
                    el.classList.remove("selected")
                );

                item.classList.add("selected");

                this.selectedDrug = drug;

            };

            list.appendChild(item);

        });

        modal.classList.remove("hidden");

    },

    /*
    =====================================
    Bezárás
    =====================================
    */

    close() {

        const modal = document.getElementById("substitutionModal");

        if (modal) {

            modal.classList.add("hidden");

        }

        this.selectedDrug = null;

    },

    /*
    =====================================
    Inicializálás
    =====================================
    */

    init() {

        const subCancel = document.getElementById("subCancel");

        if (subCancel) {

            subCancel.onclick = () => {

                this.close();

            };

        }

        const subOk = document.getElementById("subOk");

        if (subOk) {

            subOk.onclick = async () => {

                if (!this.selectedDrug) {

                    alert("Válassz gyógyszert!");

                    return;

                }

                if (this.callback) {

                    await this.callback(this.selectedDrug);

                }

                this.close();

            };

        }

        const modal = document.getElementById("substitutionModal");

        if (modal) {

            modal.onclick = e => {

                if (e.target === modal) {

                    this.close();

                }

            };

        }

        document.addEventListener("keydown", e => {

            if (e.key === "Escape") {

                this.close();

            }

        });

    }

};
