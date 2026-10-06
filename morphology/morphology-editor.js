let drugDatabase = [];

let morphology = {};

let selectedDrug = null;

//--------------------------------------------------

document
.getElementById("loadButton")
.onclick = async () => {

    const databaseFile =
        document
        .getElementById("databaseFile")
        .files[0];

    if (!databaseFile) {

        alert("Válaszd ki a drug-database.json fájlt!");

        return;

    }

    try {

        drugDatabase = JSON.parse(
            await databaseFile.text()
        );

    }

    catch {

        alert("Hibás drug-database.json!");

        return;

    }

    const morphologyFile =
        document
        .getElementById("morphologyFile")
        .files[0];

    if (morphologyFile) {

        try {

            morphology = JSON.parse(
                await morphologyFile.text()
            );

        }

        catch {

            alert("Hibás drug-morphology.json!");

            return;

        }

    }

    else {

        morphology = {};

    }

    document.getElementById("loader").style.display =
        "none";

    document.getElementById("container").style.display =
        "flex";

    renderList(drugDatabase);

};

//--------------------------------------------------

function renderList(list) {

    const container =
        document.getElementById("drugList");

    container.innerHTML = "";

    list.forEach(drug => {

        const div =
            document.createElement("div");

        div.className = "drug";

        div.textContent =
            drug.name;

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

    document.getElementById("drugName").value =
        drug.name || "";

    document.getElementById("drugEAN").value =
        drug.ean || "";

    const morph =
        morphology[drug.ean];

    document.getElementById("description").value =
        morph?.description || "";

}

//--------------------------------------------------

document
.getElementById("search")
.addEventListener("input", e => {

    const text =
        e.target.value.toLowerCase();

    const filtered =
        drugDatabase.filter(drug => {

            return (
                (drug.name || "")
                .toLowerCase()
                .includes(text)
            );

        });

    renderList(filtered);

});

//--------------------------------------------------

document
.getElementById("saveButton")
.onclick = () => {

    if (!selectedDrug) {

        alert("Nincs kiválasztott gyógyszer!");

        return;

    }

    morphology[selectedDrug.ean] = {

        name:
            selectedDrug.name,

        description:
            document
            .getElementById("description")
            .value
            .trim()

    };

    downloadMorphology();

};

//--------------------------------------------------

function downloadMorphology() {

    const json =
        JSON.stringify(
            morphology,
            null,
            2
        );

    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "drug-morphology.json";

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);

}