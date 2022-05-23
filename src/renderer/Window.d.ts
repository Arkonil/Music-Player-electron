/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        on: (channel: string, func: (...args: any[]) => void) => void;
        once: (channel: string, func: (...args: any[]) => void) => void;
        send: (channel: string, ...args: any[]) => void;
      };
      loadSongDataFromPath: (path: string) => Promise<Buffer>;
      loadSongMetaDataFromPath: (path: string) => Promise<MusicPlayer.Song>;
    };
  }
}
