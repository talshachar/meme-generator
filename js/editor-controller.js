'use strict';
// - Add actions to setTextController()
// - Replace edits of incrementive attributes with fixed value (set initial value
// to controller element from setTextController and remove switch from editText())
// - Replace drag() calling event to Hammer.JS (pan)
// - Replace download prompt with modal and clear marks on meme before downloading
// - load eventHandlers from initCanvas() instead from html
// - Merge text and sticker duplicated functions (edit, delete)

var gElCanvas, gCtx, gDrag, gCurrStickersPage;
const DELETE_MARK = '❌';

function initCanvas() {
    gElCanvas = document.querySelector('canvas');
    gCtx = gElCanvas.getContext('2d');
    gDrag = { diffX: null, diffY: null };
    gCurrStickersPage = 0;

    renderStickersBank();

    const meme = getMeme();
    const elImage = new Image();
    if (meme.imageId === null) elImage.src = meme.uploadedImage;
    else elImage.src = findImageSrc(meme.imageId);

    elImage.onload = () => {
        const elContainer = document.querySelector('.canvas-container');
        const boundary = Math.min(elContainer.offsetWidth, elContainer.offsetHeight);
        resizeCanvas(gElCanvas, elImage.width, elImage.height, boundary - 30); // Decrease added spacers of canvas from boundry (elimination preferable)
        drawCanvas();
    }

    setTimeout(() => {
        gElCanvas.addEventListener('mousemove', () => onCanvasHover(event));
        gElCanvas.addEventListener('mousedown', () => onCanvasMouseDown(event));
        gElCanvas.addEventListener('wheel', () => onCanvasWheel(event));
    }, 0);
}

function drawCanvas(toExport = false) {
    const meme = getMeme();
    const elImage = new Image();
    if (meme.imageId === null) elImage.src = meme.uploadedImage;
    else elImage.src = findImageSrc(meme.imageId);
    elImage.onload = () => {
        gCtx.drawImage(elImage, 0, 0, gElCanvas.width, gElCanvas.height);
        drawTexts(meme.texts);
        drawStickers(meme.stickers);

        gCtx.save();
        if (meme.focusedTextIdx >= 0 && !toExport) {
            drawFocus(meme.texts[meme.focusedTextIdx]);
            drawDeleteMark(meme.texts[meme.focusedTextIdx]);
        } else if (meme.focusedStickerIdx >= 0 && !toExport) {
            drawFocus(undefined, meme.stickers[meme.focusedStickerIdx]);
            drawDeleteMark(undefined, meme.stickers[meme.focusedStickerIdx]);
        }
        gCtx.restore();
    }
}

function drawTexts(texts) {
    texts.forEach((text, idx) => {
        gCtx.font = `${text.size}px ${text.font}`;
        gCtx.lineWidth = text.size / 10;
        gCtx.strokeStyle = text.outlineColor;
        gCtx.fillStyle = text.color;
        gCtx.textAlign = text.align;
        if (!text.pos) {
            editText(idx, 'pos', {
                startX: gElCanvas.width / 2,
                startY: (idx + 1) * (text.size + 10)
            });
        }
        if (text.outline) gCtx.strokeText(text.txt, text.pos.startX, text.pos.startY);
        gCtx.fillText(text.txt, text.pos.startX, text.pos.startY);

        editText(idx, 'width', gCtx.measureText(text.txt).width);
    });
}

function drawStickers(stickers) {
    stickers.forEach(sticker => {
        const elImage = new Image();
        elImage.src = sticker.src;
        elImage.onload = gCtx.drawImage(elImage, sticker.pos.startX, sticker.pos.startY, sticker.size, sticker.size);
    });
}

function drawFocus(text, sticker) {
    gCtx.lineWidth = 2;
    gCtx.strokeStyle = 'red';
    gCtx.lineCap = 'round';
    gCtx.fillStyle = '#00000025';
    gCtx.setLineDash([6, 9]);

    if (text) {
        const alignedX = getLRCStartX(text);
        gCtx.strokeRect(alignedX - 5, text.pos.startY + 6, text.width + 10, -text.size - 6);
        gCtx.fillRect(alignedX - 6, text.pos.startY + 7, text.width + 12, -text.size - 8);

        setEditorControllers(text);
    } else {
        gCtx.strokeRect(sticker.pos.startX, sticker.pos.startY, sticker.size, sticker.size);
        gCtx.fillRect(sticker.pos.startX, sticker.pos.startY, sticker.size, sticker.size);

        setEditorControllers(undefined, sticker);
    }
}

