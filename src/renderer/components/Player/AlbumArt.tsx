import React from 'react';
import image from '../../../../assets/album_art_placeholder.jpg';

type AlbumArtProps = {
  source: string;
  className: string;
};

function AlbumArt({ source, className }: AlbumArtProps) {
  console.log('Rendering AlbumArt');
  return (
    <div className={className}>
      <img src={source || image} alt={image} />
    </div>
  );
}

export default React.memo(AlbumArt);
// export default AlbumArt;
