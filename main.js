const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

let mainWindow;
// const cachePath = 'D:\\ECache'; // 替换成你想要的路径

// app.setPath('userData', cachePath);
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,    // 是否集成 Nodejs
            enableRemoteModule: true,
            contextIsolation: false,
            // 关闭同源策略 解决跨域
            webSecurity: false,
        },
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// 在主进程中读取文件和写入文件
const readAndWriteFile = async () => {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'XML Files', extensions: ['xml'] }],
    });

    if (filePaths && filePaths.length > 0) {
        const xmlData = fs.readFileSync(filePaths[0], 'utf-8');

        const bookmarkRegex = /<bookmark name="(.*?)" position="(.*?)" \/>/g;
        let match;
        let output = '';

        while ((match = bookmarkRegex.exec(xmlData)) !== null) {
            const name = match[1];
            const position = match[2];
            output += `Name: ${name}, Position: ${position}\n`;
        }

        fs.writeFileSync('output.txt', output);
    }
};

// 在渲染进程中调用主进程函数
const { ipcMain } = require('electron');
ipcMain.handle('readAndWriteFile', async () => {
    await readAndWriteFile();
});
