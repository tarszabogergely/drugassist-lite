/*
=========================================
DrugAssist

Fájl:
medication-parser.js

Feladata:
Beteg gyógyszerelési PDF feldolgozása.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.1.0
=========================================
*/

const MedicationParser = {

    parse(rows) {

        const result = {

            medications: [],

            substitutions: [],

            warnings: []

        };

        // Csak gyógyszersorok

        const medicationRows = rows.filter(

            row => row.type === "medication"

        );

        Utils.log(medicationRows);

        result.medications =

            this.parseMedications(

                medicationRows

            );

        Utils.log(result);

        return result;

    },

/*
=====================================
Gyógyszerek felismerése
=====================================
*/

    parseMedications(rows) {

        const medications = [];

        rows.forEach(row => {

            const line = row.text.trim();

            // O vagy P eltávolítása

            const text = line

                .replace(/^[OP]\s*/, "")

                .trim();

            // Adag felismerése

            const doseMatch =

                text.match(

                    /(\d+\s+[A-Z]+)$/

                );

            const dose =

                doseMatch ?

                doseMatch[1] :

                "";

            // Gyógyszernév

           const rawName =
    dose ?

    text.substring(
        0,
        text.length -
        dose.length
    ).trim()

    :

    text;

const name =

    MedicationNormalizer.normalize(

        rawName

    );

            let medication =

                medications.find(

                    m =>

                        m.name === name

                );

            if (!medication) {

                medication = {

                    name,

                    doses: []

                };

                medications.push(

                    medication

                );

            }

            medication.doses.push({

                period: null,

                dose

            });

        });

        return medications;

    }

};