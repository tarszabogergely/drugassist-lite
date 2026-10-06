/*
=========================================
DrugAssist

Fájl:
pdf-report.js

Feladata:
Gyógyszerelési jegyzőkönyv készítése.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
2.0.0
=========================================
*/

const PdfReport = {

    line(pdf, y) {

        pdf.setDrawColor(180);

        pdf.line(
            15,
            y,
            195,
            y
        );

    },

    sectionTitle(pdf, text, y) {

        pdf.setFontSize(12);

        pdf.setFont(
    "helvetica",
    "normal"
);

        pdf.text(
            text,
            15,
            y
        );

        return y + 6;

    },

    scheduleText(schedule) {

        if (!schedule)
            return "-";

        const periods = [

            "Éjjel",
            "Hajnal",
            "Reggel",
            "Dél",
            "Délután",
            "Este"

        ];

        return periods.map(p =>

            schedule[p] || "0"

        ).join("-");

    },

    checkPage(pdf, y) {

        if (y < 270)
            return y;

        pdf.addPage();

        return 20;

    },

    generate(patient) {

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({

            unit: "mm",

            format: "a4"

        });

        pdf.setFont(

            "Roboto-Regular",

            "normal"

        );

        let y = 18;

        const user =

            Storage.loadUser();

        pdf.setFontSize(20);

        pdf.text(

            "DrugAssist",

            15,

            y

        );

        pdf.setFontSize(14);

        y += 8;

        pdf.text(

            "Gyógyszerelési jegyzökönyv",

            15,

            y

        );

        y += 5;

        this.line(

            pdf,

            y

        );

        y += 10;

        y = this.sectionTitle(

            pdf,

            "Beteg adatai",

            y

        );

        pdf.setFontSize(10);

        pdf.text(

            "Beteg:",

            15,

            y

        );

        pdf.text(

            patient.name || "-",

            45,

            y

        );

        pdf.text(

            "TAJ:",

            120,

            y

        );

        pdf.text(

            patient.patientId || "-",

            145,

            y

        );

        y += 7;

        pdf.text(

            "Osztály:",

            15,

            y

        );

        pdf.text(

            patient.wardName || "-",

            45,

            y

        );

        pdf.text(

            "Ágy:",

            120,

            y

        );

        pdf.text(

            patient.bed || "-",

            145,

            y

        );

        y += 7;

        pdf.text(

            "Készítési az.:",

            15,

            y

        );

        pdf.text(

            patient.preparation?.id || "-",

            45,

            y

        );

        y += 10;

        this.line(

            pdf,

            y

        );

        y += 8;

        y = this.sectionTitle(

            pdf,

            "Gyógyszerek",

            y

        );

        pdf.setFontSize(10);

        pdf.text(

            "#",

            15,

            y

        );

        pdf.text(

            "Gyógyszer",

            25,

            y

        );

        pdf.text(

            "Adagolás",

            105,

            y

        );

        pdf.text(

            "Gy.sz.",

            155,

            y

        );

        pdf.text(

            "Lejárat",

            180,

            y

        );

        y += 3;

        this.line(

            pdf,

            y

        );

        y += 6;

        pdf.setFontSize(9);

        patient.medications.forEach(

            (med, index) => {

                y = this.checkPage(

                    pdf,

                    y

                );

                pdf.text(

                    String(index + 1),

                    15,

                    y

                );

                pdf.text(

                    med.medication || "-",

                    25,

                    y,

                    {

                        maxWidth: 75

                    }

                );

                pdf.text(

                    this.scheduleText(

                        med.schedule

                    ),

                    105,

                    y

                );

                pdf.text(

                    med.lot || "-",

                    155,

                    y

                );

                pdf.text(

                    med.expiry || "-",

                    180,

                    y

                );

                y += 7;

            }

        );

        y += 5;

        this.line(
            pdf,
            y
        );

        y += 8;

        /*
        =========================================
        Megjegyzés
        =========================================
        */

        y = this.checkPage(
            pdf,
            y
        );

        y = this.sectionTitle(
            pdf,
            "Megjegyzés",
            y
        );

        pdf.setFontSize(10);

        const note =

            patient.closeNote?.trim()

            ||

            "Nincs megjegyzés.";

        const noteLines = pdf.splitTextToSize(

            note,

            175

        );

        pdf.text(

            noteLines,

            15,

            y

        );

        y += noteLines.length * 5 + 8;

        /*
        =========================================
        Lezárási adatok
        =========================================
        */

        y = this.checkPage(
            pdf,
            y
        );

        this.line(
            pdf,
            y
        );

        y += 8;

        y = this.sectionTitle(
            pdf,
            "Lezárási adatok",
            y
        );

        pdf.setFontSize(10);

        pdf.text(
            "Lezárta:",
            15,
            y
        );

        pdf.text(
            user.name || "-",
            45,
            y
        );

        y += 7;

        pdf.text(
            "Azonosító:",
            15,
            y
        );

        pdf.text(
            user.id || "-",
            45,
            y
        );

        y += 7;

        pdf.text(
            "Lezárás ideje:",
            15,
            y
        );

        const closedDate = patient.closedAt
    ? new Date(patient.closedAt)
    : new Date();

pdf.text(
    Utils.formatDateTime(closedDate),
    45,
    y
);

        y += 12;

        /*
        =========================================
        QR helye
        =========================================
        */

        y = this.checkPage(
            pdf,
            y
        );

        pdf.setDrawColor(150);

        pdf.rect(
            15,
            y,
            30,
            30
        );

        pdf.setFontSize(8);

        pdf.text(
            "QR",
            26,
            y + 16
        );

        pdf.setFontSize(9);

        pdf.text(
            "Készítési azonosító:",
            55,
            y + 8
        );

        pdf.text(
            patient.preparation?.id || "-",
            55,
            y + 15
        );

        pdf.text(
            "Beteg:",
            55,
            y + 22
        );

        pdf.text(
            patient.name || "-",
            75,
            y + 22
        );

        y += 40;

        /*
        =========================================
        Lábléc
        =========================================
        */

        const pageHeight =

            pdf.internal.pageSize.getHeight();

        pdf.setDrawColor(180);

        pdf.line(

            15,

            pageHeight - 15,

            195,

            pageHeight - 15

        );

        pdf.setFontSize(8);

        pdf.text(

            "DrugAssist v2.0",

            15,

            pageHeight - 8

        );

        pdf.text(

            Utils.formatDateTime(

                new Date()

            ),

            150,

            pageHeight - 8

        );

        /*
        =========================================
        Mentés
        =========================================
        */

        pdf.save(

            (

                patient.preparation?.id ||

                "Gyogyszereles"

            ) + ".pdf"

        );

    }

};