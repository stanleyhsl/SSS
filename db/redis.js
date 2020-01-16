// const redis = require('redis');
const asyncRedis = require("async-redis");
const redisClient = asyncRedis.createClient()

redisClient.on('error', (err) => {
  console.log('redis err: ', err)
})

module.exports = redisClient;