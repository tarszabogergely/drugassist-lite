/*
=========================================
DrugAssist

Fájl:
dm-parser.js

Feladata:
Gyógyszer DataMatrix vonalkódok
feldolgozása (GTIN, lejárat, sarzs).

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

const DmParser = {

    /*
    =====================================
    DM vonalkód feldolgozása
    =====================================
    */

    parse(code) {

        const result = {

            gtin: "",

            expiry: "",

            lot: ""

        };

        if (!code) {

            return result;

        }

        /*
        =====================================
        GTIN
        =====================================
        */

        if (

            code.startsWith("01") &&

            code.length >= 16

        ) {

            result.gtin =

                this.normalizeGtin(

                    code.substring(2, 16)

                );

        }

        /*
        =====================================
        Lejárat
        =====================================
        */

        const expiryPos = code.indexOf("17");

        if (

            expiryPos !== -1 &&

            code.length >= expiryPos + 8

        ) {

            result.expiry =

                this.formatExpiry(

                    code.substring(

                        expiryPos + 2,

                        expiryPos + 8

                    )

                );

        }

        /*
        =====================================
        LOT (Sarzs)
        =====================================
        */

        if (expiryPos !== -1) {

            const lotAfter = code.indexOf(

                "10",

                expiryPos + 8

            );

            if (lotAfter !== -1) {

                result.lot = code.substring(lotAfter + 2);

            } else {

                const before = code.substring(16, expiryPos);

                const relPos = before.lastIndexOf("10");

                if (relPos !== -1) {

                    result.lot = before.substring(relPos + 2);

                }

            }

        }

        return result;

    },

    /*
    =====================================
    GTIN normalizálása (GTIN14 -> EAN13)
    =====================================
    */

    normalizeGtin(gtin) {

        if (!gtin) return "";

        if (

            gtin.length === 14 &&

            gtin.startsWith("0")

        ) {

            return gtin.substring(1);

        }

        return gtin;

    },

    /*
    =====================================
    Lejárat formázása (YYMMDD -> YYYY-MM-DD)
    =====================================
    */

    formatExpiry(value) {

        if (!value || value.length !== 6) {

            return "";

        }

        return (

            "20" +

            value.substring(0, 2) +

            "-" +

            value.substring(2, 4) +

            "-" +

            value.substring(4, 6)

        );

    }

};
