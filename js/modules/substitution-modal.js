/*
=========================================
DrugAssist

Fájl:
substitution-modal.js

Feladata:
Gyógyszer helyettesítési
modal kezelése.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

const SubstitutionModal = {

    callback: null,

    selectedDrug: null,

    /*
    =====================================
    Megnyitás
    =====================================
    */

    open(medication, callback) {

        this.callback =
            callback;

        this.selectedDrug =
            null;

        const modal =
            document.getElementById(
                "substitutionModal"
            );

        document.getElementById(
            "originalMedication"
        ).textContent =
            medication.medication;

        const list =
            document.getElementById(
                "substitutionList"
            );

        list.innerHTML = "";

        medication.alternatives.forEach(drug => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "sub-item";

            item.innerHTML = `

<b>${drug.name}</b>

<br>

EAN:
${drug.ean}

`;

            item.onclick = () => {

                list

                    .querySelectorAll(
                        ".sub-item"
                    )

                    .forEach(el =>

                        el.classList.remove(
                            "selected"
                        )

                    );

                item.classList.add(
                    "selected"
                );

                this.selectedDrug =
                    drug;

            };

            list.appendChild(item);

        });

        modal.classList.remove(
            "hidden"
        );

    },

    /*
    =====================================
    Bezárás
    =====================================
    */

    close() {

        document

            .getElementById(
                "substitutionModal"
            )

            .classList.add(
                "hidden"
            );

        this.selectedDrug =
            null;

    },

    /*
    =====================================
    Inicializálás
    =====================================
    */

    init() {

        document

            .getElementById(
                "subCancel"
            )

            .onclick = () => {

                this.close();

            };

        document

            .getElementById(
                "subOk"
            )

            .onclick = () => {

                if (

                    !this.selectedDrug

                ) {

                    alert(

                        "Válassz gyógyszert!"

                    );

                    return;

                }

                if (

                    this.callback

                ) {

                    this.callback(

                        this.selectedDrug

                    );

                }

                this.close();

            };

        const modal =

            document.getElementById(
                "substitutionModal"
            );

        modal.onclick = e => {

            if (

                e.target === modal

            ) {

                this.close();

            }

        };

        document.addEventListener(

            "keydown",

            e => {

                if (

                    e.key === "Escape"

                ) {

                    this.close();

                }

            }

        );

    }

};