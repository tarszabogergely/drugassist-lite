/*
=========================================
DrugAssist

Fájl:
preparation.js

Feladata:
Készítési azonosító létrehozása.

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

const Preparation = {

    create() {

        const user = Storage.loadUser();

        if (!user) {

            throw new Error(
                "Nincs bejelentkezett felhasználó."
            );

        }

        const now = new Date();

        const date =

            String(now.getFullYear()).slice(2) +

            String(now.getMonth() + 1).padStart(2, "0") +

            String(now.getDate()).padStart(2, "0");

        const time =

            String(now.getHours()).padStart(2, "0") +

            String(now.getMinutes()).padStart(2, "0") +

            String(now.getSeconds()).padStart(2, "0");

        return {

            id:

                "DA" +

                date +

                "-" +

                user.id +

                "-" +

                time,

            started:

                Utils.getDateTime(),

            finished:

                null,

            userId:

                user.id,

            userName:

                user.name,

            status:

                "started"

        };

    }

};