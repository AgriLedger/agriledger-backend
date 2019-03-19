const AschJS = require('../../../scripts/acchain');
const Mnemonic = require('bitcore-mnemonic');
const express = require('express');
const app = require('../../server');
const fs=require('fs');
const path=require('path');
const normalizeUrl=require('../normalizeUrlParams').normalize;
const router = express.Router();
const axios=require('axios');
const BLOCKCHAIN_URL=require('../../env_variables').BLOCKCHAIN_URL;
const BLOCKCHAIN_MAGIC=require('../../env_variables').BLOCKCHAIN_MAGIC;
const BLOCKCHAIN_VERSION=require('../../env_variables').BLOCKCHAIN_VERSION;
const async=require('async');
const cache = require('../cache.middleware');
const errorHandler=require('../errorhandler')

const veryfyAccessToken=(req,res,next)=>{

  if(!req.headers['x-access-token'])
  {
    return res.status(401).send({message:'Bad request.No access token is present'})
  }

  let accessToken=req.headers['x-access-token'];
  let AccessToken=app.models.AccessToken;
  AccessToken.resolve(accessToken,(err,resolved)=>{
    if(err){
      return res.status(401).send({});
    }

    if(!resolved)
      return res.status(401).send({});

    req.userId=resolved.userId;
    return next();
  })

};


const getPrivateKey=(req,res,next)=>{
  let User=app.models.User;
  let userId=req.userId;// come from first middleware
  User.findById(userId,(err,user)=>{
    if(!user){
      return res.status(400).json({message:'User is not yet registered on Agriledger'});
    }
    if(!user.isRegisteredOnBlockchain){
      return res.status(400).json({message:'You is not registered on Blockchain'});
    }
    if(!user.isIssuerOnBlockchain){
      return res.status(400).json({message:'You is not asn issuer on Blockchain'});
    }
    else{
      req.privateKey=user.privateKey;
      req.issuerName=user.issuerName;

    }
      return next();
  })
};

const createPool=async(req,res,next)=>{
  let AssetPool=app.models.assetpool;
  let pool=req.body;
  pool.issuerName=req.issuerName;
  pool.isPutOnBlockchain=true;

  AssetPool.create(pool,(err,pool)=>{
    if(err){
      return res.status(400).send({message:'Asset Pool has been put on the blockchain,but could not be saved'});
    }else{
      req.assetPoolId=pool.id;
      return next();
    }
  })

}




const putInBlockchain=async(req,res,next)=>{

  const pool=req.body;


  let extra = JSON.stringify(pool.extra);

  let payload;

  try{
    payload = {
      name: req.issuerName.toString(),
      currency: (pool.chainOrNot ? pool.currency : req.issuerName + '.' + pool.currency).toString(),
      desc: pool.desc.toString(),
      category:pool.categoryId.toString(),
      precision: Number(pool.precision),
      maximum: (parseInt(pool.maximum) * Math.pow(10, pool.precision)).toString(),
      estimateUnit:  pool.estimateUnit.toString(),
      estimatePrice: pool.estimatePrice.toString(),
      exerciseUnit: pool.exerciseUnit.toString(),
      unlockCondition: Number(pool.unlockCondition),
      extra: extra
    };

  }

  catch (err){
    let errmsg=errorHandler.getError(err,'Asset pool failed.txn payload could not be generated');
    return res.status(400).send({message:errmsg});
  }


  let privateKey,publicKey,txn,secondPublicKey,url;

  privateKey=req.privateKey;
  url = BLOCKCHAIN_URL+'/peer/transactions';

  try{
    txn = AschJS.uia.createAsset(payload,privateKey,secondPublicKey);

  }
  catch (err){
    return next(err);

  }

  try{
    let response=await axios.post(url,{transaction:txn},  {headers:{version:BLOCKCHAIN_VERSION, magic:BLOCKCHAIN_MAGIC}})
    if(response && response.data && response.data.success){
      return next();

    }
    else{
      return res.status(400).send({message:response.data.error});
    }

  }
  catch (err){
    let errmsg=errorHandler.getError(err,'Asset pool could not be generated.declined from blockchain')
    return res.status(400).send({message:errmsg});
  }


};


