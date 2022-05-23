import React, { useState, useCallback, useContext } from 'react';

const defaultState = {
  isPlaying: false,
  shuffleEnabled: false,
};

const defaultStateUpdater = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  togglePlaying: (_v: boolean) => {},
  toggleShuffle: () => {},
};

const AudioStateContext = React.createContext(defaultState);
const AudioStateUpdateContext = React.createContext(defaultStateUpdater);

export function useAudioState() {
  return useContext(AudioStateContext);
}

export function useAudioStateUpdater() {
  return useContext(AudioStateUpdateContext);
}

export default function AudioStateProvider({ children }: OnlyChildrenProp) {
  const [isPlaying, setPlaying] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);

  const togglePlaying = useCallback((v: boolean) => {
    setPlaying(v)
  }, [])

  const toggleShuffle = useCallback(() => {
    setShuffleEnabled((v) => !v);
  }, []);

  const state = {
    isPlaying,
    shuffleEnabled,
  };

  const stateUpdater = {
    togglePlaying,
    toggleShuffle,
  };

  return (
    <AudioStateContext.Provider value={state}>
      <AudioStateUpdateContext.Provider value={stateUpdater}>
        {children}
      </AudioStateUpdateContext.Provider>
    </AudioStateContext.Provider>
  );
}
