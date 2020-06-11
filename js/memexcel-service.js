'use strict';

var gImages;
var gKeywords = {
    'donald trump': 10, 'famous': 5, 'dogs': 0, 'cute': 0, 'baby babies': 0, 'cats': 0,
    'success': 0, 'kids': 0, 'alliens': 0, 'surprised': 0, 'sarcasm': 0, 'evil': 0,
    'funny': 0, 'laughing': 0, 'barak obama': 0, 'nba': 0, 'basketball': 0, 'shame': 0,
    'leonardo dicaprio': 0, 'awesome': 0, 'matrix': 0, 'what if i told you': 0,
    'one does not simply': 0, 'lord of the rings': 0, 'star trek': 0, 'vladimir putin': 0,
    'buzz lightyear': 0, 'everywhere': 0, 'woman in a field of flowers': 0,
    'look at all the': 0, 'spongebob': 0, 'evolution': 0
};
var gMeme = {
    imageId: null,
    focusedTextIdx: 0,
    texts: [{
        txt: 'Tap to edit text',
        size: 28,
        align: 'center',
        color: 'white',
        outlineSize: '2',
        outlineColor: 'black',
        width: null,
        pos: null,
        deleteDimensions: null
    }]
};

function createImages() {
    const keywordsSet = [
        ['donald trump', 'famous'], ['dogs', 'cute'], ['dogs', 'baby babies', 'cute'], ['cats', 'cute'],
        ['success', 'kids'], ['alliens'], ['baby babies', 'cute', 'surprised'], ['sarcasm'],
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

function addText() {
    gMeme.texts[gMeme.texts.length] = {
        txt: 'Tap to edit text',
        size: 28,
        align: 'center',
        color: 'white',
        outlineSize: '2',
        outlineColor: 'black',
        width: null,
        pos: null,
        deleteDimensions: null
    };
    gMeme.focusedTextIdx = gMeme.texts.length - 1;
}

function editText(idx = gMeme.focusedTextIdx, key, value) {
    if (idx < 0) return;
    switch (key) {
        case 'size': case 'outlineSize':
            gMeme.texts[idx][key] += value;
            break;
        default:
            gMeme.texts[idx][key] = value;
    }
}

function deleteText() {
    if (gMeme.focusedTextIdx < 0) return;
    gMeme.texts.splice(gMeme.focusedTextIdx, 1);
    gMeme.focusedTextIdx = -1;
}

function changeFocus(textIdx) {
    gMeme.focusedTextIdx = textIdx;
}

function getMeme() {
    return gMeme;
}

function getImages() {
    return gImages;
}

function setMemeImage(id) {
    gMeme.imageId = id;
}