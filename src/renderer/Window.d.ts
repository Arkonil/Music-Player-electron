/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

type ColorParsingResult = {
  type: 'rgb' | 'hsl',
  values: [number, number, number],
  alpha: number
}

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
      parseCSSColorString: (cssString: string) => ColorParsingResult | null;
    };
  }
}
