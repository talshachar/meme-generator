'use strict';

function resizeCanvas(canvas, width, height, boundary = Math.min(width, height)) {
    const ratio = width / height;
    width = (ratio > 1) ? Math.min(boundary, width) : Math.min(boundary, height) * ratio;
    height = (ratio < 1) ? Math.min(boundary, height) : Math.min(boundary, width) / ratio;
    // Alert: changing the canvas dimensions may impair the current meme
    canvas.width = width;
    canvas.height = height
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

function downloadCanvas(canvas, title) {
    if (title === null) return;
    const data = canvas.toDataURL();
    const elLink = document.createElement('a');
    elLink.href = data;
    elLink.download = title;
    elLink.click();
}

function shareCanvas(ev) {
    ev.preventDefault();
    postCanvas(onSuccess);

    function onSuccess(loadedURL) {
        loadedURL = encodeURIComponent(loadedURL)
        const elShare = document.createElement('a');
        elShare.href = `https://www.facebook.com/sharer/sharer.php?u=${loadedURL}&t=${loadedURL}&t=${loadedURL}'); return false;`;
        elShare.click();
    }
}

function postCanvas(onSuccess) {
    const data = gElCanvas.toDataURL('image/jpeg');
    const elForm = document.createElement('form');
    elForm.setAttribute('method', "POST");
    elForm.setAttribute('enctype', "multipart/form-data");
    elForm.setAttribute('action', data);
    var formData = new FormData(elForm);
    formData.action
    fetch('http://ca-upload.com/here/upload.php', {
        method: 'POST',
        body: formData
    })
        .then(function (res) {
            return res.text()
        })
        .then(onSuccess)
        .catch(function (err) {
            console.error(err)
        })
}