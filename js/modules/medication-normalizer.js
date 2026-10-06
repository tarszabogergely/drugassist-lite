/*
=========================================
DrugAssist

Fájl:
medication-normalizer.js

Feladata:
Gyógyszernevek egységesítése.

=========================================
*/

const MedicationNormalizer = {

    normalize(name){

        return Utils.cleanPdfText(name)
            .toUpperCase()
            .replace(/\s+/g," ")
            .trim();

    }

};