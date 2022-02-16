/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import Text from '../common/Text';
import Link from '../common/Link';

type LinkText = {
  name: string;
  link?: string;
};

type PropType = {
  songTitle: LinkText | string;
  songArtists: LinkText[] | string;
  className: string;
};

function SongDetails({ songTitle, songArtists, className }: PropType) {
  console.log('Rendering Song Details');
  return (
    <div className={className}>
      {typeof songTitle === 'string' ? (
        <Text animate>
          <Link href="#">{songTitle}</Link>
        </Text>
      ) : (
        <Text animate>
          <Link href={songTitle.link ?? '#'}>{songTitle.name}</Link>
        </Text>
      )}
      {typeof songArtists === 'string' ? (
        <Text animate>
          <Link href="#">{songArtists}</Link>
        </Text>
      ) : (
        <Text animate>
          {songArtists.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Link key={index} href={item.link ?? '#'}>
              {item.name}
            </Link>
          ))}
        </Text>
      )}
    </div>
  );
}

export default React.memo(SongDetails);
