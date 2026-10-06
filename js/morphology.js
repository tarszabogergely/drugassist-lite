"use strict";

const Morphology = (() => {

    let database = {};

    async function load(){

        const response =
            await fetch("data/drug-morphology.json");

        database =
            await response.json();

    }

    function getDescription(name){

    const search =
        name.toUpperCase().trim();

    for(const item of Object.values(database)){

        const dbName =
            item.name.toUpperCase().trim();

        if(dbName === search){

            return item.description || "";

        }

        if(dbName.startsWith(search)){

            return item.description || "";

        }

        if(search.startsWith(dbName)){

            return item.description || "";

        }

    }

    return "Ehhez a gyógyszerhez még nincs morfológia rögzítve.";

}

    return{

        load,
        getDescription

    };

})();