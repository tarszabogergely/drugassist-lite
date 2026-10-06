/*
=========================================
DrugAssist

Fájl:
storage.js

Feladata:
Adatok mentése és betöltése.

Jelenleg:
LocalStorage

Később:
SQLite vagy szerver is lehet.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0

=========================================
*/

/*
Megjegyzés:

A WARDS mindig tömb.

Még akkor is, ha csak egyetlen
osztály van importálva.

Ennek célja a későbbi
több osztály kezelésének
egyszerű támogatása.
*/

const Storage = {

 /*
=====================================
OSZTÁLYOK
=====================================
*/

saveWards(wards) {

    localStorage.setItem(

        CONFIG.storage.WARDS,

        JSON.stringify(wards)

    );

},


loadWards() {

    const data = localStorage.getItem(
        CONFIG.storage.WARDS
    );

    if (!data) {

        return [];

    }

    return JSON.parse(data);

},


clearWards() {

    localStorage.removeItem(
        CONFIG.storage.WARDS
    );

},


/*
=====================================
Osztály összevonása
=====================================
*/

mergeWard(newWard) {

    const wards = this.loadWards();

    const oldWard = wards.find(

        w => w.wardCode === newWard.wardCode

    );

    // Ha még nincs ilyen osztály

if (!oldWard) {

    newWard.importDate =
        Utils.getToday();

    wards.push(newWard);

    this.saveCurrentWard(
        newWard.wardCode
    );

    this.saveWards(wards);

    return;

}

    // Minden régi beteg ideiglenesen elhagyta az osztályt

    oldWard.patients.forEach(patient => {

        patient.onWard = false;

    });

    // Új lista feldolgozása

    newWard.patients.forEach(newPatient => {

        const oldPatient = oldWard.patients.find(

            p => p.patientId === newPatient.patientId

        );

        if (!oldPatient) {

            oldWard.patients.push(newPatient);

            return;

        }

        // Frissülő adatok

        oldPatient.name = newPatient.name;

        oldPatient.bed = newPatient.bed;

        oldPatient.wardName = newPatient.wardName;

        oldPatient.lastImport = Utils.getToday();

oldPatient.onWard = true;

// Új munkanap?

if (oldPatient.workDate !== Utils.getToday()) {

    oldPatient.workDate = null;

    oldPatient.preparation = null;

    oldPatient.status = CONFIG.status.NEW;

}

    });

    this.saveWards(wards);

},


/*
=====================================
Beteg mentése
=====================================
*/

savePatient(patient) {

    const wards = this.loadWards();

    for (const ward of wards) {

        const index = ward.patients.findIndex(

            p => p.patientId === patient.patientId

        );

        if (index !== -1) {

            ward.patients[index] = patient;

            break;

        }

    }

    this.saveWards(wards);

},


/*
=====================================
Aktuális osztály
=====================================
*/

saveCurrentWard(wardCode) {

    localStorage.setItem(

        CONFIG.storage.CURRENT_WARD,

        wardCode

    );

},


loadCurrentWard() {

    return localStorage.getItem(

        CONFIG.storage.CURRENT_WARD

    );

},

/*
=====================================
Munkanap
=====================================
*/

saveWorkDate(date) {

    localStorage.setItem(

        CONFIG.storage.WORK_DATE,

        date

    );

},

loadWorkDate() {

    return localStorage.getItem(

        CONFIG.storage.WORK_DATE

    );

},

/*
=====================================
Aktuális beteg
=====================================
*/

saveCurrentPatient(patientId) {

    localStorage.setItem(

        CONFIG.storage.CURRENT_PATIENT,

        patientId

    );

},


loadCurrentPatient() {

    return localStorage.getItem(

        CONFIG.storage.CURRENT_PATIENT

    );

},

/*
=====================================
Aktuális beteg betöltése
=====================================
*/

loadPatient() {

    const patientId =

        this.loadCurrentPatient();

    if (!patientId) {

        return null;

    }

    const wards =

        this.loadWards();

    for (const ward of wards) {

        const patient =

            ward.patients.find(

                p => p.patientId === patientId

            );

        if (patient) {

            return patient;

        }

    }

    return null;

},



    /*
    =====================================
    USER
    =====================================
    */

    saveUser(user) {

        localStorage.setItem(

            CONFIG.storage.USER,

            JSON.stringify(user)

        );

    },


    loadUser() {

        const data =

            localStorage.getItem(

                CONFIG.storage.USER

            );

        if (!data) {

            return null;

        }

        return JSON.parse(data);

    },


    logout() {

        localStorage.removeItem(

            CONFIG.storage.USER

        );

    },



    /*
    =====================================
    SETTINGS
    =====================================
    */

    saveSettings(settings) {

        localStorage.setItem(

            CONFIG.storage.SETTINGS,

            JSON.stringify(settings)

        );

    },


    loadSettings() {

        const data =

            localStorage.getItem(

                CONFIG.storage.SETTINGS

            );

        if (!data) {

            return null;

        }

        return JSON.parse(data);

    },



    /*
    =====================================
    Összes DrugAssist adat törlése
    =====================================
    */

clearAll() {

    this.clearWards();

    this.logout();

    localStorage.removeItem(

        CONFIG.storage.SETTINGS

    );

    localStorage.removeItem(

        CONFIG.storage.CURRENT_WARD

    );

    localStorage.removeItem(

        CONFIG.storage.CURRENT_PATIENT

    );

}

};