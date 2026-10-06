/*
=========================================
DrugAssist

Fájl:
drug-database.js

Feladata:
Gyógyszertörzs kezelése.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

const DrugDatabase = {

    drugs: [],

    byName: new Map(),

    byEan: new Map(),

    bySubstance: new Map(),

   /*
=====================================
CSV betöltése
=====================================
*/

async load(file) {

    const text =
        await file.text();

    this.drugs =
        this.parseCsv(text);

    this.buildIndexes();

},

/*
=====================================
Név normalizálása
=====================================
*/

normalizeName(name) {

    return name

        .trim()

        .replace(/\s+/g, " ")

        .toUpperCase();

},


    /*
    =====================================
    CSV feldolgozása
    =====================================
    */

    parseCsv(text) {

    const rows =
        text
            .trim()
            .split(/\r?\n/);

    // fejléc kihagyása
    rows.shift();

    const drugs = [];

    rows.forEach(row => {

        if (!row.trim()) {

            return;

        }

        const cols =
            row.split(";");

        drugs.push({

            ean:
                cols[0].trim(),

            name:
                cols[1].trim(),

            substance:
                cols[2].trim(),

            active:
                cols[3].trim() === "1"

        });

    });

    return drugs;

},

    /*
    =====================================
    Rekordok száma
    =====================================
    */

    count() {

        return this.drugs.length;

    },

/*
=====================================
Indexek felépítése
=====================================
*/

buildIndexes() {

    this.byName.clear();

    this.byEan.clear();

    this.bySubstance.clear();

    this.drugs.forEach(drug => {

        this.byName.set(

    this.normalizeName(
        drug.name
    ),

    drug

);

        this.byEan.set(
            drug.ean,
            drug
        );

        if (!this.bySubstance.has(drug.substance)) {

            this.bySubstance.set(
                drug.substance,
                []
            );

        }

        this.bySubstance
            .get(drug.substance)
            .push(drug);

    });

},

    /*
    =====================================
    Keresés név alapján
    =====================================
    */

    findByName(name) {

    return this.byName.get(

    this.normalizeName(name)

) || null;

},

    /*
    =====================================
    Keresés EAN alapján
    =====================================
    */

    findByEan(ean) {

    return this.byEan.get(ean) || null;

},

/*
=====================================
Keresés GTIN alapján
=====================================
*/

findByGTIN(gtin) {

    return this.findByEan(gtin);

},

    /*
    =====================================
    Hatóanyag szerint
    =====================================
    */

    findBySubstance(substance) {

    return this.bySubstance.get(substance) || [];

},

    /*
    =====================================
    Csak aktív készítmények
    =====================================
    */

    findActiveBySubstance(substance) {

    return this.findBySubstance(substance)

        .filter(drug => drug.active);

},

/*
=====================================
Helyettesíthető?
=====================================
*/

canSubstitute(substance) {

    return this
        .findActiveBySubstance(substance)
        .length > 1;

},

/*
=====================================
JSON betöltése
=====================================
*/

async loadJson(path) {

    const response =
        await fetch(path);

    this.drugs =
        await response.json();

    this.buildIndexes();

},

/*
=====================================
Gyógyszerek adatainak hozzárendelése
=====================================
*/

attachData(medications) {

    medications.forEach(med => {

        const drug =

            this.findByName(

                med.medication

            );

        if (!drug) {

            med.found = false;

            return;

        }

        med.found = true;

        med.ean =
            drug.ean;

        med.substance =
            drug.substance;

        med.active =
            drug.active;

        med.alternatives =

            this.findActiveBySubstance(

                drug.substance

            );

        med.canSubstitute =

            med.alternatives.length > 1;

    });

},

/*
=====================================
Inicializálás
=====================================
*/

async init() {

    await this.loadJson(

        "data/drug-database.json"

    );

}


};