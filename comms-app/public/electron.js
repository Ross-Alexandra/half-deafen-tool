const path = require('path');
const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const store = new Store();

const {
    getSelectedPrograms,
    setSelectedPrograms,
    getSelectedDevices,
    setSelectedDevices,
    setHotkey
} = require('./electron_command_strings');
const {getDevices, getPrograms} = require('./volume_control');

ipcMain.handle('runCommand', async (event, args) => {
    switch (args.commandString) {
        case getDevices.commandString:
            return {data: await getDevices()};
        case getPrograms.commandString:
            return {data: await getPrograms(args.device)};
        case getSelectedPrograms:
            return {data: store.get('selectedPrograms', [0])};
        case setSelectedPrograms:
            console.log('Setting selectedPrograms to =>', args.selectedPrograms)
            return {data: store.set('selectedPrograms', args.selectedPrograms)};
        case getSelectedDevices: 
            return {data: store.get('selectedDevices', [0])};
        case setSelectedDevices:
            console.log('Setting selectedDevices to =>', args.selectedDevices);
            return {data: store.set('selectedDevices', args.selectedDevices)};
        case setHotkey:
            globalShortcut.unregisterAll();

            console.log(args);
            globalShortcut.register(args.hotkey, () => {
                console.log(`${args.hotkey} was pressed!`);
            });
        default:
            return {data: null};
    }
});

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron_api.js')
    },
  });

  if (!isDev) win.removeMenu();

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
