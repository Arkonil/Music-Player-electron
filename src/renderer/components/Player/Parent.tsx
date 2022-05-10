import { useState, useEffect } from 'react';
import CurrentPlayer from './Player';

class CircularArray<T> extends Array<T> {
  circularAt(i: number): T {
    const pos = ((i % this.length) + this.length) % this.length;
    const item = this[pos];
    if (item !== undefined) {
      return item;
    }
    throw new Error('');
  }

  shuffle(): CircularArray<T> {
    for (let j, i = this.length - 1; i > 0; i--) {
      j = (Math.random() * (i + 1)) | 0;
      [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
  }
}

function Parent() {
  const [filePaths, setFilePaths] = useState(new CircularArray(''));
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  useEffect(() => {
    window.electron.ipcRenderer.on('songs-selected', (filePath: string[]) => {
      setFilePaths(new CircularArray(...filePath));
    });
  }, []);

  const onLoadSong = () => {
    console.debug('On load song called!!!');
    window.electron.ipcRenderer.send('select-songs');
  };

  const onNext = () => {
    setCurrentSongIndex((prevValue) => prevValue + 1);
  };

  const onPrev = () => {
    setCurrentSongIndex((prevValue) => prevValue - 1);
  };
  console.log(filePaths);
  return (
    <div>
      <button type="button" onClick={onLoadSong}>
        Load Song
      </button>
      {/* {filePaths.forEach(item => <p>{item}</p>)} */}
      <CurrentPlayer
        source={filePaths.circularAt(currentSongIndex)}
        onNext={onNext}
        onPrev={onPrev}
      />
    </div>
  );
}

export default Parent;
