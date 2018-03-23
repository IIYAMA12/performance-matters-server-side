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