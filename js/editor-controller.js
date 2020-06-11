'use strict';
// - Add actions to setTextController()
// - Replace edits of incrementive attributes with fixed value (set initial value
// to controller element from setTextController and remove switch from editText())
// - Replace drag() calling event to Hammer.JS (pan)
// - Replace download prompt with modal and clear marks on meme before downloading

var gElCanvas, gCtx, gDrag;
const DELETE_MARK = '❌';

function initCanvas(imageId = 19) {
    gElCanvas = document.querySelector('canvas');
    gCtx = gElCanvas.getContext('2d');
    gDrag = { diffX: null, diffY: null };

    setMemeImage(imageId);
    drawCanvas();
}

function drawCanvas(toDownload = false) {
    const meme = getMeme();
    const elImage = new Image();
    elImage.src = `assets/memes/${meme.imageId}.jpg`;
    elImage.onload = () => {
        const elContainer = document.querySelector('.canvas-container');
        const boundary = Math.min(elContainer.offsetWidth, elContainer.offsetHeight);
        resizeCanvas(gElCanvas, elImage.width, elImage.height, boundary - 30); // Decrease added spacers of canvas from boundry (elimination preferable)

        gCtx.drawImage(elImage, 0, 0, gElCanvas.width, gElCanvas.height);

        drawTexts(meme.texts);

        if (meme.focusedTextIdx >= 0 && !toDownload) {
            drawFocus(meme.texts[meme.focusedTextIdx]);
            drawDeleteMark(meme.texts[meme.focusedTextIdx]);
        }
    }
}

function drawTexts(texts) {
    texts.forEach((text, idx) => {
        gCtx.font = `${text.size}px impact, sans-serif`;
        gCtx.lineWidth = 1.5;
        gCtx.strokeStyle = text.outlineColor;
        gCtx.fillStyle = text.color;
        gCtx.textAlign = text.align;
        if (!text.pos) {
            editText(idx, 'pos', {
                startX: gElCanvas.width / 2,
                startY: (idx + 1) * (text.size + 10)
            });
        }
        gCtx.fillText(text.txt, text.pos.startX, text.pos.startY);
        gCtx.strokeText(text.txt, text.pos.startX, text.pos.startY);;

        editText(idx, 'width', gCtx.measureText(text.txt).width);
    });
}

function drawFocus(text) {
    gCtx.fillStyle = '#00000025';
    gCtx.lineWidth = 2;
    gCtx.strokeStyle = 'red';
    gCtx.lineCap = 'round';
    gCtx.setLineDash([6, 9]);

    const alignedX = getLRCStartX(text);

    gCtx.strokeRect(alignedX - 5, text.pos.startY + 6, text.width + 10, -text.size - 6);
    gCtx.fillRect(alignedX - 6, text.pos.startY + 7, text.width + 12, -text.size - 8);

    setTextControllers(text);
}

function setTextControllers(text) {
    const textEditor = document.querySelector('input[name="text-editor"]');
    textEditor.value = (text.txt !== 'Tap to edit text') ? text.txt : '';
    textEditor.focus();
}

function drawDeleteMark(text) {
    gCtx.fillStyle = 'red';
    gCtx.font = `16px impact, sans-serif`;
    gCtx.textAlign = 'left';

    const alignedX = getLRCStartX(text);

    const deleteDimensions = {
        startX: alignedX + text.width - 4,
        startY: text.pos.startY - text.size + 4,
        endX: alignedX + text.width + gCtx.measureText(DELETE_MARK).width - 4,
        endY: text.pos.startY - text.size - parseInt(gCtx.font) + 4
    }
    editText(undefined, 'deleteDimensions', deleteDimensions);

    gCtx.fillText(DELETE_MARK, deleteDimensions.startX, deleteDimensions.startY);
}

function onCanvasHover(ev) {
    const { offsetX: cursorX, offsetY: cursorY } = ev;
    var meme = getMeme();

    if (isHoveringDelete(cursorX, cursorY, meme)) document.body.style.cursor = 'pointer';
    else if (getHoveredTextIdx(cursorX, cursorY, meme) >= 0) document.body.style.cursor = 'move'; // 'grab';
    else document.body.style.cursor = 'initial';
}

function onCanvasMouseDown(ev) {
    const { offsetX: cursorX, offsetY: cursorY } = ev;
    var meme = getMeme();

    if (isHoveringDelete(cursorX, cursorY, meme)) deleteText();

    var focusedTextIdx = getHoveredTextIdx(cursorX, cursorY, meme);
    changeFocus(focusedTextIdx);

    if (focusedTextIdx >= 0) startDrag(cursorX, cursorY, meme);

    drawCanvas();
}


function startDrag(cursorX, cursorY, meme) {
    const focusedText = meme.texts[meme.focusedTextIdx];

    gDrag.diffX = cursorX - focusedText.pos.startX;
    gDrag.diffY = cursorY - focusedText.pos.startY;

    gElCanvas.addEventListener('mousemove', drag);
    gElCanvas.addEventListener('mouseup', stopDrag);
}

function drag(ev) {
    const { offsetX: cursorX, offsetY: cursorY } = ev;
    editText(undefined, 'pos', { startX: cursorX - gDrag.diffX, startY: cursorY - gDrag.diffY });
    drawCanvas();
    // document.body.style.cursor = 'grabbing';
}

function stopDrag() {
    gElCanvas.removeEventListener('mousemove', drag);
    gElCanvas.removeEventListener('mouseup', stopDrag);
}


function isHoveringDelete(cursorX, cursorY, meme) {
    if (meme.focusedTextIdx >= 0) {
        const dimensions = meme.texts[meme.focusedTextIdx].deleteDimensions;
        return (isInDimensions(cursorX, cursorY, dimensions));
    }
}

function getHoveredTextIdx(cursorX, cursorY, meme) {
    var clickedTextIdx = meme.texts.findIndex(text => {
        const dimensions = getTextDimensions(text);
        return (isInDimensions(cursorX, cursorY, dimensions));
    });
    return clickedTextIdx;
}

function onAddText() {
    addText();
    drawCanvas();
}

function onTextEdit(key, value) {
    editText(undefined, key, value);
    drawCanvas();
}

function onDeleteText() {
    deleteText();
    drawCanvas();
}

function onDownload(elLink) {
    drawCanvas(true);
    downloadCanvas(elLink, gElCanvas);
    elLink.download = prompt('Enter title');
}