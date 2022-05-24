/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import Text from '../common/Text';
// import classes from '../../style/Player.module.scss';

// Change to react-router
import Link from '../common/Link';

interface SongDetailsProps {
  song: MusicPlayer.Song;
  className?: string;
}

function SongDetails({ song, className = '' }: SongDetailsProps) {
  const artists: MusicPlayer.SongArtist[] = [song.mainArtist];
  song.otherArtists?.forEach((artist) => {
    if (artist.id !== song.mainArtist.id) {
      artists.push(artist);
    }
  });

  return (
    <div className={`player__song-details ${className}`}>
      <Text animate>
        <Link to={song.id}>{song.title}</Link>
      </Text>
      <Text>
        {artists.map((artist) => (
          <Link key={artist.id} to={artist.id}>
            {artist.name}
          </Link>
        ))}
      </Text>
    </div>
  );
}

SongDetails.defaultProps = {
  className: '',
};

function propsAreEqual(
  prevProps: SongDetailsProps,
  nextProps: SongDetailsProps
): boolean {
  return (
    prevProps.song.id === nextProps.song.id &&
    prevProps.className === nextProps.className
  );
}

export default React.memo(SongDetails, propsAreEqual);
