// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


// 载入配置文件
let equickrunConfig = require('./app/conf/config');



//配置 end


const windowsShortcuts = require('windows-shortcuts');
const electron = require('electron')
const remote = electron.remote
const mainWindow = remote.getCurrentWindow()

let header = document.querySelector('.header');
let main = document.querySelector('.main');
let mainul = document.querySelector('.main ul');

//拖动窗口 start
let x = undefined,
    y = undefined

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
    let fileList = e.dataTransfer.files

    let list = []

    for (var i = 0; i < fileList.length; i++) {
        let eshortcut = {}
        let file = fileList[i]
        let name = file.name
        let path = file.path

        eshortcut.id = process.hrtime().join('')

        windowsShortcuts.query(path, function (a, o) {
            let args = o.args
            let desc = o.desc
            let hotkey = o.hotkey
            let icon = o.icon
            let target = o.target
            let workingDir = o.workingDir

            eshortcut.name = name
            eshortcut.path = path
            eshortcut.target = target
            eshortcut.icon = icon
            eshortcut.args = args
            eshortcut.hotkey = hotkey
            eshortcut.workingDir = workingDir
            eshortcut.desc = desc
            list.push(eshortcut)
            //添加到列表中
            appendToMainList(eshortcut)
        })
    }
}

function appendToMainList(eshortcut) {
    let li = document.createElement('li')
    li.setAttribute('id', eshortcut.id)
    li.innerHTML = eshortcut.name
    mainul.appendChild(li)

    //保存到配置

}


