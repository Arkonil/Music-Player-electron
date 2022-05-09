import { useEffect, useRef, useState, useCallback, useContext } from 'react';

import { IAudioMetadata } from 'music-metadata';
import AlbumArt from './AlbumArt';
import SongDetails from './SongDetails';
import PlayBackController from './PlaybackController';
import ProgressBar from './ProgressBar';
import TimeDisplay from '../common/TimeDisplay';
import VolumeControl from './VolumeControl';

import { ThemeContext } from '../contexts/ThemeContext';
import classes from './CurrentPlayer.module.scss';

type LinkText = {
  name: string;
  link?: string;
};

type PropType = {
  source: string;
  onNext: () => void;
  onPrev: () => void;
};

function CurrentPlayer({ source, onNext, onPrev}: PropType) {
  const theme = useContext(ThemeContext);

  const [volume, setVolume] = useState(0.5); // Set initial volume
  const [muted, setMuted] = useState(false); // Set initial mute state

  const audio = useRef(new Audio());
  const audioCtx = useRef(new AudioContext());
  // audio.current.autoplay = true;
  audio.current.volume = volume;
  audio.current.muted = muted;

  const toolTipRef = useRef(document.createElement('div'));
  const shouldRecalculate = useRef(true);
  const timeout = useRef(setTimeout(() => {}, 0));
  const interval = useRef<number>();

  const [albumArt, setAlbumArt] = useState('');
  const [song, setSong] = useState<{title: string | LinkText, artists: string | LinkText[], duration: number}>({ title: '', artists: '', duration: 0 });
  const [playing, setPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatState, setRepeatState] = useState('off');

  const [arrayData, setArrayData] = useState(new Float32Array(1000));
  const [currentProgress, setCurrentProgress] = useState(
    audio.current.currentTime
  );

  const handleTooltip = (
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

      const seconds = Math.round(value * song.duration || 0);
      const date = new Date(seconds * 1000);
      let displayString = '';
      if (seconds > 3600) {
        displayString = date.toISOString().substring(11, 19);
      } else {
        displayString = date.toISOString().substring(14, 19);
      }
      toolTipRef.current.children[0].textContent = displayString;
    }
  };

  const changeProgressTo = (value: number) => {
    if (song.duration) {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        audio.current.currentTime = value * audio.current.duration;
        setCurrentProgress(audio.current.currentTime);
      }, 0);
    }
  };

  const loadSong = useCallback(
    async (filePath: string) => {
      // Metadata Loading
      window.electron.mm
        .parseFile(filePath)
        .then((rawData: IAudioMetadata) => {
          setSong({
            // title: rawData.common.title ?? '',
            title: {name: rawData.common.title ?? '', link: '#'},
            // artists: rawData.common.artist ?? '',
            artists: rawData.common.artists?.map((name) => ({name, link: '#'})) ?? 'No Artist',
            duration: rawData.format.duration || audio.current.duration || 0,
          });
          let pictureData;
          if (rawData.common.picture) {
            pictureData = `data:${
              rawData.common.picture[0].format
            };base64,${window.electron.utils.uint8toBase64(
              rawData.common.picture[0].data
            )}`;
          } else {
            pictureData = '';
          }
          setAlbumArt(pictureData);
          return rawData;
        })
        .catch((err: Error) => {
          console.error(err);
        });

      // Audio Data Loading
      const u8array: Uint8Array = window.electron.fs.readFileSync(filePath);
      audio.current.src = window.URL.createObjectURL(
        new Blob([u8array.buffer], { type: 'audio/mp3' })
      );
      if (playing) {
        audio.current.play();
      }
      // audio.current.play();
      // setPlaying(true);
      audioCtx.current
        .decodeAudioData(u8array.buffer)
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
        .catch(console.log);
    },
    [playing]
  );

  const onPlay = useCallback(async () => {
    await audio.current.play();
    setPlaying(true);
  }, []);

  const onPause = useCallback(() => {
    audio.current.pause();
    setPlaying(false);
  }, []);

  const handleShuffleButtonClick = useCallback(() => {
    setShuffle((prevState) => !prevState);
  }, []);

  const handleRepeatButtonClick = useCallback(() => {
    setRepeatState((prevState) => {
      if (prevState === 'all') {
        audio.current.loop = true;
        return 'one';
      }
      audio.current.loop = false;
      if (prevState === 'off') return 'all';
      return 'off';
    });
  }, []);

  const handleAudioStateChange = useCallback(() => {
    if (playing) {
      console.log('pausing song');
      onPause();
    } else if (audio.current.readyState >= 2) {
      console.log('playing song');
      onPlay();
    }
  }, [onPause, onPlay, playing]);

  const handlePrevBtnClick = onPrev;
  const handleNextBtnClick = onNext;

  const handleVolumeChange = useCallback((value: number) => {
    try {
      audio.current.volume = value;
      setVolume(value);
    } catch (error) {
      console.error({ value, error });
    }
  }, []);
  const handleMutedChange = useCallback(() => {
    audio.current.muted = !audio.current.muted;
    setMuted(audio.current.muted);
  }, []);

  useEffect(() => {
    if (source) {
      loadSong(source);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  useEffect(() => {
    shouldRecalculate.current = false;
  });

  useEffect(() => {
    audio.current.addEventListener('play', () => {
      clearInterval(interval.current);
      interval.current = window.setInterval(() => {
        setCurrentProgress(audio.current.currentTime);
      }, 1000);
    });

    audio.current.addEventListener('pause', () => {
      clearInterval(interval.current);
    });

    audio.current.addEventListener('ended', () => {
      console.log('song ended');
      clearInterval(interval.current);
      setCurrentProgress(0);
      setPlaying(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={classes.currentPlayer}
      style={{
        backgroundColor: theme.colors.backgroundColor,
        color: theme.colors.fontColor,
      }}
    >
      <div className={classes.toolTip}>
        <div ref={toolTipRef} hidden>
          <div style={{backgroundColor: theme.colors.toolTipColor, color: 'black'}}/>
          <div style={{borderTopColor: theme.colors.toolTipColor}}/>
        </div>
      </div>

      <AlbumArt source={albumArt} className={classes.albumArt} />

      <SongDetails
        songTitle={song.title}
        songArtists={song.artists}
        className={classes.songDetails}
      />
      <PlayBackController
        onShuffleButtonClick={handleShuffleButtonClick}
        onPreviousButtonClick={handlePrevBtnClick}
        onNextButtonClick={handleNextBtnClick}
        onRepeatButtonClick={handleRepeatButtonClick}
        onAudioStateChange={handleAudioStateChange}
        isPlaying={playing}
        isShuffleOn={shuffle}
        repeatState={repeatState}
      />
      <TimeDisplay className={classes.timeDisplay} seconds={currentProgress}/>
      <ProgressBar
        array={arrayData}
        shouldRecalculate={shouldRecalculate.current}
        currentProgress={currentProgress / song.duration || 0}
        onChange={changeProgressTo}
        barGap={1}
        barWidth={2}
        shadowLength={0.5}
        toolTipHandler={handleTooltip}
      />
      <TimeDisplay className={classes.timeDisplay} seconds={song.duration}/>
      <VolumeControl
        volume={volume}
        muted={muted}
        onVolumeChange={handleVolumeChange}
        onMutedChange={handleMutedChange}
      />
    </div>
  );
}

export default CurrentPlayer;
