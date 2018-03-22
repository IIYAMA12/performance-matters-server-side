const streetManagement = {
    render (data) {
        if (data != undefined) {
            console.log(data);
            
            const results = data.results;
            const bindings = results.bindings;
            console.log(bindings, bindings.length);
            
            if (bindings.length > 0) {

                let list = "";

                // mobile only
                dialogBindings = bindings;

                for (let i = 0; i < bindings.length; i++) {
                    const binding = bindings[i];


                    let figcaption = "";
                    let subject = "";
                    let startYear = "";



                    if (binding.creator != undefined && binding.creator.value != undefined) {
                        figcaption = "<figcaption>Auteur: " + binding.creator.value + "</figcaption>"
                    }

                    if (binding.subject != undefined && binding.subject.value != undefined && binding.subject.type != "uri") {
                        subject =  "<p>Onderwerp: " + binding.subject.value + "</p>";
                    }

                    if (binding.startYear != undefined && binding.startYear.value != undefined && binding.subject.type != "uri") {
                        startYear = "<p>Genomen op: <time>" + binding.startYear.value + "<time></p>";
                     }

                     list += `
                        <li id = "` + "image-information-" + i + `">
                            <figure>
                                <img src="` + binding.img.value + `" alt="` + binding.img.value +`">
                                ` + figcaption + subject + startYear +  `
                            </figure>
                        </li>
                    `;
                }
                return list;
            } else {
                console.log("no bindings");
            }
        }
    }
};




module.exports = streetManagement;