import React, { useState, useCallback, useContext } from 'react';

const themes = {
  dark: {
    colors: {
      backgroundColor: 'hsl(233, 38%, 13%)',
      primaryColor: 'hsl(332, 76%, 53%)',
      secondaryColor: 'hsl(0, 100%, 100%)',
      fontColor: 'hsl(0, 100%, 100%)',
      mainColor: 'hsl(0, 0%, 0%)',
      toolTipColor: 'rgb(255, 255, 255)',
    },
  },
  light: {
    colors: {
      backgroundColor: 'hsl(233, 38%, 13%)',
      primaryColor: 'hsl(332, 76%, 53%)',
      secondaryColor: 'hsl(0, 100%, 100%)',
      fontColor: 'hsl(0, 100%, 100%)',
      mainColor: 'hsl(0, 0%, 100%)',
      toolTipColor: 'rgb(117, 117, 117)',
    },
  },
};

type ThemeType = 'dark' | 'light';

export const ThemeContext = React.createContext({
  theme: themes.dark,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setTheme: (_param: ThemeType) => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: OnlyChildrenProp) {
  const [theme, setTheme] = useState(themes.dark);

  const themeUpdater = useCallback((param: ThemeType) => {
    setTheme(themes[param]);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: themeUpdater }}>
      {children}
    </ThemeContext.Provider>
  );
}
