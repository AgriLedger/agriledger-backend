const chalk=require('chalk');

if(process.env.NODE_ENV==='staging' || process.env.NODE_ENV==='production'){
  if(!process.env.BLOCKCHAIN_URL){
    throw new Error('BLOCKCHAIN_URL environment variable is not set')
  }
  else {
    console.log(chalk.green(`blockchain url is ${process.env.BLOCKCHAIN_URL}`))
  }

  if(!process.env.BLOCKCHAIN_MAGIC){
    throw new Error('BLOCKCHAIN_MAGIC environment variable is not set')
  }
  else {
    console.log(chalk.green(`blockchain magic is ${process.env.BLOCKCHAIN_MAGIC}`))
  }

  if(!process.env.BLOCKCHAIN_VERSION){
    throw new Error('BLOCKCHAIN_VERSION environment variable is not set')
  }
  else {
    console.log(chalk.green(`blockchain version is ${process.env.BLOCKCHAIN_VERSION}`))
  }

  if(!process.env.BLOCKCHAIN_PRIVATE_KEY){
    throw new Error('BLOCKCHAIN_PRIVATE_KEY environment variable is not set')
  }
  else {
    console.log(chalk.green(`private key is ${process.env.BLOCKCHAIN_PRIVATE_KEY}`))
  }

  if(!process.env.BLOCKCHAIN_PUBLIC_KEY){
    throw new Error('BLOCKCHAIN_PUBLIC_KEY environment variable is not set')
  }
  else {
    console.log(chalk.green(`public key is ${process.env.BLOCKCHAIN_PUBLIC_KEY}`))
  }
  if(!process.env.BLOCKCHAIN_TRANSFER_AMOUNT){
    throw new Error('BLOCKCHAIN_TRANSFER_AMOUNT environment variable is not set')
  }
  else {
    console.log(chalk.green(`amount to trasnfer is ${process.env.BLOCKCHAIN_TRANSFER_AMOUNT}`))
  }
}



module.exports={
  ADMIN_EMAIL:process.env.ADMIN_EMAIL||'',
  ADMIN_PASSWORD:process.env.ADMIN_PASSWORD||'',
  ADMIN_PHONE:process.env.ADMIN_PHONE,
  OPS_EMAIL:process.env.OPS_EMAIL||'ops@agriledger.co',
  OPS_PASSWORD:process.env.OPS_PASSWORD||'admin!234',
  OPS_PHONE:process.env.OPS_PHONE||'9876543210',

  LOG_LEVEL:process.env.LOG_LEVEL||'silly',
  BLOCKCHAIN_URL:process.env.BLOCKCHAIN_URL || 'http://188.166.196.195:5000',
  BLOCKCHAIN_MAGIC:process.env.BLOCKCHAIN_MAGIC || '8e9b66ed' ,
  BLOCKCHAIN_VERSION:process.env.BLOCKCHAIN_VERSION || '1.0.5',
  BLOCKCHAIN_PRIVATE_KEY:process.env.BLOCKCHAIN_PRIVATE_KEY || 'maximum dash head diary peasant mad gorilla balcony term stool kiwi invest',
  BLOCKCHAIN_PUBLIC_KEY:process.env.BLOCKCHAIN_PUBLIC_KEY || 'f4305a724b1e2abd764641e0812e2dcf8582e4c3d437881e2912d884585cada3',
  BLOCKCHAIN_TRANSFER_AMOUNT:process.env.BLOCKCHAIN_TRANSFER_AMOUNT || 250,
  OPEN_WEATHER_API_KEY:process.env.OPEN_WEATHER_API_KEY ||'114488ec62b88cc24d9096014c47b63c'
};
