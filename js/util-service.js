'use strict';

function resizeCanvas(canvas, width, height, max = Math.max(width, height)) {
    const ratio = width / height;
    width = (ratio > 1) ? max : max * ratio;
    height = (ratio < 1) ? max : max / ratio;
    // Alert: changing the canvas dimension clears the canvas!
    canvas.width = width;
    canvas.height = height;
}

function downloadCanvas(elLink) {
    const data = gElCanvas.toDataURL();
    elLink.href = data;
    // elLink.download = '';
}