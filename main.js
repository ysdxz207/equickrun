const electron = require('electron')
const AutoLaunch = require('auto-launch')
const ConfigUtils = require('./app/js/ConfigUtils')


// Module to control application life.
const app = electron.app
const globalShortcut = electron.globalShortcut
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const Tray = electron.Tray
const Menu = electron.Menu

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let tray = null

//开机启动
var eshortcutAutoLauncher = new AutoLaunch({
    name: app.getName(),
    path: process.cwd() + path.sep + app.getName() + '.exe'
})


toggleStartUp(ConfigUtils.equickrunConfig.startup)

function registShortCut() {


    // 注册一个 'CommandOrControl+Shift+`' 的全局快捷键
    const ret = globalShortcut.register('CommandOrControl+Shift+`', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide()
        } else {
            mainWindow.show()
        }
    })

    if (!ret) {
        console.log('Shortcut registration failed!')
    }

    // 检查快捷键是否注册成功
    if (globalShortcut.isRegistered('CommandOrControl+Shift+`')) {
        console.log('Shortcut registration sucess!')
    }
}

function registTray() {
    //读取配置
    let equickrunConfig = ConfigUtils.equickrunConfig

    tray = new Tray(path.join(__dirname, '/app/images/icon/icon.ico'))
    const contextMenu = Menu.buildFromTemplate([
        {label: '关于', type: 'normal', click() {
            require('electron').shell.openExternal('https://github.com/ysdxz207/equickrun.git')
        }},
        {label: '启动后打开主窗口', type: 'checkbox', checked: equickrunConfig['startupShowWindow'], click(menuItem) {
            equickrunConfig['startupShowWindow'] = menuItem.checked
            ConfigUtils.saveConfig(equickrunConfig, function () {
            })
        }},
        {label: '开机启动', type: 'checkbox', checked: equickrunConfig['startup'], click(menuItem) {
            equickrunConfig['startup'] = menuItem.checked
            ConfigUtils.saveConfig(equickrunConfig, function () {
                //处理开机启动项
                toggleStartUp(menuItem.checked)
            })
        }},
        {label: '退出', type: 'normal', click() {
            app.quit()
        }}
    ])
    tray.setToolTip('equickrun')
    tray.setContextMenu(contextMenu)

    tray.on('click', function (e) {
        //单击显示主窗体
        if (mainWindow.isVisible()) {
            mainWindow.hide()
        } else {
            mainWindow.show()
        }
    })
}

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        id: 'window_equickrun',
        width: 220,
        height: 560,
        // width: 800,
        // height: 600,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        show: ConfigUtils.equickrunConfig.startupShowWindow,
        webPreferences: {

            devTools: false
        }
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    mainWindow.openDevTools()
    registShortCut()
    registTray()

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


app.on('will-quit', () => {
    // 注销快捷键
    globalShortcut.unregister('CommandOrControl+Shift+`')

    // 清空所有快捷键
    globalShortcut.unregisterAll()
})

function toggleStartUp(startup) {


    if (startup) {
        eshortcutAutoLauncher.enable();
    } else {
        eshortcutAutoLauncher.disable();
    }
}