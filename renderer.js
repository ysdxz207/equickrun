// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const fs = require('fs')
const filter = require('lodash.filter')
const path = require('path')
const url = require('url')
const childProcess = require('child_process')
const windowsShortcuts = require('windows-shortcuts')
let EIconExtractor = require('./app/utils/icon-extractor/EIconExtractor')
const electron = require('electron')
const remote = electron.remote
const dialog = remote.dialog
const BrowserWindow = remote.BrowserWindow
const mainWindow = remote.getCurrentWindow()
const ConfigUtils = require('./app/js/ConfigUtils')

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
 * 右键头部隐藏窗口 start
 */

header.addEventListener('mousedown', function (e) {
    if (e.button === 2) {
        mainWindow.hide()
    }
})

/*
 * 右键头部隐藏窗口 end
 */

/*
 * 拖放文件进列表 start
 */

//阻止浏览器默认行为
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
document.addEventListener('keydown', function (e) {
    let selected = mainul.querySelector('li.selected')
    let liList = mainul.querySelectorAll('li')

    let index = selected == null ? -1 : [].indexOf.call(liList, selected)

    switch (e.which) {
        case 38:
            //屏蔽上向键
            e.preventDefault()

            if (index === 0) {
                index = liList.length
            }
            setSelected(index - 1)
            break

        case 40:
            //屏蔽下方向键
            e.preventDefault()
            if (index === liList.length - 1) {
                index = -1
            }
            setSelected(index + 1)
            break

        //ESC
        case 27:
            setSelected(-1)
            break

        //回车
        case 13:
            //空格
        case 32:
            e.preventDefault()
            if (index > -1 && index < liList.length) {
                let eshortcut = ConfigUtils.getEshortcut(selected.getAttribute('id'))
                run(eshortcut)
            }
            break
    }
})
document.addEventListener('drop', onDropFiles)


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

            //window-shortcut无法获取到icon，使用工具获取

            EIconExtractor.getIcon(name, path, function (data) {
                let icon = data.Base64ImageData
                if (icon) {
                    eshortcut.icon = 'data:image/png;base64,' + icon
                }
                list.push(eshortcut)
                //显示在列表中
                appendToMainList(eshortcut)

                //保存到配置
                ConfigUtils.saveToConfig(eshortcut)
            })
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
        let liEle = document.createElement('li')
        let span = document.createElement('span')
        span.innerHTML = eshortcut.name
        if (eshortcut.icon) {
            let imgEle = document.createElement('img')
            imgEle.setAttribute('src', eshortcut.icon)
            liEle.setAttribute('id', eshortcut.id)
            liEle.appendChild(imgEle)
        }
        liEle.appendChild(span)

        liEle.addEventListener('mousedown', function (e) {
            if (e.button === 0) {
                run(eshortcut)
            } else if (e.button === 2){
                showEditDialog(eshortcut)
            }
        })


        if (!fs.existsSync(eshortcut.path)) {
            liEle.classList.add('path-not-exits')
        } else if (!fs.existsSync(eshortcut.target)) {
            liEle.classList.add('target-not-exits')
        }
        mainul.appendChild(liEle)
    }
}


function checkEShortcutExists(name) {
    let result = filter(equickrunConfig.eshortcuts, x => x.name === name)
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
    if (eshortcut == null) {
        dialog.showErrorBox('错误', '运行异常：传入的快捷方式为空!')
        return
    }
    //关闭窗口
    mainWindow.hide()
    let path = eshortcut.path
    if (!fs.existsSync(path)) {
        path = eshortcut.target
    }
    path = eshortcut.args ? path + ' ' + eshortcut.args : path
    childProcess.exec('start ' + path, function(err, data) {
        if(err){
            dialog.showErrorBox('错误', '运行[' + eshortcut.name + ']失败了：' + err)
            return
        }
        // console.log(data.toString())
    })
}

/*
 * 运行 end
 */


/*
 * 右键编辑 start
 */
document.addEventListener('mouseup', function (e) {

    if (e.button === 2) {
        showEditDialog(null)
    }
})
function showEditDialog(eshortcut) {
    let editWindow = new BrowserWindow({
        id: 'window_edit_eshortcut',
        parent: mainWindow,
        modal: true,
        resizable: false,
        width: 562,
        height: 272,
        // width: 900,
        // height: 600,
        webPreferences: {

            devTools: false
        }
    })

    editWindow.setMenu(null)

    editWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/app/edit.html'),
        protocol: 'file:',
        slashes: true
    }))



    editWindow.webContents.on('did-finish-load', () => {
        editWindow.webContents.send('eshortcut', eshortcut)
    })
    editWindow.show()

    editWindow.webContents.openDevTools()
}
/*
 * 右键编辑 end
 */

function setSelected(index) {
    let selectedList = mainul.querySelectorAll('li')

    for (let i = 0; i < selectedList.length; i ++) {
        selectedList[i].classList.remove('selected')
    }
    if (index != -1) {
        selectedList[index].classList.add('selected')
    }
}
/*
 * 方向键选择 end
 */