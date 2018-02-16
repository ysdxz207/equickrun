

const electron = require('electron')
const fs = require('fs')
const remote = electron.remote
const dialog = remote.dialog

let editWindow = remote.getCurrentWindow()
let mainWindow = editWindow.getParentWindow()
const ConfigUtils = require('./ConfigUtils')

let editMain = document.querySelector('.edit')
let nameObj = editMain.querySelector('input[name=name]')
let pathObj = editMain.querySelector('input[name=path]')
let targetObj = editMain.querySelector('input[name=target]')
let argsObj = editMain.querySelector('input[name=args]')
let imgIconObj = editMain.querySelector('img[name=icon]')


let btnDelete = editMain.querySelector('button.btn-delete')
let btnCancel = editMain.querySelector('button.btn-cancel')
let btnSave = editMain.querySelector('button.btn-save')

let eshortcut = {}

electron.ipcRenderer.on('eshortcut', (event, paramaters) => {
    if (!paramaters) {
        //新建移除删除按钮
        btnDelete.remove()
        editWindow.setTitle('新建快捷方式')
        return
    }

    editWindow.setTitle('编辑快捷方式')
    eshortcut = paramaters
    let name = paramaters.name == undefined ? '' : paramaters.name
    let path = paramaters.path == undefined ? '' : paramaters.path
    let target = paramaters.target == undefined ? '' : paramaters.target
    let args = paramaters.args == undefined ? '' : paramaters.args
    let icon = paramaters.icon == undefined ? '' : paramaters.icon
    nameObj.value = name
    pathObj.value = path
    targetObj.value = target
    argsObj.value = args
    imgIconObj.setAttribute('src', icon)

    if (!fs.existsSync(path)) {
        pathObj.classList.add('path-not-exits')
    }

    if (!fs.existsSync(target)) {
        targetObj.classList.add('target-not-exits')
    }
})


function bindEvents() {

    document.addEventListener('keydown', function (e) {

        if (e.which === 27) {
            editWindow.close()
        }
    })
    btnDelete.addEventListener('click', function () {

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: '提示',
            message: '确定删除[' + eshortcut.name + ']？',
            buttons: ['确定', '取消'],
            defaultId: 1
        }, function (btnIndex) {
            if (btnIndex === 0) {
                ConfigUtils.deleteConfig(eshortcut.id, function () {

                    //刷新列表
                    mainWindow.reload()
                    //关闭窗口
                    editWindow.close()
                })
            }
        })

    })

    btnCancel.addEventListener('click', function () {
        editWindow.close()
    })

    btnSave.addEventListener('click', function () {
        let name = nameObj.value
        let path = pathObj.value
        let target = targetObj.value
        let args = argsObj.value
        let icon = imgIconObj.getAttribute('src')

        eshortcut.name = name
        eshortcut.path = path
        eshortcut.target = target
        eshortcut.args = args
        eshortcut.icon = icon

        ConfigUtils.editConfig(eshortcut, function () {
            mainWindow.reload()
            editWindow.close()
        })
    })

    editWindow.on('closed', function () {
        editWindow = null
    })

    imgIconObj.addEventListener('click', function () {
        dialog.showOpenDialog(editWindow, {
            title: '选择图标',
            properties: ['openFile'],
            filters: [
                {name: 'Images', extensions: ['jpg', 'png', 'gif', 'ico']}
            ]
        }, function (filePaths) {
            let base64 = fs.readFileSync(filePaths[0]).toString('base64')
            if (base64) {
                base64 = 'data:image/png;base64,' + base64
                imgIconObj.setAttribute('src', base64)
            }
        })
    })
}

bindEvents()