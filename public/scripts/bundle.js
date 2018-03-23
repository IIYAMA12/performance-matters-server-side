(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
const imageLoadingFeedback = {
    onImageLoad (e) {
        this.classList.add("loaded");
    }
};


document.getElementsByTagName("body")[0].classList.add("js-available");
const images = document.getElementById("map-information").getElementsByTagName("img");
for (let index = 0; index < images.length; index++) {
    const image = images[index];
    if (!image.complete) {
        console.log("add listener");
        
        image.addEventListener("load", imageLoadingFeedback.onImageLoad);
    } else {
        image.classList.add("loaded");
    }
}

module.exports = imageLoadingFeedback;
},{}],2:[function(require,module,exports){
const imageLoader = require("./image-loading-feedback");
const zeroState = require("./zero-state");
},{"./image-loading-feedback":1,"./zero-state":3}],3:[function(require,module,exports){
const zeroState = {}


module.exports = zeroState;
},{}]},{},[2]);
