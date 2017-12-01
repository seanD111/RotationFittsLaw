const electron = require('electron')
const url = require('url')
const path = require('path')

const {app, BrowserWindow, Menu} = electron;

let mainWindow;
let someWindow;

// Listen for app to be ready
app.on('ready', function(){
    mainWindow = new BrowserWindow({});
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('closed', function(){
        app.quit();
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);
    
})

// handle create add window

function createSomeWindow(){

    someWindow = new BrowserWindow({
        width: 400,
        height: 200,
        title: 'Some Window'
    });
    someWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'someWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    someWindow.on('closed', function(){
        someWindow = null;
    })

} 

// create a template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label: 'Add Item',
                 click(){
                    createSomeWindow()
                 }
            },
            {
                label: 'Clear Items'
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]

    }
]


if(process.platform =='darwin'){
    mainMenuTemplate.unshift({});
}

if(process.env.NODE_ENV != 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
        {
            label: 'Toggle DevTools',
            click(item, focusedWindow){
                focusedWindow.toggleDevTools()
            }
        }
        ]
    })
}