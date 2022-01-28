const { contextBridge, ipcRenderer } = require('electron');
const mm = require('music-metadata');
const fs = require('fs');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer,
  mm,
  fs,
});
