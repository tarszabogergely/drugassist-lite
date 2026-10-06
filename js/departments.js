/*
=========================================
DrugAssist

Fájl:
departments.js

Feladata:
Osztálytörzs kezelése (Supabase integrációval).

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

const Departments = {

    byCode: {

        "12001": {
            name: "ÁLTALÁNOS ÉS PLASZTIKAI SEBÉSZET"
        },

        "15001": {
            name: "MELLKASSEBÉSZET"
        },

        "18001": {
            name: "FÜL-ORR-GÉGÉSZET OSZTÁLY"
        },

        "32001": {
            name: "GASZTROENT.ÉS BELGYÓGYÁSZATI OSZT."
        },

        "36001": {
            name: "INFEKTOLÓGIAI OSZTÁLY"
        }

    },

    // Szinkron keresés a helyi kódmátrixban
    find(code) {

        return this.byCode[code] || null;

    },

    // Aszinkron lekérdezés Supabase adatbázisból (opcionális felülbíráláshoz)
    async getFromDb(code) {

        if (!supabase) {
            return this.find(code);
        }

        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .eq('code', code)
            .maybeSingle();

        if (error || !data) {
            return this.find(code);
        }

        return data;

    }

};
