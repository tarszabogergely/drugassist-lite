/*
=========================================
DrugAssist

Fájl:
label-template.js

Feladata:
58×43 mm címke HTML létrehozása.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

const LabelTemplate = {

    create(patient) {

        return `

<!DOCTYPE html>

<html lang="hu">

<head>

<meta charset="UTF-8">

<style>

@page{

    size:58mm 43mm;

    margin:0;

}

html,
body{

    margin:0;

    padding:0;

}

body{

    width:58mm;

    height:43mm;

    font-family:Arial,sans-serif;

    padding:3mm;

    box-sizing:border-box;

}

.name{

    font-size:16px;

    font-weight:bold;

    margin-bottom:2mm;

}

.ward{

    font-size:11px;

}

.bed{

    font-size:12px;

    font-weight:bold;

    margin-top:2mm;

}

.date{

    font-size:10px;

    margin-top:2mm;

}

.preparation{

    font-size:11px;

    margin-top:3mm;

    font-weight:bold;

}

.barcode{

    margin-top:3mm;

    text-align:center;

    font-size:24px;

    letter-spacing:2px;

}

</style>

</head>

<body>

<div class="name">

${patient.name}

</div>

<div class="ward">

${patient.wardName}

</div>

<div class="bed">

Ágy: ${patient.bed}

</div>

<div class="date">

${Utils.getToday()}

</div>

<div class="preparation">

${patient.preparation.id}

</div>

<div class="barcode">

|||||||||||||||||||||

</div>

</body>

</html>

`;

    }

};