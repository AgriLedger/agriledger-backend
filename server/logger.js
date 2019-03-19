const winston=require('winston');
const ENV=require('./env_variables');
const logger = new (winston.Logger)({
  transports: [
    new winston.transports.Console({ level: ENV.LOG_LEVEL || 'silly' }),
    new winston.transports.File({
      filename: 'combined.log',
      level: 'info'
    })
  ]
});
module.exports=logger;
