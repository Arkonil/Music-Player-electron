const { contextBridge, ipcRenderer } = require('electron');
const mm = require('music-metadata');
const fs = require('fs');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
      const validChannels = ['file-selected'];
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
    ...ipcRenderer
  },
  mm,
  fs,
  utils: {
    uint8toBase64(array) {
      return Buffer.from(array).toString('base64');
    }
  }
});
