'use strict';

var gImages, gMeme;
var gKeywords = {
    'pooh': 2, 'donald trump': 10, 'famous': 5, 'dogs': 0, 'cute': 0, 'baby babies': 0,
    'cats': 0, 'success': 0, 'kids': 0, 'aliens': 0, 'surprised': 0, 'sarcasm': 0, 'evil': 0,
    'funny': 0, 'laughing': 0, 'barak obama': 0, 'nba': 0, 'basketball': 0, 'shame': 0,
    'leonardo dicaprio': 0, 'awesome': 0, 'matrix': 0, 'what if i told you': 0,
    'one does not simply': 0, 'lord of the rings': 0, 'star trek': 0, 'vladimir putin': 0,
    'buzz lightyear': 0, 'everywhere': 0, 'woman in a field of flowers': 0,
    'look at all the': 0, 'spongebob': 0, 'evolution': 0
};

function createMeme(imageId) {
    return {
        imageId,
        focusedTextIdx: 0,
        texts: [],
        focusedStickerIdx: -1,
        stickers: []
    };
}

function addTextToMeme() {
    gMeme.texts[gMeme.texts.length] = {
        txt: 'Tap to edit text',
        font: 'Impact, sans-serif',
        size: 28,
        align: 'center',
        color: '#ffffff',
        outline: true,
        outlineColor: '#000000',
        width: null,
        pos: null,
        deleteDimensions: null
    };
    gMeme.focusedTextIdx = gMeme.texts.length - 1;
    gMeme.focusedStickerIdx = -1;
}

function addStickerToMeme(src) {
    gMeme.stickers[gMeme.stickers.length] = {
        src,
        size: 60,
        pos: { startX: 10, startY: 10 },
        deleteDimensions: null,
    }
    gMeme.focusedStickerIdx = gMeme.stickers.length - 1;
    gMeme.focusedTextIdx = -1;
}

function createImages() {
    const keywordsSet = [
        ['pooh'], ['donald trump', 'famous'], ['dogs', 'cute'], ['dogs', 'baby babies', 'cute'],
        ['cats', 'cute'], ['success', 'kids'], ['aliens'], ['baby babies', 'cute', 'surprised'], ['sarcasm'],
        ['evil', 'kids', 'funny', 'laughing'], ['barak obama', 'funny', 'laughing', 'famous'], ['nba', 'basketball'],
        ['famous', 'shame'], ['leonardo dicaprio', 'famous', 'awesome'], ['matrix', 'what if i told you'],
        ['one does not simply', 'lord of the rings'], ['star trek', 'funny', 'laughing'], ['vladimir putin', 'famous'],
        ['buzz lightyear', 'everywhere'], ['woman in a field of flowers', 'look at all the'], ['spongebob', 'evolution']
    ];
    gImages = keywordsSet.map((keywords, id) => { return createImage(keywords, id) });
}

function createImage(keywords, id, src = `assets/memes/${id}.jpg`) {
    return {
        id,
        src,
        keywords
    };
}

function findImageSrc(imageId) {
    return gImages.find(img => imageId === img.id).src;
}

function editText(idx = gMeme.focusedTextIdx, key, value) {
    if (idx < 0) return;
    gMeme.texts[idx][key] = value;
}

function editSticker(idx = gMeme.focusedStickerIdx, key, value) {
    if (idx < 0) return;
    gMeme.stickers[idx][key] = value;
}

function deleteText() {
    if (gMeme.focusedTextIdx < 0) return;
    gMeme.texts.splice(gMeme.focusedTextIdx, 1);
    gMeme.focusedTextIdx = -1;
}
function deleteSticker() {
    if (gMeme.focusedStickerIdx < 0) return;
    gMeme.stickers.splice(gMeme.focusedStickerIdx, 1);
    gMeme.focusedStickerIdx = -1;
}

function changeFocus(idx, key = 'focusedTextIdx') {
    gMeme[key] = idx;

    if (key === 'focusedTextIdx' && idx >= 0) gMeme.focusedStickerIdx = -1;
    else if (key === 'focusedStickerIdx' && idx >= 0) gMeme.focusedTextIdx = -1;
}

function getMeme() {
    return gMeme;
}

function getImages(filter) {
    return (filter === null) ? gImages :
        gImages.filter(img => img.keywords.map(keys => keys.includes(filter)).some(val => val === true));
}

function setMeme(meme) {
    gMeme = meme;
}

function saveCanvas(canvas) {
    let memes = getFromStorage('memes');
    if (!memes) memes = [];
    memes.push({
        id: memes.length,
        meme: gMeme,
        preview: JSON.stringify(canvas.toDataURL())
    });
    saveToStorage('memes', memes);
}

function loadUploadedImage(ev) {
    var reader = new FileReader();
    reader.onload = function (event) {
        var img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            gMeme = createMeme(null);
            gMeme.uploadedImage = img.src;
            addTextToMeme();
        }
    }
    reader.readAsDataURL(ev.target.files[0]);
}