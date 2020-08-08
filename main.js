const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const fs = require("fs");
const path = require("path");
const { menu } = require("./menu");

let mainWindow;
const isWindows = process.platform === "win32";

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    },
    frame: false
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


ipcMain.on("btnclick", function(event, arg) {
  //create new window
  var newWindow = new BrowserWindow({
    width: 450,
    height: 300,
    show: false,
    webPreferences: {
      webSecurity: false,
      plugins: true,
      nodeIntegration: false
    }
  }); // create a new window

  var facebookURL = "https://www.facebook.com";

  newWindow.loadURL(facebookURL);
  newWindow.show();

  // inform the render process that the assigned task finished. Show a message in html
  // event.sender.send in ipcMain will return the reply to renderprocess
  event.sender.send("btnclick-task-finished", "yes");
});

ipcMain.on(`display-app-menu`, function(e, args) {
  if (isWindows && mainWindow) {
    menu.popup({
      window: mainWindow,
      x: args.x,
      y: args.y
    });
  }
});


ipcMain.on(`test-event`, function(e, args) {
  console.log("test event")
  dialog
    .showSaveDialog({})
    .then(result => {
      if (result.canceled)
        return;

      var filename = result.filePath;
      console.log(filename)

      try {
        fs.writeFileSync(filename + ".txt", "Hey. I am the file", "utf-8");
        console.log("File saved")
      } catch (e) {
        console.log("Failed to save file")
        console.log(e);
      }
    });
});