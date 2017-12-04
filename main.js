import { app, BrowserWindow, Menu, ipcMain } from 'electron';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

/** variable to hold the data for the current block. has properties:
    blockCode: str
    conditionCode: str
    errorThreshold: num
    numTargets: num
    participantCode: str
    targetAmplitudes: arr[num]
    targetWidths: arr[num]
*/
let blockConfiguration={};

/**
 * Holds the randomized sequence information for this block
 * @type {Object}
 * @property {array} sequences holds an array of the experiment sequences
 * @property {int} currentSeq holds the index to current sequence
 * @property {int} trials specifies the nuber of targets in the sequence
 */
let block={};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let experimentSetupWindow;
let sequenceWindow;
let sequenceSummaryWindow;
let blockSummaryWindow;

const createBlockSummaryWindow = () =>{
    blockSummaryWindow = new BrowserWindow({
        show: false,
        width: 400,
        height: 600,
        autoHideMenuBar: true,
        title: "Sequence Summary"
    })
    blockSummaryWindow.loadURL(`file://${__dirname}/src/block-summary.html`);
    blockSummaryWindow.once('ready-to-show', () => {
      blockSummaryWindow.show()
    })
    blockSummaryWindow.on('close', () => {
        blockSummaryWindow = null;
    });
}

const createSequenceSummary = () =>{
    sequenceSummaryWindow = new BrowserWindow({
        show: false,
        width: 400,
        height: 600,
        autoHideMenuBar: true,
        title: "Sequence Summary"
    })
    sequenceSummaryWindow.loadURL(`file://${__dirname}/src/sequence-summary.html`);
    sequenceSummaryWindow.once('ready-to-show', () => {
        sequenceSummaryWindow.show()
    })

    sequenceSummaryWindow.on('close', () => {
        sequenceSummaryWindow = null;
    });
}

const createSequenceWindow = (onRdyFn) =>{
    sequenceWindow = new BrowserWindow({
        show: false,
        fullscreen: true, 
        alwaysOnTop: true,
        frame: false
    })

    sequenceWindow.loadURL(`file://${__dirname}/src/sequence.html`);
    sequenceWindow.once('ready-to-show', () => {
        sequenceWindow.show()
        onRdyFn();
    })
    sequenceWindow.on('close', () => {
        sequenceWindow = null;
    });
}

const createExperimentSetupWindow = () =>{
    experimentSetupWindow = new BrowserWindow({
        width: 400,
        height: 600,
        autoHideMenuBar: true,
        title: "Experiment Setup"
    })
    experimentSetupWindow.loadURL(`file://${__dirname}/src/experiment-setup.html`);

    experimentSetupWindow.once('ready-to-show', () => {
      experimentSetupWindow.show()
    })

    experimentSetupWindow.on('close', () => {
        experimentSetupWindow = null;
    });

    // Menu.setApplicationMenu(new Menu());
}

const closeExperimentSetupWindow = ()=>{
    experimentSetupWindow.close();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createExperimentSetupWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (experimentSetupWindow === null) {
    createExperimentSetupWindow();
  }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('setup:complete', (event, setupConfig) => {    

    blockConfiguration = setupConfig;
    block['trials'] =  blockConfiguration['numTargets'] ;
    block['sequences'] = shuffle(prepareSequenceSetups(setupConfig));
    block['currentSeq'] = 0;
    createDataFiles();
    
    createSequenceWindow(startNextSequence);    
    closeExperimentSetupWindow(); 
})

// create the data output csv files for this participant/block/condition
function createDataFiles(){
    let sd1File = `FittsTaskRotation
    -${blockConfiguration["participantCode"]}
    -${blockConfiguration["conditionCode"]}
    -${blockConfiguration["blockCode"]}
    .sd1`.replace(/\s/gm,"");;

    console.log(sd1File);
}

function startNextSequence(){
    let cfg= blockConfiguration;
    sequenceWindow.send("sequence:start", block);
}


function prepareSequenceSetups(setupConfig){
    let allSequences = [];
    setupConfig["targetAmplitudes"].forEach((amplitude)=>{
        setupConfig["targetWidths"].forEach((width)=>{
            allSequences.push({amplitude: amplitude, width: width});
        })
    })
    return allSequences;
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}


