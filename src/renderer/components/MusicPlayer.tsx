import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Player from './Player';

import { useAudioState } from './contexts/AudioStateContext';
import { shuffle } from '../utils';

const voidSong: MusicPlayer.Song = {
  id: '',
  title: '',
  url: '',
  mainArtist: {
    id: '',
    name: '',
  },
};

export default function MusicPlayer() {
  const audioState = useAudioState();
  const [playList, setPlayList] = useState<MusicPlayer.PlayList>([voidSong]);
  const playOrder = useRef<number[]>([0]);
  const [playIndex, setPlayIndex] = useState<number>(0);
  const [shouldPlay, setShouldPlay] = useState(true);

  const currentSong = useMemo(
    () => playList[playOrder.current[playIndex]],
    [playIndex, playList, playOrder]
  );

  const onNextSong = useCallback(
    (repeat = true) => {
      console.debug('On Next');
      console.debug({ playIndex, playOrder });
      if (playIndex < playOrder.current.length - 1) {
        console.debug('increasing');
        setPlayIndex((i) => i + 1);
        setShouldPlay(true);
        return true;
      }
      setPlayIndex(0);
      setShouldPlay(repeat);
      return repeat;
    },
    [playIndex, playOrder]
  );

  const onPreviousSong = useCallback(() => {
    if (playIndex > 0) {
      setPlayIndex((i) => i - 1);
    } else {
      setPlayIndex((i) => i);
    }
  }, [playIndex]);

  const onLoadSong = () => {
    console.debug('On load song called!!!');
    window.electron.ipcRenderer.send('select-songs');
  };

  useEffect(() => {
    window.electron.ipcRenderer.on(
      'songs-selected',
      async (filePath: string[]) => {
        const songs = await Promise.all(
          filePath.map(window.electron.loadSongMetaDataFromPath)
        );
        console.debug({ songs });
        setPlayList(songs);
      }
    );
  }, []);

  useEffect(() => {
    if (audioState.shuffleEnabled) {
      playOrder.current = playList.map((_value, index) => index);
      playOrder.current = shuffle(playOrder.current, playIndex);
      setPlayIndex(0);
    } else {
      setPlayIndex(playOrder.current[playIndex]);
      playOrder.current = playList.map((_value, index) => index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioState.shuffleEnabled, playList]);

  return (
    <div>
      <button onClick={onLoadSong} type="button">
        Load Song
      </button>
      <input
        onClick={(e) => {
          console.log(e);
        }}
        type="checkbox"
      />
      <Player
        song={currentSong}
        shouldPlay={shouldPlay}
        onNextSong={onNextSong}
        onPreviousSong={onPreviousSong}
      />
    </div>
  );
}