const updateFarmer=(req,res,next)=>{

  const assetsId=req.body.assetsId||[];


  async.eachSeries(assetsId,(id,callback)=>{
    let Asset=app.models.asset;
    Asset.findById(id,(err,asset)=>{
      asset.updateAttributes({
        isPutOnBlockchain:true,
        status:'pooled',
        assetPoolId:req.assetPoolId
      }, function (err, instance) {
        if (err) {

          return callback('We could not update the all farmer');
        }
        else{
          return callback();
        }
      })
    })

  },(err,result)=>{
    if(err){
      return res.status(400).send({message:'Pool has been created,but farmer could not be updated'})
    }
    else{
      return res.send({});

    }

  })
};

const validateJson=(req,res,next)=>{
  "use strict";
  let pool=req.body;
  pool.issuerName=req.issuerName;
  let AssetPool=app.models.assetpool;
  let instance=new AssetPool(pool);
  if(instance.isValid()){
    return next();
  }
  else{
    return res.status(400).send({message:'Invalid field'});
  }


}

const issueToken=async(req,res,next)=>{

  if(!req.body.assetPoolId || !req.body.amount || !req.body.exchangeRate || !req.body.precision || !req.body.currency){
    return res.status(400).send({message:'Bad request'});
  }


  let url,txn;
  url = BLOCKCHAIN_URL+'/peer/transactions';

  try{
    const realAmount = parseInt(req.body.amount,10) * Math.pow(10, req.body.precision);

    const exchangeRate = req.body.exchangeRate.toString();
    const currency=req.body.currency;

    txn = AschJS.uia.createIssue(currency, String(realAmount), exchangeRate,req.privateKey,req.secondPublicKey);

  }
  catch (err){
    let errmsg=errorHandler.getError(err,'Token could not be issued because txn payload could not be generated');
    return res.status(400).send({message:errmsg});
  }

  try{
    let response=await axios.post(url,{transaction:txn},  {headers:{version:BLOCKCHAIN_VERSION, magic:BLOCKCHAIN_MAGIC}})
    if(response && response.data && response.data.success){
      req.transactionId=response.data.transactionId;
      return next();

    }
    else{
      return res.status(400).send({message:response.data.error});
    }

  }
  catch (err){
    let errmsg=errorHandler.getError(err,'Token could not be issued because it got declined from blockchain');
    return res.status(400).send({message:errmsg});
  }
};


const saveToken=async(req,res,next)=>{
  let Token=app.models.token;
  let userId=req.userId;// come from first middleware

  let data={
    assetpoolId:req.body.assetPoolId,
    amount:req.body.amount,
    exchangeRate:req.body.exchangeRate,
    created:new Date(),
    userId:req.userId||req.body.userId,
    transactionId:req.transactionId,
    issuerName:req.issuerName
  };
  Token.create(data,(err,token)=>{
    if (err) {
      return res.status(400).json({message:'Token has been issued but we could not update it our system.please contact us'});
    }
    else{
      return res.json({});
    }
  })
}

const getAssetinfo=async (req,res)=>{

  if(!req.query.assetName){
    return res.status(400).send({message:'Bad request'});
  }

  const assetName=req.query.assetName;
  const url = `${BLOCKCHAIN_URL}/api/uia/assets/${assetName}`;

  try{
    let response=await axios.get(url, {headers:{version:BLOCKCHAIN_VERSION, magic:BLOCKCHAIN_MAGIC}})
    if(response && response.data && response.data.success){
      cache.put(req.url,response.data.asset,cache.timeout.assetpool_getinfo);
      return res.send(response.data.asset);
    }
    else{
      return res.status(400).send({message:response.data.error});
    }

  }
  catch (err){
    let errmsg=errorHandler.getError(err,'We could not get the asset info from blockchain');
    return res.status(400).send({message:errmsg});
  }



};
router.get('/getinfo', cache.get,getAssetinfo);

router.post('/create',[veryfyAccessToken,getPrivateKey,validateJson,putInBlockchain,createPool,updateFarmer]);

router.post('/issueToken',[veryfyAccessToken,getPrivateKey,issueToken,saveToken])


module.exports = router;
