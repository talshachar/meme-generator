'use strict';

function resizeCanvas(canvas, width, height, boundary = Math.min(width, height)) {
    const ratio = width / height;
    width = (ratio > 1) ? Math.min(boundary, width) : Math.min(boundary, height) * ratio;
    height = (ratio < 1) ? Math.min(boundary, height)  : Math.min(boundary, width) / ratio;
    // Alert: changing the canvas dimensions may impair the current meme
    canvas.width = width;
    canvas.height = height
}

function downloadCanvas(elLink, canvas) {
    const data = canvas.toDataURL();
    elLink.href = data;
}

function getLRCStartX(text, key = 'pos') {
    return (text.align === 'left') ? text[key].startX :
        (text.align === 'center') ? text[key].startX - text.width / 2 :
            text[key].startX - text.width;
}

function getTextDimensions(text) {
    const startX = getLRCStartX(text);
    const startY = text.pos.startY;
    const endX = startX + text.width;
    const endY = startY - text.size;

    return { startX, startY, endX, endY };
}

function isInDimensions(cursorX, cursorY, dimensions) {
    return (cursorX >= dimensions.startX && cursorX <= dimensions.endX &&
        cursorY <= dimensions.startY && cursorY >= dimensions.endY);
}