// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const electron = require('electron')
const remote = electron.remote
const mainWindow = remote.getCurrentWindow()

//拖动窗口 start
var header = document.querySelector('.header');
var x,y;

header.onmousedown = function (e) {
    console.log('start',e.clientX,e.clientY)
    x = e.clientX
    y = e.clientY
}

header.onmousemove = function (e) {

    if (x && y) {
        var p = mainWindow.getPosition()
        var moveX = p[0] + e.clientX - x,
            moveY = p[1] + e.clientY - y
        mainWindow.setPosition(moveX, moveY)
    }
}

header.onmouseup = function () {
    x = undefined;
    y = undefined;
}
//拖动窗口 end


