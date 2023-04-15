const db = require('../../../models');
const Platforms = require('../platform');
const mapper = require('./mapper');

module.exports = async (req, res) => {
  const gamesPromises = [];
  
  Object.values(Platforms).forEach(platform => {
      const platformPromise = fetchGamesByPlatform(platform);
      gamesPromises.push(platformPromise);
    }
  );
  
  // just make one flatten array after spawn all platforms promises
  const games = (await Promise.all(gamesPromises)).flat(2);
  const itemPerBulk = 3;
  let offset = 0;
  
  do {
    const bucket = sliceMap(games, offset, itemPerBulk);
    
    try {
      await db.Game.bulkCreate(bucket);
    } catch (err) {
      console.error(`Error while saving bulk of games on offset: ${offset}). Given error "${err.message}".`)
    }
    
    // little trick to stop bulk
    // because no pagination has been implemented yet
    if (offset > games.length / 6) {
      console.info('Bypassing the rest because lack of pagination front side.')
      break;
    }
    // end trick

    offset += itemPerBulk;
  } while (offset <= games.length);
  
    res.status(204).send();
}

const sliceMap = (items, offset, itemPerBulk) => {
  const bucket = [];
  
  for (let i = 0; i < items.length; i++) {
    if (i >= offset) {
      const mappedItem = mapper.map(items[i]);
      if (!!mappedItem) {
        bucket.push(mappedItem);
      }
      if (i + 1 > offset + itemPerBulk) {
        break;
      }
    }
  }
  
  return bucket;
}

const fetchGamesByPlatform = platform => {
  const baseUri = 'https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com'
  const url = `${baseUri}/${platform}.top100.json`

   return fetch(url)
     .then(res => res.json())
     .catch(err => {
       console.error(`An error occurred while fetching games from "${url}". Given error: "${err.message}".`)
     }
   );
}
