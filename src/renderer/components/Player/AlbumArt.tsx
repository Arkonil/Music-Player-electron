import React from 'react';
import image from '../../../../assets/album_art_placeholder.jpg';
import classes from './PlayerStyles.module.scss';

type AlbumArtProps = {
  source: string | undefined;
  className?: string;
};

function AlbumArt({ source, className = '' }: AlbumArtProps) {
  // console.log('Rendering AlbumArt');
  return (
    <div className={`player__album_art ${classes.albumArt} ${className}`}>
      <img src={source ?? image} alt={image} />
    </div>
  );
}

AlbumArt.defaultProps = {
  className: '',
};

export default React.memo(AlbumArt);
// export default AlbumArt;
