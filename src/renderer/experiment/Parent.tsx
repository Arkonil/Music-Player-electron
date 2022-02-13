import { useState, useEffect } from 'react';
import './Color';

function Parent() {
  const [path, setPath] = useState('');

  const onClick = () => {
    window.electron.ipcRenderer.send('select-file');
  }

  useEffect(() => {
    console.log("in use effect");
    window.electron.ipcRenderer.on('file-selected', (message: string[]) => {
      console.log({message});
      setPath(message[0]);
    })
  }, [])

  return (
    <div>
      <p>{path}</p>
      <button onClick={onClick} type="button">Click Me</button>
    </div>
  );
}

export default Parent;
