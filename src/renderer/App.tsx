// import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';

import MusicPlayer from './components/MusicPlayer';

import ThemeProvider from './components/contexts/ThemeContext';
import AudioStateProvider from './components/contexts/AudioStateContext';

import './style/App.scss';


export default function App() {
  return (
    <ThemeProvider>
      <AudioStateProvider>
        <MusicPlayer />
      </AudioStateProvider>
    </ThemeProvider>
  );
}
