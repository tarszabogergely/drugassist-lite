/*
=========================================
DrugAssist

Fájl:
medication-locator.js

Feladata:
Gyógyszernevek hozzárendelése
az adagolásokhoz.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

const MedicationLocator = {

    /*
    =====================================
    Gyógyszerek meghatározása
    =====================================
    */

    locate(items, doses) {

        const rows =
            this.buildRows(items);

        const result = [];

        doses.forEach(dose => {

            const medication =
                this.findMedication(
                    rows,
                    dose
                );

            result.push({

                ...dose,

                medication

            });

        });

        return result;

    },

    /*
    =====================================
    PDF sorok felépítése
    =====================================
    */

    buildRows(items) {

        const tolerance = 3;

        const rows = [];

        items.forEach(item => {

            const y =
                Math.round(
                    item.transform[5]
                );

            let row =
                rows.find(r =>

                    Math.abs(
                        r.y - y
                    ) <= tolerance

                );

            if (!row) {

                row = {

                    y,

                    items: []

                };

                rows.push(row);

            }

            row.items.push(item);

        });

        rows.forEach(row => {

            row.items.sort((a,b)=>

                a.transform[4] -
                b.transform[4]

            );

        });

        rows.sort((a,b)=>

    b.y - a.y

);

/*
=====================================
DEBUG
=====================================
*/

rows.forEach(row => {

    Utils.log(

        row.items

            .map(item => item.str)

            .join(" | ")

    );

});

return rows;

    },

    /*
    =====================================
    Gyógyszernév keresése
    =====================================
    */

    findMedication(rows, dose) {

        const doseRowIndex =

            rows.findIndex(row =>

                row.items.some(item =>

                    item.str.trim() === dose.dose &&

                    Math.abs(

                        Math.round(
                            item.transform[5]
                        ) - dose.y

                    ) <= 3

                )

            );

        if (doseRowIndex === -1) {

            return "";

        }

        for (

            let i = doseRowIndex;

            i >= 0;

            i--

        ) {

            const texts =

                rows[i].items

                    .map(item =>

                        item.str.trim()

                    )

                    .filter(text =>

                        text !== ""

                    );

            if (

                texts.length >= 2 &&

                ["O","P","S"]

                    .includes(

                        texts[0]

                    )

            ) {

                return this.normalizeMedicationName(

    texts

        .slice(1)

        .join(" ")

);

            }

        }

        return "";

},


/*
=====================================
Gyógyszernév normalizálása
=====================================
*/

normalizeMedicationName(name) {

    name =

        name

            .replace(/\s+/g, " ")

            .trim();

    /*
    Ha megtaláltuk a kiszerelés végét,
    utána már mindent levágunk.
    */

    const endPatterns = [

        /\d+X\s*BUB/i,
        /\d+X\d+\s*BUB/i,
        /\d+X\d+/i,
        /\b\d+X\b/i,
        /\d+X\d*ADAG/i

    ];

    for (const pattern of endPatterns) {

        const match =

            name.match(pattern);

        if (match) {

            const end =

                match.index +

                match[0].length;

            return name

                .substring(0, end)

                .trim();

        }

    }

    return name;

}

};