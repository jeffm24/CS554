const electron = require("electron");
const {dialog} = require("electron");
const eventData = require("../data/eventData.js");

let mainWindow;

const constructorMethod = () => {

    // Module to control application life.
    const app = electron.app;

    // Module to create native browser window.
    const BrowserWindow = electron.BrowserWindow;

    // Keep a global reference of the window object, if you don't, the window will
    // be closed automatically when the JavaScript object is garbage collected.

    function createWindow() {
        // Create the browser window.
        mainWindow = new BrowserWindow({ width: 1200, height: 900, minWidth: 400 });

        mainWindow.loadURL('http://localhost:3000/');

        // Open the DevTools.
        //mainWindow.webContents.openDevTools({ mode: "undocked" });

        // Emitted when the window is closed.
        mainWindow.on('closed', function () {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            mainWindow = null;
        });
    }

    const Menu = electron.Menu;

    function createMenu() {
        Menu.setApplicationMenu(Menu.buildFromTemplate([
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Save Calendar',
                        accelerator: 'CmdOrCtrl+S',
                        click(item, focusedWindow) {
                            var options = {
                                buttonLabel: 'Save Calendar',
                                filters: [{ name: 'JSON', extensions: ['json'] }]
                            };

                            // Display save dialog box to save the current calendar
                            dialog.showSaveDialog(mainWindow, options, function (filePath) {
                                if (filePath === undefined) {
                                    return;
                                }

                                eventData.saveCalendar(filePath).then(function(result) {
                                    dialog.showMessageBox(mainWindow, {type: 'info', buttons: [], title: 'Success!', message: 'Calendar saved!'});
                                }, function(error) {
                                    dialog.showErrorBox('Error', error);
                                });
                            });
                        }
                    },
                    {
                        label: 'Load Calendar',
                        accelerator: 'CmdOrCtrl+O',
                        click(item, focusedWindow) {
                            var options = {
                                buttonLabel: 'Load Calendar',
                                filters: [{ name: 'JSON', extensions: ['json'] }],
                                properties: ['openFile']
                            };

                            dialog.showOpenDialog(mainWindow, options, function (filePaths) {
                                if (filePaths === undefined) {
                                    return;
                                }
                                
                                eventData.loadCalendar(filePaths[0]).then(function(result) {
                                    dialog.showMessageBox(mainWindow, {type: 'info', buttons: [], title: 'Success!', message: 'Calendar loaded!'});
                                    mainWindow.loadURL('http://localhost:3000/');
                                }, function(error) {
                                    dialog.showErrorBox('Error', error);
                                });
                            });
                        }
                    }
                ]
            },
            {
                label: 'Modes',
                submenu: [
                    {
                        label: 'Change to Tablet',
                        click(item, focusedWindow) {
                            var height = mainWindow.getSize()[1];

                            mainWindow.setSize(700, height);
                        }
                    },
                    {
                        label: 'Change to Desktop',
                        click(item, focusedWindow) {
                            var height = mainWindow.getSize()[1];

                            mainWindow.setSize(1200, height);
                        }
                    },
                    {
                        label: 'Change to Mobile View',
                        click(item, focusedWindow) {
                            var height = mainWindow.getSize()[1];

                            mainWindow.setSize(400, height);
                        }
                    }
                ]
            }
        ]));
    }

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', function () {
        createWindow();
        createMenu();
    });

    // Quit when all windows are closed.
    app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) {
            createWindow();
        }
    });

    // In this file you can include the rest of your app's specific main process
    // code. You can also put them in separate files and require them here.
};

module.exports = constructorMethod;
