// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const fs = require('fs');
const filter = require('lodash.filter');
const path = require('path')
const childProcess = require('child_process');
const windowsShortcuts = require('windows-shortcuts')
const electron = require('electron')
const remote = electron.remote
const dialog = remote.dialog
const mainWindow = remote.getCurrentWindow()

let header = document.querySelector('.header')
let main = document.querySelector('.main')
var mainul = document.querySelector('.main ul')

const CONFIG_PATH = path.join(__dirname, '/app/conf/config.json')

/*
 * 配置 start
 */
let equickrunConfig = JSON.parse(fs.readFileSync(CONFIG_PATH).toString())

appendToMainList(equickrunConfig.eshortcuts)

/*
 * 配置 end
 */


/*
 * 拖动窗口 start
 */
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
    x = undefined
    y = undefined
}
/*
 * 拖动窗口 end
 */


/*
 * 拖放文件进列表 start
 */

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

        //检查是否已存在
        if (checkEShortcutExists(name)) {

            return
        }

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
            //显示在列表中
            appendToMainList(eshortcut)

            //保存到配置
            saveToConfig(eshortcut)
        })
    }
}

function appendToMainList(eshortcutList) {

    if (!(eshortcutList instanceof Array)) {
        let tmp = new Array()
        tmp.push(eshortcutList)
        eshortcutList = tmp
    }

    for (let i = 0; i < eshortcutList.length; i ++) {
        let eshortcut = eshortcutList[i]
        let li = document.createElement('li')
        li.setAttribute('id', eshortcut.id)
        li.innerHTML = eshortcut.name

        li.addEventListener('click', function (e) {
            run(eshortcut)
        })

        mainul.appendChild(li)
    }
}

function saveToConfig(eshortcut) {
    if (!eshortcut) {
        return
    }

    let eshortcutList = equickrunConfig.eshortcuts
    eshortcutList.push(eshortcut)
    equickrunConfig.eshortcuts = eshortcutList
    fs.writeFile(CONFIG_PATH, JSON.stringify(equickrunConfig, undefined, 4), {}, function (err) {
        if (err) {
            dialog.showErrorBox('错误', '保存配置失败')
        } else {

            /*dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: '提示',
                message: '保存配置成功',
                buttons: ['确定', '取消']
            }, function (btnIndex) {
                console.log(btnIndex)
            })*/
        }
    })
}

function checkEShortcutExists(name) {
    let result = filter(equickrunConfig.eshortcuts, x => x.name === name);
    if (result.length > 0) {
        return true
    }
    return false
}

/*
 * 拖放文件进列表 end
 */


/*
 * 运行 start
 */
function run(eshortcut) {
    childProcess.exec('start ' + eshortcut.path, function(err, data) {
        if(err){
            dialog.showErrorBox('错误', '运行[' + eshortcut.name + ']失败了：' + err)
            return;
        }
        // console.log(data.toString());
    })
}

/*
 * 运行 end
 */


/*
 * 右键编辑 start
 */


/*
 * 右键编辑 end
 */