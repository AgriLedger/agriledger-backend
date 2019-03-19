const cache = require('./cache.service');

module.exports.get=((req,res,next)=>{
  let value=cache.get(req.url);
  if(value){
    return res.send(value)
  }
  else{

    return next();
  }

});

module.exports.put=((key,value,timeout=300000)=>{

  if(!key || !value){
    return false;
  }
  else{
    cache.put(key,value,timeout)
  }

});

module.exports.timeout={
  assetpool_getinfo:1000*30,
  asset_category:1000*60*5,
  wallet_transactions:1000*60
}
