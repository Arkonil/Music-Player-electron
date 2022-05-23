// import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';

import Parent from './components/Player/Parent';

import ThemeProvider from './components/contexts/ThemeContext';
import { AudioStateProvider } from './components/contexts/AudioStateContext';

import './style/App.module.scss';


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
