/*
=========================================
DrugAssist

Fájl:
label.js

Feladata:
Betegazonosító címke nyomtatása.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

const Label = {

    print(patient) {

        // Preparation ID létrehozása

        if (!patient.preparation) {

            patient.preparation =
    Preparation.create();

patient.workDate =
    Utils.getToday();

Storage.savePatient(patient);

        }

        // Frissítjük a beteg oldalt

        renderPatient(patient);

        // Címke HTML

        const html =
            LabelTemplate.create(patient);

        // Új nyomtatási ablak

        const win =
            window.open(
                "",
                "_blank",
                "width=400,height=300"
            );

        win.document.open();

        win.document.write(html);

        win.document.close();

        win.focus();

        // Kis várakozás a render miatt

        setTimeout(() => {

            win.print();

            // Egyelőre ne zárjuk be,
            // hogy lássuk a címkét.

            // win.close();

        }, 300);

    }

};