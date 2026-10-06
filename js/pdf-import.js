/*
=========================================
DrugAssist

Fájl:
pdf-import.js

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
CONFIG.pdf.worker;

const PdfImport = {

    async importWardPdf(file) {

        const buffer = await file.arrayBuffer();

        const pdf = await pdfjsLib
            .getDocument({ data: buffer })
            .promise;

        let text = "";

const allItems = [];

        for (let i = 1; i <= pdf.numPages; i++) {

            const page = await pdf.getPage(i);

            const content = await page.getTextContent();

allItems.push(

    ...content.items.map(item => ({

        text: item.str,

        x: Math.round(
            item.transform[4]
        ),

        y: Math.round(
            item.transform[5]
        )

    }))

);


console.table(

    content.items.map(item => ({

        text: item.str,

        x: Math.round(item.transform[4]),

        y: Math.round(item.transform[5]),

        width: Math.round(item.width),

        height: Math.round(item.height)

    }))

);

text += content.items
    .map(item => item.str)
    .join(" ");

text += "\n";

        }

        return this.parseWardPdf(

    text,

    allItems

);

    },


parseWardPdf(

    text,

    items

) {

    const lines = text
    .split(/\s{2,}|\n/)
    .map(line => Utils.cleanPdfText(line))
    .filter(line => line.length > 0);

    // Utils.log(lines);

    // Osztály

let wardCode = "";

const wardLine = lines.find(line =>

    /^\d{5}\b/.test(line)

);

if (wardLine) {

    wardCode =

        wardLine.match(
            /^\d{5}/
        )[0];

}

const department =

    Departments.find(
        wardCode
    );

const wardName =

    department

        ? department.name

        : "";

    // Betegek

const patients = [];

for (let i = 0; i < lines.length; i++) {

    if (/^\d{9}$/.test(lines[i])) {

        const patient = {

            patientId: lines[i],

            name: lines[i - 1],

            wardCode: wardCode,

            wardName: wardName,

            bed: this.findBed(

    items,

    lines[i]

),

            onWard: true,

            lastImport: Utils.getToday(),

            workDate: null,

            status: CONFIG.status.NEW,

            preparation: null,

            medications: []

        };

        patients.push(patient);

    }

}

    return {

        wardCode,

        wardName,

        patients

    };

},

async importPatientPdf(file) {

    const buffer = await file.arrayBuffer();

    const pdf = await pdfjsLib
        .getDocument({ data: buffer })
        .promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {

        const page = await pdf.getPage(i);

        const content = await page.getTextContent();


content.items.forEach((item, index) => {

    if (index < 150) {

        Utils.log(

            index +

            " : " +

            JSON.stringify(item.str)

        );

    }

});

text += content.items
    .map(item => item.str)
    .join(" ");

text += "\n";

    }

    text = Utils.cleanPdfText(text);

const start =

    text.indexOf("Éjjel 0-4");

const end =

    text.indexOf("Lázlap történet");

if (

    start !== -1 &&

    end !== -1

) {

    text = text.substring(

        start,

        end

    );

}

Utils.log(text);

return this.parsePatientPdf(text);

},

findBed(items, patientId) {

    const idItem = items.find(
    item =>
        item.text.trim() ===
        patientId.trim()
);

if (!idItem) {

    return "";

}

    
    
    const doctor = items.find(

    item =>

        Math.abs(
            item.y -
            idItem.y
        ) <= 2 &&

        item.x > 350 &&

        /^dr\.?/i.test(
            item.text
        )

);

    if (!doctor) {

        return "";

    }

    const candidates = items.filter(

    item =>

        Math.abs(
            item.y -
            idItem.y
        ) <= 2 &&

        item.x < doctor.x &&

        /\d/.test(
            item.text
        )

);

    if (!candidates.length) {

        return "";

    }

    candidates.sort(

        (a, b) => b.x - a.x

    );

    return candidates[0].text.trim();

},

parsePatientPdf(text) {

    return MedicationParser.parse(text);

}

};