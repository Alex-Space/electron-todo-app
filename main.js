const { app, Menu, BrowserWindow, ipcMain } = require('electron');

let win;
function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  })

  win.loadFile('main.html')
  win.on('closed', () => app.quit());
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }

})

app.on('ready', () => {
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
})


const menuTemplate = [
  {
    label: 'MyFile',
    submenu: [
      {
        label: 'New Todo',
        click() { createAddWindow(); }
      },
      {
        label: 'Clear All Todos',
        click() { clearAllTodos(); }
      },
      {
        label: 'Quit',
        accelerator: (() => {
          if (process.platform === 'darwin') {
            return 'Command+Q'
          } else {
            return 'CTRL+Q'
          }
        })(),
        click() {
          app.quit();
        }
      }
    ]
  }
];

if (process.platform === 'darwin') {
  menuTemplate.unshift({});
}

let addWindow;
function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add New Todo',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  addWindow.loadFile('add.html')
  addWindow.on('closed', () => addWindow = null);
}

function clearAllTodos () {
  win.webContents.send('todo:clearAll');
}

ipcMain.on('todo:add', (event, todo) => {
  win.webContents.send('todo:add', todo);
  addWindow.close();
});

if (process.env.NODE_ENV !== 'production') {
  menuTemplate.push({
    label: 'View',
    submenu: [
      { role: 'reload' },
      {
        label: 'Toggle Dev Tools',
        accelerator: process.platform === 'darwin' ? 'Shift+Command+C' : 'Shift+Ctrl+C',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}