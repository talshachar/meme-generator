'use strict';
// Note: hiding sections with hidden may impair designs (display attribute)
// Improve current no saved memes message appearance

function initGallery() {
    createImages();
    renderTemplates();
}

function renderTemplates(filter = null) {
    document.body.classList.remove('toggle-nav');
    document.querySelector('.screener').classList.add('hidden');
    
    const images = getImages(filter)
    const strHTML = images.map(img => {
        return `<img src="${img.src}" onclick="onImageClicked(${img.id})">`;
    }).join('');

    document.querySelector('.saved-memes-gallery').classList.add('hidden');
    document.querySelector('.meme-editor').classList.add('hidden');
    const templatesGallery = document.querySelector('.templates-gallery');
    templatesGallery.classList.remove('hidden');
    
    templatesGallery.querySelector('.gallery-container').innerHTML = strHTML;
    
    const elNavLinks = document.querySelectorAll('.main-nav a');
    elNavLinks[0].classList.add('nav-focus');
    elNavLinks[1].classList.remove('nav-focus');
    elNavLinks[2].classList.remove('nav-focus');
}

function renderSavedMemes() {
    document.body.classList.remove('toggle-nav');
    document.querySelector('.screener').classList.add('hidden');

    const memes = getFromStorage('memes');
    if (memes) {
        var strHTML = memes.map(meme => {
            return `<img src="${JSON.parse(meme.preview)}" onclick="onImageClicked(undefined, ${meme.id})">`;
        }).join('');
    } else {
        var strHTML = '<div style="grid-column: 1 / -1; text-align: center">You have 0 saved memes. Go and make some!</div>';
    }

    document.querySelector('.templates-gallery').classList.add('hidden');
    document.querySelector('.meme-editor').classList.add('hidden');
    const savedMemesGallery = document.querySelector('.saved-memes-gallery');
    savedMemesGallery.classList.remove('hidden');

    savedMemesGallery.querySelector('.gallery-container').innerHTML = strHTML;

    const elNavLinks = document.querySelectorAll('.main-nav a');
    elNavLinks[0].classList.remove('nav-focus');
    elNavLinks[1].classList.add('nav-focus');
    elNavLinks[2].classList.remove('nav-focus');
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
    
    const elNavLinks = document.querySelectorAll('.main-nav a');
    elNavLinks[0].classList.remove('nav-focus');
    elNavLinks[1].classList.remove('nav-focus');
    elNavLinks[2].classList.remove('nav-focus');

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

function toggleNav() {
    document.body.classList.toggle('toggle-nav');
    document.querySelector('.screener').classList.toggle('hidden');
}