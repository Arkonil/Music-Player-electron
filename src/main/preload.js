const { contextBridge, ipcRenderer } = require('electron');
const parse = require('parse-css-color');

const {loadSongDataFromPath, loadSongMetaDataFromPath} = require('./node_func');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on(channel, func) {
      const validChannels = ['songs-selected'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
    send(channel, ...args) {
      const validChannels = ['select-songs'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args);
      }
    }
  },
  loadSongDataFromPath,
  loadSongMetaDataFromPath,
  parseCSSColorString(cssString) {
    return parse(cssString.trim());
  }
  // parseCSSColorString: parse,
});
