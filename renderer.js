// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const windowsShortcuts = require('windows-shortcuts');
const electron = require('electron')
const remote = electron.remote
const mainWindow = remote.getCurrentWindow()

var header = document.querySelector('.header');
var main = document.querySelector('.main');

//拖动窗口 start
var x,y;

header.onmousedown = function (e) {
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

document.onmouseup = function () {
    x = undefined;
    y = undefined;
}
//拖动窗口 end


//拖放文件进列表 start

//阻止浏览器默认行。
document.addEventListener('drop', function (e) {
    e.preventDefault()
})
document.addEventListener('dragleave', function (e) {
    e.preventDefault()
})
document.addEventListener('dragenter', function (e) {
    e.preventDefault()
})
document.addEventListener('dragover', function (e) {
    e.preventDefault()
})
main.addEventListener('drop', onDropFiles)


function onDropFiles(e) {
    var fileList = e.dataTransfer.files

    for (var i = 0; i < fileList.length; i ++) {
        let file = fileList[i]
        let name = file.name
        let path = file.path

        windowsShortcuts.query(path, console.log)
    }
}
