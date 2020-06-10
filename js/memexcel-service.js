'use strict';

var gKeywords = { 'dank': 12, 'spongebob': 4, 'sarcasm': 1 }
var gImages = [
    { id: 19, url: 'assets/memes/19.jpg', keywords: ['sarcasm'] },
    { id: 20, url: 'assets/memes/20.jpg', keywords: ['spongebob'] },
];
var gMeme = {
    imageId: null,
    focusedTextIdx: 0,
    texts: [{
        txt: 'Tap to edit text',
        size: 28,
        align: 'center',
        color: 'white',
        outlineSize: '2',
        outlineColor: 'black'
    }]
};

function addText() {
    gMeme.texts[gMeme.texts.length] = {
        txt: 'Tap to edit text',
        size: 28,
        align: 'center',
        color: 'white',
        outlineSize: '2',
        outlineColor: 'black'
    };
    gMeme.focusedTextIdx = gMeme.texts.length - 1;
}

function editText(idx = gMeme.focusedTextIdx, key, value) {
    gMeme.texts[idx][key] = value;
}

function deleteText() {
    if (gMeme.focusedTextIdx === null) return;
    gMeme.texts.splice(gMeme.focusedTextIdx, 1);
    gMeme.focusedTextIdx = null;
}

function getImages() {
    return gImages;
}

function getMeme() {
    return gMeme;
}

function selectImage(id) {
    gMeme.imageId = id;
}