'use strict';
// Note: hiding sections with hidden may impair designs (display attribute)
// Improve current no saved memes message appearance

function initGallery() {
    createImages();
    renderTemplates();
}

function renderTemplates(filter = null) {
    const images = getImages(filter)
    const strHTML = images.map(img => {
        return `<img src="${img.src}" onclick="onImageClicked(${img.id})">`;
    }).join('');

    document.querySelector('.saved-memes-gallery').classList.add('hidden');
    document.querySelector('.meme-editor').classList.add('hidden');
    const templatesGallery = document.querySelector('.templates-gallery');
    templatesGallery.classList.remove('hidden');
    templatesGallery.querySelector('.gallery-container').innerHTML = strHTML;
}

function renderSavedMemes() {
    const memes = getFromStorage('memes');
    if (memes) {
        var strHTML = memes.map(meme => {
            return `<img src="${JSON.parse(meme.preview)}" onclick="onImageClicked(undefined, ${meme.id})">`;
        }).join('');
    } else {
        var strHTML = 'You have 0 saved memes. Go and make some!';
    }

    document.querySelector('.templates-gallery').classList.add('hidden');
    document.querySelector('.meme-editor').classList.add('hidden');
    const savedMemesGallery = document.querySelector('.saved-memes-gallery');
    savedMemesGallery.classList.remove('hidden');
    savedMemesGallery.querySelector('.gallery-container').innerHTML = strHTML;
}

function onImageClicked(imageId, meme = createMeme(imageId)) {
    if (typeof meme === 'number') {
        const memes = getFromStorage('memes');
        meme = memes.find(savedMeme => savedMeme.id === meme).meme;
    }
    setMeme(meme);
    if (imageId >= 0) addTextToMeme();

    document.querySelector('.templates-gallery').classList.add('hidden');
    document.querySelector('.saved-memes-gallery').classList.add('hidden');
    document.querySelector('.meme-editor').classList.remove('hidden');

    initCanvas();
}

function onImageUpload(ev) {
    loadUploadedImage(ev);
    setTimeout(() => {
        document.querySelector('.meme-editor').classList.remove('hidden');
        document.querySelector('.templates-gallery').classList.add('hidden');
        document.querySelector('.saved-memes-gallery').classList.add('hidden');
        initCanvas()
    }, 100);
}