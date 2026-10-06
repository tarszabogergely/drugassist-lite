/*
=========================================
DrugAssist

Fájl:
departments.js

Feladata:
Osztálytörzs kezelése.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

const Departments = {

    byCode: {

        "12001": {

            name:
                "ÁLTALÁNOS ÉS PLASZTIKAI SEBÉSZET"

        },

        "15001": {

            name:
                "MELLKASSEBÉSZET"

        },

        "18001": {

            name:
                "FÜL-ORR-GÉGÉSZET OSZTÁLY"

        },

        "32001": {

            name:
                "GASZTROENT.ÉS BELGYÓGYÁSZATI OSZT."

        },

        "36001": {

            name:
                "INFEKTOLÓGIAI OSZTÁLY"

        }

    },

    find(code) {

        return this.byCode[code] || null;

    }

};