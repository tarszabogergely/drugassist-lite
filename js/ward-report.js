/*
=====================================
Ward PDF report
DrugAssist Lite
Verzió: 2.0.0
=====================================
*/

const WardReport = {

    async generate(ward) {

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        pdf.setFont("helvetica", "normal");

        let y = 15;

        /*
        =====================================
        Fejléc
        =====================================
        */

        pdf.setFontSize(16);

        pdf.text(
            "Gyógyszerelési átadó jegyzökönyv",
            15,
            y
        );

        y += 10;

        pdf.setFontSize(11);

        pdf.text(
            "Osztály: " + (ward.wardName || ""),
            15,
            y
        );

        y += 6;

        pdf.text(
            "Dátum: " + Utils.getToday(),
            15,
            y
        );

        y += 6;

        const user = (Storage.loadUser ? await Storage.loadUser() : null) || {};

        pdf.text(
            "Készítette: " +
            ((user.id || "-") + " - " + (user.name || "")),
            15,
            y
        );

        y += 8;

        pdf.line(
            15,
            y,
            195,
            y
        );

        y += 8;

        /*
        =====================================
        Betegek
        =====================================
        */

        (ward.patients || []).forEach(patient => {

            const patientNote =
                patient.closeNote ||
                patient.note ||
                "";

            const patientHeight =
                26 +                                    // beteg fejléc
                ((patient.medications || []).length * 7) +
                (patientNote ? 14 : 0) +
                8;

            if (y + patientHeight > 280) {

                pdf.addPage();

                y = 15;

            }

            pdf.setFontSize(13);

            pdf.text(
                patient.name || "",
                15,
                y
            );

            y += 6;

            pdf.setFontSize(10);

            pdf.text(
                "Ágy: " + (patient.bed || "-"),
                15,
                y
            );

            y += 5;

            pdf.text(
                "Azonosító: " +
                (
                    patient.preparationId ||
                    patient.preparation?.id ||
                    "-"
                ),
                15,
                y
            );

            y += 8;

            /*
            =====================================
            Gyógyszertábla fejléc
            =====================================
            */

            pdf.setFillColor(235, 235, 235);

            pdf.rect(
                15,
                y,
                180,
                7,
                "F"
            );

            pdf.setFontSize(10);

            pdf.text(
                "Gyógyszer",
                18,
                y + 5
            );

            pdf.text(
                "Adagolás",
                110,
                y + 5
            );

            y += 7;

            /*
            =====================================
            Gyógyszerek
            =====================================
            */

            (patient.medications || []).forEach(med => {

                if (y > 270) {

                    pdf.addPage();

                    y = 15;

                }

                const name =
                    med.name ||
                    med.drugName ||
                    med.medication ||
                    med.product ||
                    "";

                const dose = Object.entries(
                    med.schedule || {}
                )
                    .map(
                        ([time, value]) => `${time}: ${value}`
                    )
                    .join(", ");

                const nameLines = pdf.splitTextToSize(
                    String(name),
                    135
                );

                const rowHeight = Math.max(
                    nameLines.length * 5 + 2,
                    7
                );

                pdf.rect(
                    15,
                    y,
                    180,
                    rowHeight
                );

                pdf.text(
                    nameLines,
                    18,
                    y + 5
                );

                pdf.text(
                    String(dose),
                    110,
                    y + 5
                );

                y += rowHeight;

            });

            /*
            =====================================
            Beteg megjegyzés
            =====================================
            */

            if (patientNote) {

                y += 6;

                pdf.setFontSize(10);

                pdf.text(
                    "Megjegyzés:",
                    15,
                    y
                );

                y += 5;

                pdf.text(
                    String(patientNote),
                    18,
                    y
                );

                y += 6;

            }

            pdf.line(
                15,
                y,
                195,
                y
            );

            y += 8;

        });

        /*
        =====================================
        Aláírások
        =====================================
        */

        if (y > 235) {

            pdf.addPage();

            y = 15;

        }

        pdf.setFontSize(11);

        pdf.text(
            "Átvette",
            15,
            y
        );

        y += 8;

        pdf.text(
            "Név: __________________________",
            15,
            y
        );

        y += 10;

        pdf.text(
            "Aláírás: _______________________",
            15,
            y
        );

        y += 18;

        pdf.text(
            "Ellenörizte",
            15,
            y
        );

        y += 8;

        pdf.text(
            "Név: __________________________",
            15,
            y
        );

        y += 10;

        pdf.text(
            "Aláírás: _______________________",
            15,
            y
        );

        const today = Utils.getToday().replaceAll(".", "-");

        pdf.save(
            `Gyogyszereles_${ward.wardCode}_${today}.pdf`
        );

    }

};
