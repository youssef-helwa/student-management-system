// Electron main process.
// Starts the Node.js backend, waits until it is healthy,
// then opens the React frontend.

import { app, BrowserWindow, Menu, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let backendProcess = null;

// Change this if your backend uses another port.
const BACKEND_PORT = 3000;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}/check`;

// ---------------------------------------------------------
// Start backend
// ---------------------------------------------------------

function startBackend() {
  let backendPath;

  if (isDev) {
    backendPath = path.resolve(
      __dirname,
      '../../../backend/src/main.js'
    );
  } else {
    backendPath = path.join(
      process.resourcesPath,
      'backend',
      'src',
      'main.js'
    );
  }

  const nodeExecutable = process.platform === 'win32'
    ? 'node.exe'
    : 'node';

  const backendCwd = isDev
  ? path.resolve(__dirname, '../../../backend')
  : path.join(process.resourcesPath, 'backend');

  console.log('Backend path:', backendPath);
  console.log('Backend cwd:', backendCwd);
  console.log('Node executable:', nodeExecutable);

  backendProcess = spawn(
    nodeExecutable,
    [backendPath],
    {
      env: {
        ...process.env,
          NODE_ENV: isDev ? 'development' : 'production',
        },
      cwd: backendCwd,
      stdio: 'inherit',
      windowsHide: false,
    }
  );

  backendProcess.on('error', (error) => {
    console.error('Failed to start backend:', error);
  });

  backendProcess.on('exit', (code, signal) => {
    console.log(
      `Backend exited with code: ${code}, signal: ${signal}`
    );

    backendProcess = null;
  });
}

// ---------------------------------------------------------
// Wait for backend
// ---------------------------------------------------------

async function waitForBackend() {
  const maxAttempts = 60;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Checking backend: ${BACKEND_URL}`);

      const response = await fetch(BACKEND_URL);

      if (response.ok) {
        console.log('Backend is ready.');
        return true;
      }

      console.log(`Backend returned HTTP ${response.status}`);
    } catch (error) {
      console.log(
        `Backend not ready yet: ${error?.cause?.code || error.message}`
      );
    }

    console.log(`Waiting for backend... ${attempt}/${maxAttempts}`);

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }

  throw new Error('Backend did not start in time.');
}
// ---------------------------------------------------------
// Create Electron window
// ---------------------------------------------------------

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0F1117',
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'default',

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in the OS browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);

    return {
      action: 'deny',
    };
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');

    mainWindow.webContents.openDevTools({
      mode: 'detach',
    });
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '../dist/index.html')
    );
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ---------------------------------------------------------
// Application menu
// ---------------------------------------------------------

function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          role: 'quit',
        },
      ],
    },

    {
      label: 'View',
      submenu: [
        {
          role: 'reload',
        },

        {
          role: 'toggleDevTools',
        },

        {
          type: 'separator',
        },

        {
          role: 'resetZoom',
        },

        {
          role: 'zoomIn',
        },

        {
          role: 'zoomOut',
        },

        {
          type: 'separator',
        },

        {
          role: 'togglefullscreen',
        },
      ],
    },
  ];

  Menu.setApplicationMenu(
    Menu.buildFromTemplate(template)
  );
}

// ---------------------------------------------------------
// Application startup
// ---------------------------------------------------------

app.whenReady().then(async () => {
  try {
    buildMenu();

    // 1. Start backend
    startBackend();

    // 2. Wait until backend is ready
    await waitForBackend();

    // 3. Start React/Electron window
    createWindow();

  } catch (error) {
    console.error('Application startup failed:', error);

    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// ---------------------------------------------------------
// Application shutdown
// ---------------------------------------------------------

app.on('window-all-closed', () => {
  if (backendProcess) {
    console.log('Stopping backend...');

    backendProcess.kill();

    backendProcess = null;
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();

    backendProcess = null;
  }
});