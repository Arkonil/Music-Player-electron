const mm = require('music-metadata');
const fs = require('fs');

function hashCode(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function uint8toBase64(array) {
  return Buffer.from(array).toString('base64');
}

async function loadSongDataFromPath(path) {
  return fs.readFileSync(path);
}

// TODO: complete loadSongMetaDataFromPath
async function loadSongMetaDataFromPath(path) {
  const rawData = await mm.parseFile(path);
  const metadata = {
    id: hashCode(rawData.common.title ?? '').toString(),
    title: rawData.common.title ?? '',
    url: path,
    duration: rawData.format.duration ?? 0,
    mainArtist: {
      id: hashCode(rawData.common.artist).toString(),
      name: rawData.common.artist,
    },
  };

  if (rawData.common.album) {
    metadata.album = {
      id: hashCode(rawData.common.album).toString(),
      title: rawData.common.album,
      albumArt: rawData.common.picture
        ? `data:${rawData.common.picture[0].format};base64,${uint8toBase64(
            rawData.common.picture[0].data
          )}`
        : '',
    };
  }

  if (rawData.common.artists) {
    metadata.otherArtists = rawData.common.artists.map((artist) => ({
      id: hashCode(artist).toString(),
      name: artist,
    }));
  }

  return metadata;
}

// exports.loadSongDataFromPath = loadSongDataFromPath;
// exports.loadSongMetaDataFromPath = loadSongMetaDataFromPath;

module.exports = {
  loadSongDataFromPath,
  loadSongMetaDataFromPath
}
