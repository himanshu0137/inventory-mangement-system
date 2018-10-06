const { app, BrowserWindow, ipcMain } = require('electron')
const path = require("path");
const url = require("url");
const dbContext = require("./db");
let win;
let printWindow;
let db;

function createWindow()
{
  db = dbContext.init();
  win = new BrowserWindow({
    width: 800, height: 600, webPreferences: {
      plugins: true
    }
  });
  win.loadFile('dist/index.html')

  // Open the DevTools.
  // win.webContents.openDevTools()
  win.on('closed', () =>
  {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  });
  ipcMain.on('default-chemical', (event) =>
  {
    const callBack = function (data) { event.sender.send('default-chemical-reply', data) }
    dbContext.getDefaultItems(callBack);
  });
  ipcMain.on('get-storage-items', (event) =>
  {
    let callBack = function (data) { event.sender.send('get-storage-items-reply', data) }
    dbContext.getStorageItem(callBack);
  });
  ipcMain.on('upsert-item', (event, data) =>
  {
    dbContext.upsertItem(data);
    event.returnValue = true;
  });
  ipcMain.on('save-entry', (event, data) =>
  {
    dbContext.saveItem(data);
    event.returnValue = true;
  });
  ipcMain.on('get-all-entry', event =>
  {
    let callBack = function (data) { event.sender.send('get-all-entry-reply', data); }
    dbContext.getAllEntries(callBack);
  });
  ipcMain.on('remove-items', (event, data) =>
  {
    dbContext.removeItems(data);
    event.returnValue = true;
  });
  ipcMain.on('open-print-window', (event, body) =>
  {
    printWindow = new BrowserWindow({
      width: 800, height: 600, parent: win, modal: true, show: false, webPreferences: {
        plugins: true
      }
    });
    printWindow.loadFile('dist/printPreview.html');

    printWindow.once('show', () =>
    {
      printWindow.webContents.send('open-print-window-reply', body);
    });
    printWindow.once('ready-to-show', () =>
    {
      printWindow.show();
    });
  });
  ipcMain.on('chemical-items', (event, term) =>
  {
    let callBack = function (data) { event.sender.send('chemical-items-reply', data); }
    dbContext.getChemicalItems(term, callBack);
  });
  ipcMain.on('find-storage-items', (event, term) =>
  {
    let callBack = function (data) { event.sender.send('find-storage-items-reply', data); }
    dbContext.findStorageItem(term, callBack);
  });
  ipcMain.on('delete-storage-item', (event, id) =>
  {
    let callBack = function (data) { event.sender.send('delete-storage-item-reply', data); }
    dbContext.deleteStorageItem(id, callBack);
  });
  ipcMain.on('delete-entry', (event, id) =>
  {
    let callBack = function (data) { event.sender.send('delete-entry-reply', data); }
    dbContext.deleteEntry(id, callBack);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () =>
{
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin')
  {
    app.quit()
  }
})

app.on('activate', () =>
{
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null)
  {
    createWindow()
  }
})

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.