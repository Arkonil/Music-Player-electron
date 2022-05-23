declare namespace MusicPlayer {
  type SongAlbum = {
    id: string;
    title: string;
    albumArt?: string;
  };

  type SongArtist = {
    id: string;
    name: string;
  };

  export interface Song {
    id: string;
    title: string;
    url: string;
    album?: SongAlbum;
    mainArtist: SongArtist;
    otherArtists?: SongArtist[];
  }

  type RepeatState = 'off' | 'all' | 'one';

  type PlayList = Song[];
}

interface OnlyChildrenProp {
  children: React.ReactNode;
}
