/* eslint-disable @typescript-eslint/no-explicit-any */
// import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';
import './style/App.module.scss';
import Parent from './components/Player/Parent';
// import Parent from './experiment/Parent';

import ThemeProvider from './components/contexts/ThemeContext';

declare global {
  interface Window {
    electron: {
      ipcRenderer: any;
      mm: any;
      fs: any;
      utils: {
        uint8toBase64: (array: Uint8Array | Float32Array) => string;
      };
    };
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <Parent />
    </ThemeProvider>
  );
  // return <div />;
}
