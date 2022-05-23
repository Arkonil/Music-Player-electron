import React, { useCallback, useEffect, useRef, useState } from 'react';

// import Components
import ToolTip from './ToolTip';
import AlbumArt from './AlbumArt';
import SongDetails from './SongDetails';
import PlaybackController from './PlaybackController';
import TimeDisplay from '../common/TimeDisplay';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';

// context
import {
  useAudioState,
  useAudioStateUpdater,
} from '../contexts/AudioStateContext';
import { useTheme } from '../contexts/ThemeContext';

// import styles
import classes from '../../style/Player.module.scss';

interface PlayerProps {
  song: MusicPlayer.Song;
  shouldPlay: boolean;
  onPreviousSong: () => void;
  onNextSong: (repeat?: boolean) => boolean;
}

function Player({
  song,
  shouldPlay,
  onPreviousSong,
  onNextSong,
}: PlayerProps): JSX.Element {
  // #region Hooks and callbacks
  // contexts
  const audioState = useAudioState();
  const audioStateUpdater = useAudioStateUpdater();
  const { theme } = useTheme();

  // DOM Refs
  const toolTipRef = useRef(document.createElement('div'));

  // import from a settings.json file
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setMuted] = useState(false);

  const [currentProgress, setCurrentProgress] = useState<number>(0);

  // Audio Player
  const audioElementRef = useRef(new Audio());
  audioElementRef.current.volume = volume;
  audioElementRef.current.muted = isMuted;
  // audioElementRef.current.autoplay = true;
  const audioContext = useRef(new AudioContext());
  const [arrayData, setArrayData] = useState(new Float32Array(1000));
  const shouldRecalculate = useRef(true);

  const handleShuffleButtonClick = useCallback(() => {
    console.debug('handleShuffleButtonClick called');
    audioStateUpdater.toggleShuffle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPlay = useCallback(() => {
    console.debug('onPlay called');
    audioElementRef.current
      .play()
      .then(() => {
        audioStateUpdater.togglePlaying(true);
        return null;
      })
      .catch((error) => {
        console.error('Error playing audio', error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPause = useCallback(() => {
    console.debug('onPause called');
    audioElementRef.current.pause();
    audioStateUpdater.togglePlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAudioStateChange = useCallback(() => {
    console.debug('handleAudioStateChange called');
    if (audioState.isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  }, [audioState.isPlaying, onPause, onPlay]);

  const handleRepeatButtonClick = useCallback(async () => {
    console.debug('handleRepeatButtonClick called');
    // off -> all -> one -> off
    setRepeat((prevState) => {
      switch (prevState) {
        case 'all':
          audioElementRef.current.loop = true;
          return 'one';
        case 'one':
          audioElementRef.current.loop = false;
          return 'off';
        case 'off':
          audioElementRef.current.loop = false;
          return 'all';
        default:
          console.error(`Repeat State have illegal value: ${prevState}`);
          return 'off';
      }
    });
  }, []);

  const changeProgressTo = useCallback(async (value: number) => {
    console.debug('changeProgressTo called');
    if (audioElementRef.current.duration) {
      audioElementRef.current.currentTime =
        value * audioElementRef.current.duration;
      setCurrentProgress(audioElementRef.current.currentTime);
    }
  }, []);

  const handleTooltip = useCallback(
    async (
      e: React.MouseEvent<HTMLCanvasElement>,
      value: number,
      isMouseOver: boolean
    ) => {
      if (!isMouseOver) {
        toolTipRef.current.hidden = true;
      } else {
        toolTipRef.current.hidden = false;
        const position = e.pageX / document.body.clientWidth;

        toolTipRef.current.style.left = `calc(${100 * position}% - ${
          toolTipRef.current.clientWidth / 2
        }px)`;

        const seconds = Math.round(
          value * audioElementRef.current.duration || 0
        );
        const date = new Date(seconds * 1000);
        let displayString = '';
        if (seconds > 3600) {
          displayString = date.toISOString().substring(11, 19);
        } else {
          displayString = date.toISOString().substring(14, 19);
        }
        toolTipRef.current.children[0].textContent = displayString;
      }
    },
    []
  );

  const handleVolumeChange = useCallback((value: number) => {
    console.debug('handleVolumeChange called');
    try {
      audioElementRef.current.volume = value;
      setVolume(value);
    } catch (error) {
      console.error({ value, error });
    }
  }, []);

  const handleMutedChange = useCallback(() => {
    console.debug('handleMutedChange called');
    audioElementRef.current.muted = !audioElementRef.current.muted;
    setMuted(audioElementRef.current.muted);
  }, []);

  // For disabling recalculate in every rendering
  useEffect(() => {
    shouldRecalculate.current = false;
  });

  // On Song End event
  useEffect(() => {
    console.debug('On Song End event');
    const audioElement = audioElementRef.current;

    function handleSongEnd() {
      if (repeat === 'all') {
        onNextSong(true);
        onPlay();
      } else if (repeat === 'off') {
        const sp = onNextSong(false)
        if (!sp) {
          audioStateUpdater.togglePlaying(false)
        }
      }
      changeProgressTo(0);
    }

    audioElement.addEventListener('ended', handleSongEnd);
    return () => {
      audioElement.removeEventListener('ended', handleSongEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeProgressTo, onNextSong, onPlay, repeat, shouldPlay]);

  const loadSong = useCallback(async (path: string) => {
    console.debug('LoadSong called');
    const audioElement = audioElementRef.current;
    const data = await window.electron.loadSongDataFromPath(path);
    // console.log(data);

    audioElement.src = window.URL.createObjectURL(
      new Blob([data.buffer], { type: 'audio/mp3' })
    );
    audioContext.current
      .decodeAudioData(data.buffer)
      .then((audioBuffer) => {
        if (audioBuffer.numberOfChannels === 2) {
          const channel1 = new Float32Array(audioBuffer.length);
          const channel2 = new Float32Array(audioBuffer.length);
          const array = new Float32Array(audioBuffer.length);
          audioBuffer.copyFromChannel(channel1, 0);
          audioBuffer.copyFromChannel(channel2, 1);
          let i = audioBuffer.length;
          while (i--) {
            array[i] = 0.5 * (channel1[i] + channel2[i]);
          }
          shouldRecalculate.current = true;
          setArrayData(array);
        }
        return audioBuffer;
      })
      .catch((err) => console.error(err));
  }, []);

  // Loading Song
  useEffect(() => {
    console.debug('Loading Song');
    if (song.url) {
      Promise.race([loadSong(song.url)])
        .then(() => shouldPlay && onPlay())
        .catch(console.error);
      // loadSong(song.url);
      // onPlay();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSong, onPlay, song.url]);

  // Timer
  const interval = useRef<number>(0);

  useEffect(() => {
    console.debug('Timer');
    const audioElement = audioElementRef.current;

    function endInterval() {
      clearInterval(interval.current);
    }
    function startInterval() {
      endInterval();
      interval.current = window.setInterval(() => {
        setCurrentProgress(audioElement.currentTime);
      }, 1000);
    }

    audioElement.addEventListener('play', startInterval);
    audioElement.addEventListener('pause', endInterval);
    return () => {
      audioElement.removeEventListener('play', startInterval);
      audioElement.removeEventListener('pause', endInterval);
    };
  }, []);
  // #endregion

  return (
    <div
      className={classes.player}
      style={{
        color: theme.colors.fontColor,
        backgroundColor: theme.colors.backgroundColor,
      }}
    >
      <ToolTip ref={toolTipRef} />
      <AlbumArt source={song.album?.albumArt} />
      <SongDetails song={song} />
      <PlaybackController
        isShuffleOn={audioState.shuffleEnabled}
        onShuffleButtonClick={handleShuffleButtonClick}
        onPreviousButtonClick={onPreviousSong}
        isPlaying={audioState.isPlaying}
        onAudioStateChange={handleAudioStateChange}
        onNextButtonClick={onNextSong}
        repeatState={repeat}
        onRepeatButtonClick={handleRepeatButtonClick}
      />
      <TimeDisplay className={classes.timeDisplay} seconds={currentProgress} />
      <ProgressBar
        array={arrayData}
        currentProgress={
          currentProgress / audioElementRef.current.duration || 0
        }
        shouldRecalculate={shouldRecalculate.current}
        onChange={changeProgressTo}
        toolTipHandler={handleTooltip}
      />
      <TimeDisplay
        className={classes.timeDisplay}
        seconds={audioElementRef.current.duration}
      />
      <VolumeControl
        volume={volume}
        muted={isMuted}
        onVolumeChange={handleVolumeChange}
        onMutedChange={handleMutedChange}
      />
    </div>
  );
}

// export default React.memo(Player);
export default Player;
