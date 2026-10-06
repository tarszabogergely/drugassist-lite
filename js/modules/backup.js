/*
=========================================
DrugAssist

Fájl:
backup.js

Feladata:
Automatikus és manuális biztonsági mentések
kezelése (Supabase és helyi adatok).

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

"use strict";

const Backup = {

    /*
    =====================================
    1. Mentés készítése JSON fájlba
    =====================================
    */
    async createBackup() {

        try {

            Utils.log("Biztonsági mentés készítése indítva...");

            let exportData = {

                version: CONFIG.version || "2.0.0",

                timestamp: new Date().toISOString(),

                wards: [],

                patients: [],

                settings: {}

            };

            // Supabase vagy LocalStorage adatok lekérése
            if (typeof Storage !== "undefined" && Storage.loadWards) {

                exportData.wards = await Storage.loadWards();

            }

            const jsonString = JSON.stringify(exportData, null, 2);

            const blob = new Blob([jsonString], { type: "application/json" });

            const url = URL.createObjectURL(blob);

            const today = Utils.getToday().replaceAll(".", "-");

            const a = document.createElement("a");

            a.href = url;

            a.download = `DrugAssist_Backup_${today}.json`;

            document.body.appendChild(a);

            a.click();

            a.remove();

            URL.revokeObjectURL(url);

            Utils.log("Biztonsági mentés sikeresen letöltve.");

            return true;

        } catch (error) {

            console.error("Hiba a biztonsági mentés készítésekor:", error);

            return false;

        }

    },

    /*
    =====================================
    2. Mentés helyreállítása JSON fájlból
    =====================================
    */
    async restoreBackup(file) {

        if (!file) {

            alert("Válasszon ki egy érvényes biztonsági mentés fájlt!");

            return false;

        }

        try {

            const text = await file.text();

            const backupData = JSON.parse(text);

            if (!backupData.wards || !Array.isArray(backupData.wards)) {

                throw new Error("Érvénytelen mentési fájlformátum.");

            }

            Utils.log("Adatok helyreállítása folyamatban...");

            // Adatok összefésülése/mentése a Storage modulon keresztül
            for (const ward of backupData.wards) {

                if (Storage.mergeWard) {

                    await Storage.mergeWard(ward);

                }

            }

            alert("A biztonsági mentés sikeresen helyreállítva!");

            window.location.reload();

            return true;

        } catch (error) {

            console.error("Hiba a mentés helyreállításakor:", error);

            alert("Hiba történt a biztonsági mentés beolvasásakor!");

            return false;

        }

    },

    /*
    =====================================
    3. Automatikus mentési időzítő (szükség esetén)
    =====================================
    */
    initAutoBackup(intervalMinutes = 60) {

        const intervalMs = intervalMinutes * 60 * 1000;

        setInterval(async () => {

            Utils.log("Automatikus mentési ciklus futtatása...");

            if (typeof Storage !== "undefined" && Storage.loadWards) {

                const wards = await Storage.loadWards();

                if (wards && wards.length > 0) {

                    localStorage.setItem("drugassist_auto_backup", JSON.stringify(wards));

                }

            }

        }, intervalMs);

    }

};
