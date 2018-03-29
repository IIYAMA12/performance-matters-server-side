console.log("sw start");

(function (){
    const serverWorker = {
        
        init() {
            console.log("init?");
            self.addEventListener("install", serverWorker.eventFunctions.install);
            self.addEventListener("fetch", serverWorker.eventFunctions.fetch);
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
                console.log("works?");
                
                e.waitUntil(
                    caches.open(serverWorker.version.get())
                    .then(cache => cache.addAll([
                        "/offline/offline.html"
                    ]))
                    .then(self.skipWaiting())
                );
            },
            fetch (e) {
                const request = e.request;
                

                // let httpRequest = new XMLHttpRequest();

                // httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

                // httpRequest.open("POST", "/log", true);
                // console.log("post request");


                
                // httpRequest.send(JSON.stringify(request.url));

                serverWorker.log.url(request.url);


                if (request.mode === "navigate") {  


                    e.respondWith(
                        fetch(request)
                            .then(response => serverWorker.cacheFile(request, response))
                            .catch(err => serverWorker.fetchCoreFile(request.url))
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
                                .then(response => serverWorker.cacheFile(request, response))
                                .catch(err => serverWorker.fetchCoreFile(request.url))
                        );
                    } else {
                        e.respondWith(
                            fetch(request)
                                .catch(err => serverWorker.fetchCoreFile(request.url))
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
            return caches.open(serverWorker.version.get())
                .then(cache => cache.match(url))
                .then(response => response ? response : Promise.reject());
        },
        cacheFile(request, response) { 
            const clonedResponse = response.clone();
            caches.open(serverWorker.version.get())
                .then(cache => cache.put(request, clonedResponse));
            return response;
        }
    };


    serverWorker.init();
})();


