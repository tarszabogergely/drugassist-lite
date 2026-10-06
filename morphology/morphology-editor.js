/*
=========================================
DrugAssist

Fájl:
morphology-editor.js

Feladata:
Gyógyszer-morfológiai adatok (küllem, forma,
szín) szerkesztőfelületének működtetése.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

"use strict";

let drugDatabase = [];

let morphology = {};

let selectedDrug = null;

//--------------------------------------------------

document.getElementById("loadButton").onclick = async () => {

    const databaseFile = document.getElementById("databaseFile")?.files[0];

    if (!databaseFile) {

        alert("Válaszd ki a drug-database.json fájlt!");

        return;

    }

    try {

        drugDatabase = JSON.parse(
            await databaseFile.text()
        );

    } catch (error) {

        alert("Hibás drug-database.json!");

        return;

    }

    const morphologyFile = document.getElementById("morphologyFile")?.files[0];

    if (morphologyFile) {

        try {

            morphology = JSON.parse(
                await morphologyFile.text()
            );

        } catch (error) {

            alert("Hibás drug-morphology.json!");

            return;

        }

    } else {

        morphology = {};

    }

    const loader = document.getElementById("loader");

    if (loader) {

        loader.style.display = "none";

    }

    const container = document.getElementById("container");

    if (container) {

        container.style.display = "flex";

    }

    renderList(drugDatabase);

};

//--------------------------------------------------

function renderList(list) {

    const container = document.getElementById("drugList");

    if (!container) return;

    container.innerHTML = "";

    (list || []).forEach(drug => {

        const div = document.createElement("div");

        div.className = "drug";

        div.textContent = drug.name || "Ismeretlen gyógyszer";

        div.onclick = () => {

            document
                .querySelectorAll(".drug")
                .forEach(d => d.classList.remove("selected"));

            div.classList.add("selected");

            selectDrug(drug);

        };

        container.appendChild(div);

    });

}

//--------------------------------------------------

function selectDrug(drug) {

    selectedDrug = drug;

    const nameInput = document.getElementById("drugName");

    if (nameInput) {

        nameInput.value = drug.name || "";

    }

    const eanInput = document.getElementById("drugEAN");

    if (eanInput) {

        eanInput.value = drug.ean || "";

    }

    const morph = morphology[drug.ean];

    const descInput = document.getElementById("description");

    if (descInput) {

        descInput.value = morph?.description || "";

    }

}

//--------------------------------------------------

const searchInput = document.getElementById("search");

if (searchInput) {

    searchInput.addEventListener("input", e => {

        const text = e.target.value.toLowerCase();

        const filtered = drugDatabase.filter(drug => {

            return (
                (drug.name || "")
                    .toLowerCase()
                    .includes(text)
            );

        });

        renderList(filtered);

    });

}

//--------------------------------------------------

const saveButton = document.getElementById("saveButton");

if (saveButton) {

    saveButton.onclick = () => {

        if (!selectedDrug) {

            alert("Nincs kiválasztott gyógyszer!");

            return;

        }

        const descElement = document.getElementById("description");

        const descriptionText = descElement ? descElement.value.trim() : "";

        morphology[selectedDrug.ean] = {

            name: selectedDrug.name,

            description: descriptionText

        };

        downloadMorphology();

    };

}

//--------------------------------------------------

function downloadMorphology() {

    const json = JSON.stringify(
        morphology,
        null,
        2
    );

    const blob = new Blob(
        [json],
        {
            type: "application/json"
        }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "drug-morphology.json";

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);

}
