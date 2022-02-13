import { useState, useEffect } from 'react';
import CurrentPlayer from './CurrentPlayer';

function Parent() {
  const [filePath, setFilePath] = useState('');

  useEffect(() => {
    window.electron.ipcRenderer.on(
      'file-selected',
      (filePaths: string[]) => {
        setFilePath(filePaths[0]);
      }
    );
  }, []);

  const onLoadSong = () => {
    console.log("On load song called!!!")
    window.electron.ipcRenderer.send('select-file')
  }

  return (
    <div>
      <button type="button" onClick={onLoadSong}>Load Song</button>
      <p>{filePath}</p>
      <CurrentPlayer source={filePath} />
    </div>
  );
}

export default Parent;
