/*
    This file is used to display/create the side information about the selected street.
*/
const streetManagement = {
    render (data) {
        
        if (data != undefined) {            
            const results = JSON.parse(data).results;
            
            if (results != undefined) {

                // bindings key is used to get the attached data to the URI request. Bindings from: binded data from the URI.
                const bindings = results.bindings;
                
                if (bindings.length > 0) {

                    let list = "";

                    // mobile only
                    // dialogBindings = bindings;

                    for (let i = 0; i < bindings.length; i++) {
                        const binding = bindings[i];

                        // set the default values
                        let figcaption = "";
                        let subject = "";
                        let startYear = "";


                        //  If the data exist, create the elements for it.
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
                    return "<ul>" + list + "</ul>";
                }
            }
        }
    }
};




module.exports = streetManagement;