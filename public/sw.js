console.log("sw start");

(function (){
    const serverWorker = {
        
        init() {
            self.addEventListener("install", serverWorker.eventFunctions.install);
            self.addEventListener("fetch", serverWorker.eventFunctions.fetch)
        },
        version: {
            versionValue: "1.0.0",
            get () {
                return this.versionValue;
            },
            set (version) {
                this.versionValue = version;
            }
        },
        eventFunctions: {
            install (e) {
                
                e.waitUntil(
                    caches.open(serverWorker.version.get())
                    .then(cache => cache.addAll([
                        "/offline/offline.html",
                    ]))
                    .then(self.skipWaiting())
                );
            },
            fetch (e) {
                const request = e.request;
                const requestURL = request.url;
                const splittedURL = requestURL.split(".");
                const possibleExtension = splittedURL[splittedURL.length - 1];
                const acceptableExtensions = {
                    "png": true,
                    "jpg": true,
                    "gif": true
                };
                console.log("possibleExtension", possibleExtension, "requestURL", requestURL);
                
                if (request.mode === "navigate" ||  (possibleExtension != undefined && acceptableExtensions[possibleExtension])) { // || request.url .jpg 
                    
                    e.respondWith(
                        fetch(request)
                            .then(response => serverWorker.cachePage(request, response))
                            .catch(err => serverWorker.fetchCoreFile(request.url))
                    );
                } else {
                    e.respondWith(
                        fetch(request)
                            .catch(err => serverWorker.fetchCoreFile(request.url))
                    );
                }
            }
        },
        fetchCoreFile(url) {
            return caches.open(serverWorker.version.get())
                .then(cache => cache.match(url))
                .then(response => response ? response : Promise.reject());
        },
        cachePage(request, response) { 
            const clonedResponse = response.clone();
            caches.open(serverWorker.version.get())
                .then(cache => cache.put(request, clonedResponse));
            return response;
        }
    };


    serverWorker.init();
})();


