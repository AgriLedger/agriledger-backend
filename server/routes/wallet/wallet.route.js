const AschJS = require('../../../scripts/acchain');
const express = require('express');
const app = require('../../server');
const normalizeUrl=require('../normalizeUrlParams').normalize;
const router = express.Router();
const axios=require('axios');
const BLOCKCHAIN_URL=require('../../env_variables').BLOCKCHAIN_URL;
const BLOCKCHAIN_MAGIC=require('../../env_variables').BLOCKCHAIN_MAGIC;
const BLOCKCHAIN_VERSION=require('../../env_variables').BLOCKCHAIN_VERSION;
const errorHandler=require('../errorhandler')
const cache = require('../cache.middleware');

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
  let userId=req.userId;
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

const getAccount=async (req,res,next)=>{
  const walletAddress=req.query.address;
  if(!req.query.address){
    return res.status(400).send({message:'Bad request.Wallet address is required'});
  }
  const url=BLOCKCHAIN_URL+'/api/accounts?address='+walletAddress;

  try {
    let response=await axios.get(url,{headers:{version:BLOCKCHAIN_VERSION,magic:BLOCKCHAIN_MAGIC}});

    if(!response || !response.data || !response.data.success){
      return res.status(400).json({message:response.data.error});
    }

    return res.send(response.data.account);
  }
  catch (err){
    let errmsg=errorHandler.getError(err,'We could not get the account from blockchain');
    return res.status(400).send({message:errmsg});
  }
};


const getTransactions=async (req,res,next)=>{
  if(!req.query.senderPublicKey || !req.query.recipientId){
    return res.status(400).send({message:'Bad request.Public key or wallet address is required'})
  }
  req.query.orderBy='t_timestamp:desc';
  req.query.limit=100;
  req.query.offset=0;

  let url = BLOCKCHAIN_URL+'/api/transactions';
  let data = req.query || {};
  url=normalizeUrl(url,data);
  try {
    let response=await axios.get(url,{headers:{version:BLOCKCHAIN_VERSION,magic:BLOCKCHAIN_MAGIC}});

    if(!response || !response.data || !response.data.success){
      return res.status(400).json({message:response.data.error});
    }


    response.data.transactions.forEach((txn)=>{
      txn.timestamp=AschJS.utils.format.fullTimestamp(txn.timestamp);
    });

    cache.put(req.url,response.data.transactions,cache.timeout.wallet_transactions);
    return res.send(response.data.transactions);
  }
  catch (err){
    let errmsg=errorHandler.getError(err,'We could not get the transactions from blockchain');
    return res.status(400).send({message:errmsg});
  }
};


const sendToken=async(req,res,next)=>{
  let url = BLOCKCHAIN_URL+'/peer/transactions';
  const payload=req.body||{};
  let transaction;
 //{toAddress:this.transaction.toAddress,amount:amount,currency:currency,remark:this.transaction.remark}

  try{
    transaction = AschJS.transaction.createTransaction(
      String(payload.toAddress),
      payload.amount.toString(),
      payload.currency,
      payload.remark,
      req.privateKey,
      req.secondPublicKey);
  }

  catch (err){
    let errmsg=errorHandler.getError(err,'Transfer failed.could not generate the txn payload');
    return res.status(400).send({message:errmsg});
  }



  try {
    let response=await axios.post(url,{transaction:transaction},{headers:{version:BLOCKCHAIN_VERSION,magic:BLOCKCHAIN_MAGIC}});

    if(!response || !response.data || !response.data.success){
      return res.status(400).json({message:response.data.error});
    }

    return res.send({success:true});
  }
  catch (err){

    let errmsg=errorHandler.getError(err,'Transfer failed from blockchain');
    return res.status(400).send({message:errmsg});

  }
};

router.get('/account',getAccount);

router.get('/transactions',[cache.get,getTransactions]);

router.post('/send',[veryfyAccessToken,getPrivateKey,sendToken]);


module.exports = router;
