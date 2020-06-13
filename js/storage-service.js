'use strict';

function getFromStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

function saveToStorage(key, val) {
    localStorage[key] = JSON.stringify(val);
}

function removeFromStorage(key) {
    localStorage.removeItem(key);
}