function drawDeleteMark(text, sticker) {
    gCtx.fillStyle = 'red';
    gCtx.font = `16px impact, sans-serif`;
    gCtx.textAlign = 'left';

    if (text) {
        const alignedX = getLRCStartX(text);
        var deleteDimensions = {
            startX: alignedX + text.width - 4,
            startY: text.pos.startY - text.size + 4,
            endX: alignedX + text.width + gCtx.measureText(DELETE_MARK).width - 4,
            endY: text.pos.startY - text.size - parseInt(gCtx.font) + 4
        }
        editText(undefined, 'deleteDimensions', deleteDimensions);
    } else {
        var deleteDimensions = {
            startX: sticker.pos.startX + sticker.size - 10,
            startY: sticker.pos.startY + 4,
            endX: sticker.pos.startX + sticker.size + gCtx.measureText(DELETE_MARK).width - 10,
            endY: sticker.pos.startY - parseInt(gCtx.font) + 4
        }
        editSticker(undefined, 'deleteDimensions', deleteDimensions);
    }
    gCtx.fillText(DELETE_MARK, deleteDimensions.startX, deleteDimensions.startY);
}

function onCanvasHover(ev) {
    const { offsetX: cursorX, offsetY: cursorY } = ev;
    var meme = getMeme();

    const hoveredTextIdx = getHoveredTextIdx(cursorX, cursorY, meme)
    const hoveredStickerIdx = getHoveredStickerIdx(cursorX, cursorY, meme)
    if (hoveredTextIdx >= 0) {
        gElCanvas.style.cursor = (hoveredTextIdx === meme.focusedTextIdx) ? 'move' : 'text';
    } else if (hoveredStickerIdx >= 0) {
        gElCanvas.style.cursor = 'move';
    } else if (isHoveringDelete(cursorX, cursorY, meme)) gElCanvas.style.cursor = 'pointer';
    else gElCanvas.style.cursor = 'initial';
}

function onCanvasMouseDown(ev) {
    const { offsetX: cursorX, offsetY: cursorY } = ev;
    var meme = getMeme();

    if (isHoveringDelete(cursorX, cursorY, meme)) {
        deleteText();
        deleteSticker();
    }

    var hoveredTextIdx = getHoveredTextIdx(cursorX, cursorY, meme);
    changeFocus(hoveredTextIdx);
    var hoveredStickerIdx = getHoveredStickerIdx(cursorX, cursorY, meme);
    changeFocus(hoveredStickerIdx, 'focusedStickerIdx');

    if (hoveredTextIdx >= 0 || hoveredStickerIdx >= 0) startDrag(cursorX, cursorY, meme);

    drawCanvas();
}

function onCanvasWheel(ev) {
    const elFontSize = document.querySelector('input[name="font-size"');
    if (elFontSize.disabled) return;
    elFontSize.value = (ev.deltaY < 0 && elFontSize.value < elFontSize.max) ? +elFontSize.value + 2 :
        (ev.deltaY > 0 && elFontSize.value > elFontSize.min) ? +elFontSize.value - 2 : elFontSize.value;

    onTextEdit('size', +elFontSize.value);
    onStickerEdit('size', +elFontSize.value);
}


function startDrag(cursorX, cursorY, meme) {
    var focused = (meme.focusedTextIdx >= 0) ? meme.texts[meme.focusedTextIdx] :
        meme.stickers[meme.focusedStickerIdx];

    gDrag.diffX = cursorX - focused.pos.startX;
    gDrag.diffY = cursorY - focused.pos.startY;

    gElCanvas.addEventListener('mousemove', drag);
    gElCanvas.addEventListener('mouseup', stopDrag);
}

function drag(ev) {
    const { offsetX: cursorX, offsetY: cursorY } = ev;

    editText(undefined, 'pos', { startX: cursorX - gDrag.diffX, startY: cursorY - gDrag.diffY });
    editSticker(undefined, 'pos', { startX: cursorX - gDrag.diffX, startY: cursorY - gDrag.diffY });
    drawCanvas();
}

function stopDrag() {
    gElCanvas.removeEventListener('mousemove', drag);
    gElCanvas.removeEventListener('mouseup', stopDrag);
}


function isHoveringDelete(cursorX, cursorY, meme) {
    if (meme.focusedTextIdx >= 0) {
        const dimensions = meme.texts[meme.focusedTextIdx].deleteDimensions;
        return (isInDimensions(cursorX, cursorY, dimensions));
    } else if (meme.focusedStickerIdx >= 0) {
        const dimensions = meme.stickers[meme.focusedStickerIdx].deleteDimensions;
        return (isInDimensions(cursorX, cursorY, dimensions));
    }
}

