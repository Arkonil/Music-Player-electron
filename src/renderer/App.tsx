/* eslint-disable @typescript-eslint/no-explicit-any */
// import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';
import './style/App.module.scss';
import Parent from './components/Player/Parent';
// import Parent from './experiment/Parent';

import ThemeProvider from './components/contexts/ThemeContext';
import { AudioStateProvider } from './components/contexts/AudioStateContext';

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

export default function App() {
  return (
    <ThemeProvider>
      <AudioStateProvider>
        <Parent />
      </AudioStateProvider>
    </ThemeProvider>
  );
  // return <div />;
}
