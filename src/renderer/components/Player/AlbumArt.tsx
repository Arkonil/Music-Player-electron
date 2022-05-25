import React from 'react';
import image from '../../../../assets/album_art_placeholder.jpg';

type AlbumArtProps = {
  source: string | undefined;
  className?: string;
};

function AlbumArt({ source, className = '' }: AlbumArtProps) {
  return (
    <div className={`player__album-art ${className}`}>
      <img src={source ?? image} alt={image} />
    </div>
  );
}

AlbumArt.defaultProps = {
  className: '',
};

export default React.memo(AlbumArt);
