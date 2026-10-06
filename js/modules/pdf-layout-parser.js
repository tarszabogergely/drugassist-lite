/*
=========================================
DrugAssist

Fájl:
pdf-layout-parser.js

Feladata:
PDF elemek csoportosítása sorokba.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

const PdfLayoutParser = {

    parse(items) {

        const rows = [];

        const tolerance = 2;

        items.forEach(item => {

            const text = item.str.trim();

            if (!text) {

                return;

            }

            const x = item.transform[4];
            const y = item.transform[5];

            let row = rows.find(r =>

                Math.abs(r.y - y) <= tolerance

            );

            if (!row) {

                row = {

                    y,

                    items: []

                };

                rows.push(row);

            }

            row.items.push({

                text,

                x

            });

        });

        rows.forEach(row => {

            row.items.sort(

                (a, b) => a.x - b.x

            );

            row.text = row.items

                .map(i => i.text)

                .join(" ");

        });

        rows.sort(

            (a, b) => b.y - a.y

        );

rows.forEach(row => {

    row.type = "other";

    const text = row.text.trim();

    if (

        text.startsWith("O ") ||

        text === "O" ||

        text.startsWith("P ") ||

        text === "P"

    ) {

        row.type = "medication";

    }

});

        return rows;

    }

};