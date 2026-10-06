/*
=========================================
DrugAssist

Fájl:
morphology.js

Feladata:
Gyógyszerek morfológiai leírásának
(küllem, szín, forma) betöltése és keresése.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

"use strict";

const Morphology = (() => {

    let database = {};

    async function load() {

        try {

            const response = await fetch("data/drug-morphology.json");

            if (!response.ok) {

                // Ha a data/ mappában nem található, megpróbáljuk a gyökérben is
                const rootResponse = await fetch("drug-morphology.json");

                if (rootResponse.ok) {

                    database = await rootResponse.json();

                    return;

                }

                console.warn("Morfológiai adatbázis nem található.");

                return;

            }

            database = await response.json();

        } catch (error) {

            console.error("Hiba a morfológiai adatbázis betöltésekor:", error);

        }

    }

    function getDescription(name) {

        if (!name) {

            return "Ehhez a gyógyszerhez még nincs morfológia rögzítve.";

        }

        const search = name.toUpperCase().trim();

        for (const item of Object.values(database)) {

            if (!item || !item.name) continue;

            const dbName = item.name.toUpperCase().trim();

            if (dbName === search) {

                return item.description || "";

            }

            if (dbName.startsWith(search)) {

                return item.description || "";

            }

            if (search.startsWith(dbName)) {

                return item.description || "";

            }

        }

        return "Ehhez a gyógyszerhez még nincs morfológia rögzítve.";

    }

    return {

        load,

        getDescription

    };

})();