function getHoveredTextIdx(cursorX, cursorY, meme) {
    var hoveredTextIdx = meme.texts.findIndex(text => {
        const dimensions = getTextDimensions(text);
        return (isInDimensions(cursorX, cursorY, dimensions));
    });
    return hoveredTextIdx;
}

function getHoveredStickerIdx(cursorX, cursorY, meme) {
    var hoveredStickerIdx = meme.stickers.findIndex(sticker => {
        const dimensions = {
            startX: sticker.pos.startX, startY: sticker.pos.startY,
            endX: sticker.pos.startX + sticker.size, endY: sticker.pos.startY + sticker.size
        };

        return (cursorX >= dimensions.startX && cursorX <= dimensions.endX &&
            cursorY >= dimensions.startY && cursorY <= dimensions.endY);
    });
    return hoveredStickerIdx;
}

function onAddText() {
    addTextToMeme();
    drawCanvas();
}

function onAddSticker(elSticker) {
    addStickerToMeme(elSticker.src);
    drawCanvas();
}

function onTextEdit(key, value) {
    editText(undefined, key, value);
    drawCanvas();

}
function onStickerEdit(key, value) {
    editSticker(undefined, key, value);
    drawCanvas();
}

function onDownload(elLink) {
    drawCanvas(true);
    setTimeout(function () {
        var title = prompt('Enter title');
        downloadCanvas(gElCanvas, title);
        drawCanvas();
    }, 100);
}

function onSave() {
    drawCanvas(true);
    setTimeout(function () {
        saveCanvas(gElCanvas);
        drawCanvas();
    }, 100);
}

function setEditorControllers(text, sticker) {
    var elTextEditor = document.querySelector('input[name="text-editor"]');
    var elFontSize = document.querySelector('input[name="font-size"]');
    if (text) {
        elTextEditor.disabled = false;
        elTextEditor.value = (text.txt !== 'Tap to edit text') ? text.txt : '';
        elTextEditor.focus(); // Impairing mobile useability

        elFontSize.disabled = false;
        elFontSize.value = text.size;
        elFontSize.attributes.oninput.nodeValue = `onTextEdit('size', +this.value)`;

        var elFontFamily = document.querySelector(`select[name="text-font"]`);
        elFontFamily.disabled = false;
        elFontFamily.querySelector(`option[value="${text.font}"]`).selected = true;

        var elTextColor = document.querySelector(`input[name="text-color"]`);
        elTextColor.disabled = false;
        elTextColor.value = text.color;

        var elTextOutline = document.querySelector(`button[name="text-outline"]`);
        elTextOutline.disabled = false;
        elTextOutline.value = text.outline;
    } else {
        elTextEditor.disabled = true;

        elFontSize.disabled = false;
        elFontSize.value = sticker.size;
        elFontSize.attributes.oninput.nodeValue = `onStickerEdit('size', +this.value)`;
    }
}

const gStickersBank = ['assets/stickers/cigar.svg', 'assets/stickers/ok.svg',
    'assets/stickers/sunglasses.svg', 'assets/stickers/tear.svg',
    'assets/stickers/wrong.svg', 'assets/stickers/check.svg',
    'assets/stickers/monocle.svg', 'assets/stickers/hd.svg'];

function renderStickersBank() {
    const stickers = getStickersToShow();
    const strHTML = stickers.map(sticker => {
        return `<img onclick="onAddSticker(this)" src="${sticker}" class="sticker">`;
    }).join(' ');

    document.querySelector('.stickers').innerHTML = strHTML;
}

function getStickersToShow() {
    const stickersPageSize = 4;

    var stickersToShow = [];
    for (var i = gCurrStickersPage; i < gCurrStickersPage + stickersPageSize; i++) {
        stickersToShow.push((i < gStickersBank.length) ? gStickersBank[i] : gStickersBank[i - gStickersBank.length]);
    }

    return stickersToShow;
}

function onStickersNext() {
    gCurrStickersPage++;
    if (gCurrStickersPage >= gStickersBank.length) gCurrStickersPage -= gStickersBank.length;
    renderStickersBank();
}

function onStickersPrev() {
    gCurrStickersPage--;
    if (gCurrStickersPage < 0) gCurrStickersPage += gStickersBank.length;
    renderStickersBank();
}