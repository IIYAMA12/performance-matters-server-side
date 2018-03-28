# Service worker

## Manifest

The manifest is a file which includes information about the website you are going to cache. It is like a kind of meta.xml or condig.xml file, which contains the main/global information.

```JSON
{
  "name": "Map",
  "short_name": "Map",
  "description": null,
  "dir": "auto",
  "lang": "en-US",
  "display": "standalone",
  "start_url": ".",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [{
    "src": "/logo/logo.png",
    "sizes": "100x100",
    "type": "image/png"
  },{
    "src": "/logo/logo.png",
    "sizes": "200x200",
    "type": "image/png"
  }]
}
```

Manifest requires minimal to be accepted by lighthouse:
* Valid `name` property.
* Valid `short_name` property.
* Valid `start_url` property.
* A display property with the values standalone, fullscreen, or minimal-ui
* An icon that is minimal 192px width and height.
[Requirements](https://developers.google.com/web/tools/lighthouse/audits/install-prompt)
## Installing service worker


```JS
self.addEventListener("install", serverWorker.eventFunctions.install);
```

[install / oninstall](https://developer.mozilla.org/en-US/docs/Web/API/InstallEvent)
Listen to the installation `start` of itself. (not when it finished)

```JS
// {
    install (e) {
        e.waitUntil(
            caches.open(serverWorker.version.get())
            .then(cache => cache.add(
                "/offline/offline.html"
            ))
            .then(self.skipWaiting())
        );
    },
// }
```

When the install event triggers, it will give an installEvent back in to the first parameter.

---

#### Syntax `event.activeWorker`

```JS
const myActiveWorker = event.activeWorker
```
It has a property `activeWorker`, which contains the service worker object.
[ServiceWorker](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker)

---

#### ExtendableEvent

The install event seems to contain the ExtendableEvent method, which is used to ensure that the objeect doesn't get destroyed inside of the function scope. It is saved in to the Global scope as a part of the service worker `lifecycle`. For more information: [ExtendableEvent](https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent)

---

#### Syntax `event.waitUntil`

```JS
event.waitUntil(promise)
```

[event.waitUntil](https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil)

This method tells the event that the work is ongoing. It can also detect when work has been done successfully. When it is used for service workers, the `waitUntil` method tells the browser that the work is not ended until the promise is finished. I am not sure if I am correct, but I think it keeps waiting until everything is done before cleaning up the event data.

---

#### Syntax `ServiceWorkerGlobalScope.skipWaiting`
```JS
ServiceWorkerGlobalScope.skipWaiting().then(function() {

});
```
[ServiceWorkerGlobalScope.skipWaiting](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting)
The skipWaiting method is use to force the service worker to become active.


## Fetch and caching the incoming URL's + data.

```JS
self.addEventListener("fetch", serverWorker.eventFunctions.fetch);
```
Listen for incoming requests.

```JS
// {
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
// }
```


1. Split the URL on `.` and get the last part of the url.
```JS
const requestURL = request.url;
const splittedURL = requestURL.split(".");
const possibleExtension = splittedURL[splittedURL.length - 1];
```

2. Check if the extension is `png`, `jpg` or `gif`.
```JS
const acceptableExtensions = {
    "png": true,
    "jpg": true,
    "gif": true
};

if (request.mode === "navigate" ||  (possibleExtension != undefined && acceptableExtensions[possibleExtension])) {
```

3. Fetch the request. If successfull then cache the file. If failed then try to get it from the cache.

```JS
    e.respondWith(
        fetch(request)
            .then(response => serverWorker.cachePage(request, response))
            .catch(err => serverWorker.fetchCoreFile(request.url))
    );
```

[respondWith](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/respondWith)

The `respondWith` method is used to prevent the browser it's default fetching behaviour. It gives you the ability to attach a promise to it, so that you can do the behaviour manually.

---

#### fetchCoreFile function/method

```JS
// {
    fetchCoreFile(url) {
        return caches.open(serverWorker.version.get())
            .then(cache => cache.match(url))
            .then(response => response ? response : Promise.reject());
    },
// }
```

This function/method makes use of the methods below and is used to get data from the cache.

---

#### cachePage function/method

```JS
// {
    cachePage(request, response) { 
        const clonedResponse = response.clone();
        caches.open(serverWorker.version.get())
            .then(cache => cache.put(request, clonedResponse));
        return response;
    }
// }
```

This function/method makes use of the methods below and is used to save data in the cache. The name of the function references to cache pages, but in my edited example I am also caching images(png/jpg/gif). So I probably have to rename it to cacheFile instead later on.

---

#### Syntax `cache.match`
```JS
cache.match(request, {options}).then(function(response) {

});
```
[cache.match](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match)

With the `cache.match()` method you can receive the data you have stored in your cache. It has requires one argument to be able to use, which is the `request` / key. There is also an optional argument options, which requires an object that contains information how you are going to match with your cache. For now(2018-03-28) it supports: `ignoreSearch`, `ignoreMethod`, `ignoreVary` and `cacheName`.

---

#### Syntax `caches.open`
```JS
caches.open(cacheName).then(function(cache) {
    // the cache is now open and available
});
```
[caches.open](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/open)

This method gives you access to a requested cache. Once the promise is successfull, it will return the cache to you with `then`. It is located in the first parameter. 

The `caches` is a global and readonly variable, which comes from the `CacheStorage`.
[caches](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/caches)

---

#### Syntax `cache.put` 
```JS
cache.put(request, response).then(function() {
  // The response under the key request has been added to the cache.
});
```
[cache.put](https://developer.mozilla.org/en-US/docs/Web/API/Cache/put)

The `cache.put` method stores a value in the cache under a key. In this case it is the `request` as `key` and the `response` as `value`. When the `then` method is called, the value is stored successfully.

## Audit localhost



<details>
    <summary>
        Audit: service-worker not installed
    </summary>
    <img alt="Audit no service-worker installed, part of image 1/2" src="https://raw.githubusercontent.com/IIYAMA12/performance-matters-server-side/master/readme-content/service-worker/no-audit-localhost1.png">
    <img alt="Audit no service-worker installed, part of image 2/2"  src="https://raw.githubusercontent.com/IIYAMA12/performance-matters-server-side/master/readme-content/service-worker/no-audit-localhost2.png">
</details>

#### Performance:
* First meaningful paint: 1480ms
* First Interactive (beta) 2450ms
* Consistently Interactive (beta) 2,450ms
* Perceptual Speed Index 3,124

#### Progressive Web App
* 55% (5/11)


<details>
    <summary>
        Audit: Installing service-worker
    </summary>
    <img alt="Audit install service-worker, part of image 1/2" src="https://raw.githubusercontent.com/IIYAMA12/performance-matters-server-side/master/readme-content/service-worker/audit-install1.png">
    <img alt="Audit install service-worker, part of image 2/2"  src="https://raw.githubusercontent.com/IIYAMA12/performance-matters-server-side/master/readme-content/service-worker/audit-install2.png">
</details>

#### Performance:
* First meaningful paint: 1520ms
* First Interactive (beta) 2440ms
* Consistently Interactive (beta) 2,440ms
* Perceptual Speed Index 3,175

#### Progressive Web App
* 82% (2/11)


<details>
    <summary>
        Audit: service-worker is already installed
    </summary>
    <img alt="Audit service-worker already installed, part of image 1/2" src="https://raw.githubusercontent.com/IIYAMA12/performance-matters-server-side/master/readme-content/service-worker/audit-installed1.png">
    <img alt="Audit service-worker already installed, part of image 2/2"  src="https://raw.githubusercontent.com/IIYAMA12/performance-matters-server-side/master/readme-content/service-worker/audit-installed2.png">
</details>

#### Performance:
* First meaningful paint: 1330ms
* First Interactive (beta) 2510ms
* Consistently Interactive (beta) 2,510ms
* Perceptual Speed Index 3,075

#### Progressive Web App
* 82% (2/11)


#### Why not test with `ngrok` instead?
![Google Chrome doesn't like my service-worker incombination with ngrok](readme-content/service-worker/ngrok-service-worker-not-working.png)

Google Chrome doesn't let me... GRRRRRaudit