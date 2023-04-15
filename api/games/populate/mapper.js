module.exports = {
  map: rawGame => ensureObjectIntegrity(rawGame) ?{
      name: rawGame.name,
      publisherId: rawGame.publisher_id,
      platform: rawGame.os,
      storeId: rawGame.app_id,
      bundleId: rawGame.bundle_id,
      appVersion: rawGame.version,
      isPublished: true
    } : null
}

const ensureObjectIntegrity = rawGame => {
  const props = ['name', 'publisher_id', 'os', 'app_id', 'bundle_id', 'version'];
  for (const prop of props) {
    if (!rawGame.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
}
