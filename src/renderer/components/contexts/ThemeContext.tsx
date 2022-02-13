import React, { useState } from 'react';
// import Color from '../common/Color';

const darkTheme = {
  colors: {
    backgroundColor: 'hsl(233, 38%, 13%)',
    primaryColor: 'hsl(332, 76%, 53%)',
    secondaryColor: 'hsl(0, 100%, 100%)',
    fontColor: 'hsl(0, 100%, 100%)',
    mainColor: '#000000',
    toolTipColor: 'rgb(255, 255, 255)',
  },
};

const lightTheme = {
  colors: {
    backgroundColor: 'hsl(233, 38%, 13%)',
    primaryColor: 'hsl(332, 76%, 53%)',
    secondaryColor: 'hsl(0, 100%, 100%)',
    fontColor: 'hsl(0, 100%, 100%)',
    mainColor: '#FFFFFF',
    toolTipColor: 'rgb(117, 117, 117)',
  },
};

export const ThemeContext = React.createContext(darkTheme);

export function useTheme(state = true) {
  const [isDark, setDark] = useState(state);
  return [isDark, setDark];
}

interface Prop {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: Prop) {
  const [isDark] = useTheme();

  return (
    <ThemeContext.Provider value={isDark ? darkTheme : lightTheme}>
      {children}
    </ThemeContext.Provider>
  );
}
