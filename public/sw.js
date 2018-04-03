
(function (){
    const serviceWorker = {
        
        init() {
            self.addEventListener("install", serviceWorker.eventFunctions.install);
            self.addEventListener("fetch", serviceWorker.eventFunctions.fetch);
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
                    caches.open(serviceWorker.version.get())
                    .then(cache => cache.addAll([
                        "/offline/offline.html"
                    ]))
                    .then(self.skipWaiting())
                );
            },
            fetch (e) {
                const request = e.request;
                
                serviceWorker.log.url(request.url);


                if (request.mode === "navigate") {  


                    e.respondWith(
                        fetch(request)
                            .then(response => serviceWorker.cacheFile(request, response))
                            .catch(err => serviceWorker.fetchCoreFile(request.url))
                            .catch(err => fetchCoreFile("/offline/offline.html"))
                    );
                } else {
                    const requestURL = request.url;
                    const splittedURL = requestURL.split(".");
                    const possibleExtension = splittedURL[splittedURL.length - 1];
                    const acceptableExtensions = {
                        "png": true,
                        "jpg": true,
                        "gif": true,
                        "css": true,
                        "js": true
                    };
                    if (possibleExtension != undefined && acceptableExtensions[possibleExtension]) { 
                        e.respondWith(
                            fetch(request)
                                .then(response => serviceWorker.cacheFile(request, response))
                                .catch(err => serviceWorker.fetchCoreFile(request.url))
                        );
                    } else {
                        e.respondWith(
                            fetch(request)
                                .catch(err => serviceWorker.fetchCoreFile(request.url))
                        );
                    }
                }
            }
        },
        log: {
            url: function (url) {
                fetch("/log", {
                    body: url, // must match 'Content-Type' header
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: 'same-origin', // include, same-origin, *omit
                    headers: {
                      'user-agent': 'Mozilla/4.0 MDN Example',
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    method: 'POST', // *GET, POST, PUT, DELETE, etc.
                    mode: 'cors', // no-cors, cors, *same-origin
                    redirect: 'follow', // *manual, follow, error
                    referrer: 'no-referrer', // *client, no-referrer
                });
                // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
            }
        },
        fetchCoreFile(url) {
            return caches.open(serviceWorker.version.get())
                .then(cache => cache.match(url))
                .then(response => response ? response : Promise.reject());
        },
        cacheFile(request, response) { 
            const clonedResponse = response.clone();
            caches.open(serviceWorker.version.get())
                .then(cache => cache.put(request, clonedResponse));
            return response;
        }
    };


    serviceWorker.init();
})();


