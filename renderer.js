// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var header = document.querySelector('#header');

header.onmousemove = function (e) {
    console.log(e.clientX,e.clientY)
}