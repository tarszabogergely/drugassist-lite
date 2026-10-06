/*
=========================================
DrugAssist

Fájl:
drug-database.js

Feladata:
Gyógyszertörzs kezelése és indexelése.

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

        const text = await file.text();

        this.drugs = this.parseCsv(text);

        this.buildIndexes();

    },

    /*
    =====================================
    Név normalizálása
    =====================================
    */

    normalizeName(name) {

        if (!name) return "";

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

        const rows = text.trim().split(/\r?\n/);

        // Fejléc kihagyása
        rows.shift();

        const drugs = [];

        rows.forEach(row => {

            if (!row.trim()) return;

            const cols = row.split(";");

            drugs.push({

                ean: cols[0]?.trim() || "",

                name: cols[1]?.trim() || "",

                substance: cols[2]?.trim() || "",

                active: cols[3]?.trim() === "1"

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

            if (!drug) return;

            if (drug.name) {

                this.byName.set(
                    this.normalizeName(drug.name),
                    drug
                );

            }

            if (drug.ean) {

                this.byEan.set(drug.ean, drug);

            }

            if (drug.substance) {

                if (!this.bySubstance.has(drug.substance)) {

                    this.bySubstance.set(drug.substance, []);

                }

                this.bySubstance.get(drug.substance).push(drug);

            }

        });

    },

    /*
    =====================================
    Keresés név alapján
    =====================================
    */

    findByName(name) {

        if (!name) return null;

        return this.byName.get(this.normalizeName(name)) || null;

    },

    /*
    =====================================
    Keresés EAN alapján
    =====================================
    */

    findByEan(ean) {

        if (!ean) return null;

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

        if (!substance) return [];

        return this.bySubstance.get(substance) || [];

    },

    /*
    =====================================
    Csak aktív készítmények
    =====================================
    */

    findActiveBySubstance(substance) {

        return this.findBySubstance(substance).filter(drug => drug.active);

    },

    /*
    =====================================
    Helyettesíthető?
    =====================================
    */

    canSubstitute(substance) {

        return this.findActiveBySubstance(substance).length > 1;

    },

    /*
    =====================================
    JSON betöltése (helyi fájlból)
    =====================================
    */

    async loadJson(path) {

        try {

            const response = await fetch(path);

            if (!response.ok) {

                throw new Error(`Nem sikerült betölteni: ${path}`);

            }

            this.drugs = await response.json();

            this.buildIndexes();

            return true;

        } catch (error) {

            console.warn(`Hiba a törzs betöltésekor (${path}):`, error);

            return false;

        }

    },

    /*
    =====================================
    Betöltés Supabase adatbázisból
    =====================================
    */

    async loadFromSupabase() {

        // Ellenőrizzük, hogy a Supabase kliens valóban inicializálva van-e
        const isSupabaseReady = typeof supabase !== "undefined" && 
                                supabase && 
                                typeof supabase.from === "function" &&
                                typeof CONFIG !== "undefined" &&
                                CONFIG.supabase?.url &&
                                !CONFIG.supabase.url.includes("YOUR_SUPABASE");

        if (!isSupabaseReady) {

            return false;

        }

        try {

            const { data, error } = await supabase

                .from('drug_database')

                .select('*');

            if (error || !data || data.length === 0) {

                console.warn("Nem sikerült lekérni a törzset a Supabase-ből, váltás helyi adatokra.");

                return false;

            }

            this.drugs = data;

            this.buildIndexes();

            return true;

        } catch (err) {

            console.warn("Supabase csatlakozási hiba a törzsnél:", err);

            return false;

        }

    },

    /*
    =====================================
    Gyógyszerek adatainak hozzárendelése
    =====================================
    */

    attachData(medications) {

        if (!Array.isArray(medications)) return;

        medications.forEach(med => {

            const drug = this.findByName(med.medication);

            if (!drug) {

                med.found = false;

                return;

            }

            med.found = true;

            med.ean = drug.ean;

            med.substance = drug.substance;

            med.active = drug.active;

            med.alternatives = this.findActiveBySubstance(drug.substance);

            med.canSubstitute = med.alternatives.length > 1;

        });

    },

    /*
    =====================================
    Inicializálás
    =====================================
    */

    async init() {

        // Elsőként próbáljuk meg a Supabase-t
        const loadedFromDb = await this.loadFromSupabase();

        // Ha a Supabase nem elérhető vagy nincs beállítva, betöltjük a helyi törzset
        if (!loadedFromDb) {

            const loaded = await this.loadJson("data/drug-database.json");

            if (!loaded) {

                await this.loadJson("drug-database.json");

            }

        }

    }

};
