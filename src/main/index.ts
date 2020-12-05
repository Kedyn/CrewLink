'use strict'

import { autoUpdater } from 'electron-updater';
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path'
import { format as formatUrl } from 'url'
import './hook';
import { overlayWindow as OverlayWindow } from "../overlay"

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null;
let overlayWindow: BrowserWindow | null;

app.commandLine.appendSwitch('disable-pinch');

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
	app.quit();
} else {
	// app.disableHardwareAcceleration();
	autoUpdater.checkForUpdatesAndNotify();
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		// Someone tried to run a second instance, we should focus our window.
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore()
			mainWindow.focus()
		}
	})


	function createMainWindow() {
		const window = new BrowserWindow({
			width: 250,
			height: 350,
			resizable: false,
			frame: false,
			fullscreenable: false,
			maximizable: false,
			transparent: true,
			webPreferences: {
				nodeIntegration: true,
				enableRemoteModule: true,
				webSecurity: false
			}
		});

		if (isDevelopment) {
			window.webContents.openDevTools()
		}

		if (isDevelopment) {
			window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?version=${autoUpdater.currentVersion.version}`)
		}
		else {
			window.loadURL(formatUrl({
				pathname: path.join(__dirname, 'index.html'),
				protocol: 'file',
				query: {
					version: autoUpdater.currentVersion.version
				},
				slashes: true
			}))
		}

		window.on('closed', () => {
			mainWindow = null
		})

		window.webContents.on('devtools-opened', () => {
			window.focus()
			setImmediate(() => {
				window.focus()
			})
		})

		return window
	}

	function createOverlayWindow() {
		const window = new BrowserWindow({
			width: 800,
			height: 600,
			...OverlayWindow.WINDOW_OPTS
		});

		window.loadURL(`data:text/html;charset=utf-8,
			<head>
				<title>overlay-demo</title>
			</head>
			<body style="padding: 0; margin: 0;">
				<div style="position: absolute; width: 100%; height: 100%; border: 4px solid red; background: rgba(255,255,255,0.1); box-sizing: border-box;"></div>
				<div style="padding-top: 50vh; text-align: center;">
					<span style="padding: 16px; border-radius: 8px; background: rgb(255,255,255); border: 4px solid red;">Overlay Window</span>
				</div>
			</body>
		`);

		window.setIgnoreMouseEvents(true);

		OverlayWindow.attachTo(window, "Among Us");
		
		return window;
	}

	// quit application when all windows are closed
	app.on('window-all-closed', () => {
		// on macOS it is common for applications to stay open until the user explicitly quits
		if (process.platform !== 'darwin') {
			app.quit()
		}
	})

	app.on('activate', () => {
		// on macOS it is common to re-create a window even after all windows have been closed
		if (mainWindow === null) {
			mainWindow = createMainWindow()
		}

		if (overlayWindow === null) {
			overlayWindow = createOverlayWindow();
		}
	})

	// create main BrowserWindow when electron is ready
	app.on('ready', () => {
		mainWindow = createMainWindow();
		overlayWindow = createOverlayWindow();
	});

	// ipcMain.on('alwaysOnTop', (event, onTop: boolean) => {
	// 	if (mainWindow) {
	// 		mainWindow.setAlwaysOnTop(onTop, 'floating', 1);
	// 		mainWindow.setVisibleOnAllWorkspaces(true);
	// 		mainWindow.setFullScreenable(false);
	// 	}
	// });

	ipcMain.on('shortcut', (event, val) => {
		event.returnValue = false;
		// console.log('register', val);
		// globalShortcut.unregisterAll();
		// event.returnValue = globalShortcut.register(val!, () => {
		// 	console.log("push-to-talk");
		// })

	});
}