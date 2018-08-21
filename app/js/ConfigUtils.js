const {BrowserWindow, dialog, remote} = require('electron')
const path = require('path')
const fs = require('fs')

const userDataPath = (electron.app || electron.remote.app).getPath('home');
const CONFIG_PATH = path.join(userDataPath, 'equickrun/conf.json');

var ConfigUtils = {}

if (!fs.existsSync(CONFIG_PATH)) {
    ConfigUtils.equickrunConfig = {
        "startup": true,
        "startupShowWindow": true,
        "eshortcuts": []
    }
} else {
    ConfigUtils.equickrunConfig = JSON.parse(fs.readFileSync(CONFIG_PATH).toString())
}

let equickrunConfig = ConfigUtils.equickrunConfig

ConfigUtils.getEshortcut = function (id) {
    let eshortcutList = equickrunConfig.eshortcuts

    for (let i = 0; i < eshortcutList.length; i++) {
        let eshortcut = eshortcutList[i]
        if (eshortcut.id == id) {
            return eshortcut
        }
    }

    return null
}
ConfigUtils.saveToConfig = function (eshortcut) {
    if (!eshortcut) {
        return
    }

    let eshortcutList = equickrunConfig.eshortcuts
    eshortcutList.push(eshortcut)
    equickrunConfig.eshortcuts = eshortcutList

    ConfigUtils.saveConfig(equickrunConfig)
}

ConfigUtils.saveConfig = function (equickrunConfig, callback) {
    fs.writeFile(CONFIG_PATH, JSON.stringify(equickrunConfig, undefined, 4), {}, function (err) {
        if (err) {
            dialog.showMessageBox(BrowserWindow, {
                type: 'error',
                title: '错误',
                message: '保存配置失败'
            })
        }

        if (callback) {
            callback()
        }
    })
}


ConfigUtils.deleteConfig = function (id, callback) {

    let eshortcutList = equickrunConfig.eshortcuts

    for (let i = 0; i < eshortcutList.length; i++) {
        let eshortcut = eshortcutList[i]
        if (eshortcut.id == id) {
            eshortcutList.splice(i, 1)
        }
    }

    equickrunConfig.eshortcuts = eshortcutList
    ConfigUtils.saveConfig(equickrunConfig, function () {
        if(callback) {
            callback()
        }
    })
}


ConfigUtils.editConfig = function (_eshortcut, callback) {
    let eshortcutList = equickrunConfig.eshortcuts

    if (_eshortcut.id) {

        for (let i = 0; i < eshortcutList.length; i++) {
            let eshortcut = eshortcutList[i]
            if (eshortcut.id == _eshortcut.id) {
                eshortcutList[i] = _eshortcut
            }
        }
    } else {
        //新增
        _eshortcut['id'] = process.hrtime().join('')
        eshortcutList.push(_eshortcut)
    }

    equickrunConfig.eshortcuts = eshortcutList
    ConfigUtils.saveConfig(equickrunConfig, function () {
        if (callback) {
            callback()
        }
    })
}

module.exports = ConfigUtils