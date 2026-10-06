/*
=========================================
DrugAssist

Fájl:
dm-input.js

Feladata:
DM olvasó kezelése.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

const DmInput = {

    callback: null,

    enabled: true,

    init(callback) {

        this.callback = callback;

        const input =

            document.getElementById(
                "scannerInput"
            );

        input.focus();

        input.addEventListener(

            "keydown",

            event => {

                if (!this.enabled) {

                    return;

                }

                if (

                    event.key !== "Enter"

                ) {

                    return;

                }

                event.preventDefault();

                const code =

                    input.value.trim();

                input.value = "";

                input.focus();

                if (!code) {

                    return;

                }

                if (this.callback) {

                    this.callback(code);

                }

            }

        );

    },

    focus() {

        document

            .getElementById(
                "scannerInput"
            )

            .focus();

    },

    disable() {

        this.enabled = false;

        this.setStatus(
            "🔒 Gyógyszerelés lezárva"
        );

    },

    enable() {

        this.enabled = true;

        this.setStatus(
            ""
        );

    },

    setStatus(text) {

    const status =

        document.getElementById(
            "scannerStatus"
        );

    if (!status) {

        return;

    }

    status.textContent = text;

}


};