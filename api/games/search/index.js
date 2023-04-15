const db = require('../../../models');
const Platforms = require('../platform');
const { Op } = require('sequelize');

module.exports = async (req, res) => {
  const { name, platform } = req.body;
  const where = {};
  
  if (name.length > 0) {
    where.name = {
      [Op.like]: `%${name}%`
    };
  }
  
  const platformExists = Object.values(Platforms).includes(platform);
  if (platformExists) {
    where.platform = {
      [Op.eq]: platform
    };
  }
  
  const searchable = Object.keys(where).length;
  
  try {
    const games = await db.Game.findAll(searchable ? { where } : {})
    return res.send(games)
  } catch (err) {
    console.error('***Error searching games', err);
    return res.status(400).send(err);
  }
}
