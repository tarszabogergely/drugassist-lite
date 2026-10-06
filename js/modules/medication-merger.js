/*
=========================================
DrugAssist

Fájl:
medication-merger.js

Feladata:
Azonos gyógyszerek összevonása.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

const MedicationMerger = {

    merge(records) {

        const medications = {};

        records.forEach(record => {

            if (!medications[record.medication]) {

                medications[record.medication] = {

                    medication: record.medication,

                    schedule: {}

                };

            }

            medications[
                record.medication
            ].schedule[
                record.period
            ] = record.dose;

        });

        return Object.values(
            medications
        );

    }

};