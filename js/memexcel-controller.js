'use strict';
// Split file to gallery-controller.js and canvas-controller.js.

var gElCanvas, gCtx;

function initCanvas(imageId = 19) {
    gElCanvas = document.querySelector('canvas');
    gCtx = gElCanvas.getContext('2d');

    selectImage(imageId);
    drawCanvas();
}

function drawCanvas() {
    const meme = getMeme();
    const elImage = new Image();
    elImage.src = `assets/memes/${meme.imageId}.jpg`;
    elImage.onload = () => {

        const elContainer = document.querySelector('.canvas-container');
        const boundary = Math.min(elContainer.offsetWidth, elContainer.offsetHeight);
        resizeCanvas(gElCanvas, elImage.width, elImage.height, boundary);

        gCtx.drawImage(elImage, 0, 0, gElCanvas.width, gElCanvas.height);

        drawTexts(meme.texts);
        if (meme.focusedTextIdx !== null) drawFocus(meme.texts[meme.focusedTextIdx]);
    }
}

function drawTexts(texts) {
    texts.forEach((txt, idx) => {
        gCtx.font = `${txt.size}px impact, sans-serif`;
        gCtx.lineWidth = 2;
        gCtx.strokeStyle = txt.outlineeColor;
        gCtx.fillStyle = txt.color;
        gCtx.textAlign = txt.align;
        gCtx.fillText(txt.txt, gElCanvas.width / 2, (idx + 1) * (txt.size + 10));
        gCtx.strokeText(txt.txt, gElCanvas.width / 2, (idx + 1) * (txt.size + 10));;

        editText(idx, 'pos', { x: gElCanvas.width / 2, y: (idx + 1) * (txt.size + 10) });
        editText(idx, 'width', gCtx.measureText(txt.txt).width);
    });
}

function drawFocus(txt) {
    gCtx.lineWidth = 1;
    gCtx.shadowBlur = 1;
    gCtx.shadowColor = 'black';
    gCtx.strokeStyle = 'white';
    gCtx.shadowOffsetX = 2;
    gCtx.shadowOffsetY = 2;

    const posX = (txt.align === 'left') ? txt.pos.x :
        (txt.align === 'center') ? txt.pos.x - txt.width / 2 :
            txt.pos.x - txt.width;

    gCtx.setLineDash([6, 3]);
    gCtx.strokeRect(posX - 5, txt.pos.y - txt.size - 3, txt.width + 10, txt.size + 10);
}

function onAddText() {
    addText();
    drawCanvas();
}

function onDeleteText() {
    deleteText();
    drawCanvas();
}

function onTextEdit(key, value) {
    switch (key) {
        case 'txt':
            value = document.querySelector('input[name="text-editor"]').value;
            break;
    }
    editText(undefined, key, value);
    drawCanvas();
}

// function initGallery() {
//     createImages();
//     renderGallery();
// }