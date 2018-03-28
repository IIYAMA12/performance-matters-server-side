# Service worker

## Manifest

The manifest is a file which includes information about the website you are going to cache. Which helps
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

## Fetch the incoming URL's.

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

3. Get the file from th

```JS
    e.respondWith(
        fetch(request)
            .then(response => serverWorker.cachePage(request, response))
            .catch(err => serverWorker.fetchCoreFile(request.url))
    );
```

[respondWith](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/respondWith)

The `respondWith` method is used to prevent the browser it's default fetching behaviour. It gives you the ability to attach a promise to it, so that you can do the behaviour manually.

```JS
// {
    fetchCoreFile(url) {
        return caches.open(serverWorker.version.get())
            .then(cache => cache.match(url))
            .then(response => response ? response : Promise.reject());
    },
// }
```

#### Syntax `cache.match`
```JS
cache.match(request, {options}).then(function(response) {

});
```
[cache.match](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match)

With the `cache.match()` method you can receive the data you have stored in your cache. It has requires one argument to be able to use, which is the `request` / key. There is also an optional argument options, which requires an object that contains information how you are going to match with your cache. For now(2018-03-28) it supports: `ignoreSearch`, `ignoreMethod`, `ignoreVary` and `cacheName`.



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

This function makes use of the methods below and is used to save data in the cache. The name of the function references to cache pages, but in my edited example I am also caching images(png/jpg/gif). So I probably have to rename it to cacheFile instead later on.


#### Syntax `caches.open`
```JS
caches.open(cacheName).then(function(cache) {
    // the cache is now open and available
});
```

This method gives you access to a requested cache. Once the promise is successfull, it will return the cache to you with `then`. It is located in the first parameter. 

#### Syntax `cache.put` 
```JS
cache.put(request, response).then(function() {
  // The response under the key request has been added to the cache.
});
```
[cache.put](https://developer.mozilla.org/en-US/docs/Web/API/Cache/put)

The `cache.put` method stores a value in the cache under a key. In this case it is the `request` as `key` and the `response` as `value`. When the `then` method is called, the value is stored successfully.