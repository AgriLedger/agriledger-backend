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
const BLOCKCHAIN_PRIVATE_KEY=require('../../env_variables').BLOCKCHAIN_PRIVATE_KEY;
const BLOCKCHAIN_PUBLIC_KEY=require('../../env_variables').BLOCKCHAIN_PUBLIC_KEY;
const BLOCKCHAIN_TRANSFER_AMOUNT=require('../../env_variables').BLOCKCHAIN_TRANSFER_AMOUNT;

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

const transferACC=async (req,res,next)=>{

  const url=BLOCKCHAIN_URL+'/api/transactions';

  //sender account info
  const sendersPrivateKey=BLOCKCHAIN_PRIVATE_KEY;
  const sendersPublicKey=BLOCKCHAIN_PUBLIC_KEY;
  const currency='ACC';
  const precision =6;
  const transferAmount=BLOCKCHAIN_TRANSFER_AMOUNT;
  const amount=parseFloat((250 * Math.pow(10,precision)).toFixed(0));

  const recipientAddress=req.walletAddress||req.body.walletAddress;
  const remark='Initial ACC Transfer';
  let transaction;

  try {
    let response=await axios.put(url,{
        secret:sendersPrivateKey,
        amount:String(amount),
        recipientId:recipientAddress,
        sendersPublicKey:undefined},
      {headers:{
        version:BLOCKCHAIN_VERSION,
        magic:BLOCKCHAIN_MAGIC
      }});

    if(!response || !response.data || !response.data.success){
      req.isTransferSuccess=false;
      req.transferError=response.data.error;
    }else{
      req.isTransferSuccess=true;
      req.transferError=null;
      req.transactionId=response.data.transactionId;

    }

    return next();
  }
  catch (err){
    req.isTransferSuccess=false;
    req.transferError='We could not create an Account';
    return next();
  }




};


const updateAccountBeforeTransfer= (req,res,next)=>{
  let User=app.models.user;
  let userId=req.userId;// come from first middleware
  User.findById(userId,(err,user)=>{
    user.updateAttributes({
      transferStatus:'pending',
    }, function (err, instance) {
      if (err) {
        return res.status(400).json({message:'We could not create an Account.there was a rare issue.please try again '});
      }
      return next();
    })
  })

};

const updateAccountAfterTransfer= (req,res,next)=>{

  let User=app.models.user;
  let data={};

  if(req.isTransferSuccess){
     data={
      privateKey:req.privateKey,
      publicKey:req.publicKey,
      walletAddress:req.walletAddress,
      isRegisteredOnBlockchain:true,
      transactionId:req.transactionId,
      transferStatus:'completed'
    };
  }
  else{
    data={transferStatus:'failed'}
  }

  User.findById(req.userId,(err,user)=>{
    user.updateAttributes(data, function (err, instance) {
      if (err) {
        if(req.isTransferSuccess)
          return res.status(400).json({message:'This was a rare issue where ACC has been transferred,but we could not update an account.please contact us'});
        else
          return res.status(400).send({message:'We could not create an account'});

      }
      else{
        if(req.isTransferSuccess)
        return res.json({isRegisteredOnBlockchain:true,walletAddress:req.walletAddress,publicKey:req.publicKey});
        else
          return res.status(400).send({message:req.transferError})
      }
    })
  })

};


const updateUserAsIssuer= (req,res,next)=>{
  let User=app.models.user;
  let userId=req.userId;// come from first middleware
  let privateKey=req.privateKey;// come from second middleware
  User.findById(userId,(err,user)=>{
    user.updateAttributes({
      isIssuerOnBlockchain:true,
      issuerName:req.issuerName
    }, function (err, instance) {
      if (err) {
        return res.status(400).json({message:'We could not create an Issuer'});
      }
      else{
        return res.json({});
      }
    })
  })

};



const checkIfUserAlreadyHasAccount= (req,res,next)=>{

  let User=app.models.user;
  let userId=req.userId;// come from first middleware

  User.findById(userId,(err,user)=>{
    if(!user){
      return res.status(400).json({message:'User is not yet registered on Agriledger'});
    }
    if(user.isRegisteredOnBlockchain){
      return res.status(400).json({message:'You already have registered an account on Blockchain'});
    }

    if(user.transferStatus==='pending'){
      return res.status(400).json({message:'Wait..previous transaction is already on the way'});
    }

    return next();

  })

};


const checkIfUserAlreadyIssuer= (req,res,next)=>{
  let User=app.models.user;
  let userId=req.userId;// come from first middleware

  User.findById(userId,(err,user)=>{
    if(!user){
      return res.status(400).json({message:'User is not yet registered on Agriledger'});
    }
    if(!user.isRegisteredOnBlockchain){
      return res.status(400).json({message:'You are not registered on blockchain'});
    }

    if(user.isIssuerOnBlockchain){
      return res.status(400).json({message:'You are already an issuer'});
    }
    else{
      req.privateKey=user.privateKey;
      return next();
    }


  })

};

const RegisterIssuer=async (req,res,next)=>{

  if(!req.body.name || ! req.body.description){
    return res.status(400).send({message:'Bad request'});
  }
  let name=req.body.name;
  let description=req.body.description;
  let privateKey=req.privateKey;
  let transaction;
  const url=BLOCKCHAIN_URL+'/peer/transactions';

  try{
    transaction = AschJS.uia.createIssuer(name, description, privateKey, undefined)
  }
  catch (err){
    let errmsg=errorHandler.getError(err,'We could not create an Issuer.txn payload failed');
    return res.status(400).send({message:errmsg});
  }

  try {
    let response=await axios.post(url,{transaction:transaction},{headers:{version:BLOCKCHAIN_VERSION,magic:BLOCKCHAIN_MAGIC}});

    if(!response || !response.data || !response.data.success){
      return res.status(400).json({message:response.data.error});
    }
    req.issuerName=name;
    return next();
  }
  catch (err){
    let errmsg=errorHandler.getError(err,'We could not create an Issuer.failed from blockchain');
    return res.status(400).send({message:errmsg});
  }

}

const generatePrivateKey=async(req,res,next)=>{

  const url=BLOCKCHAIN_URL+'/api/accounts/open2';
  let privateKey;
  let publicKey;
  try{
    privateKey = new Mnemonic(Mnemonic.Words.ENGLISH).toString();
    publicKey = AschJS.crypto.getKeys(privateKey).publicKey;
  }
  catch (err){
    let errmsg=errorHandler.getError(err,'We could not generate the private key');
    return res.status(400).send({message:errmsg});
  }

  try {
    let response=await axios.post(url,{publicKey:publicKey});
    if(!response || !response.data || !response.data.success){
      return res.status(400).send({message:response.data.error});
    }
    req.privateKey=privateKey;
    req.publicKey=publicKey;
    req.walletAddress=response.data.account.address;
    return next();

  }
  catch (err){
    let errmsg=errorHandler.getError(err,'We could not generate the private key');
    return res.status(400).send({message:errmsg});
  }
};






router.post('/account',[veryfyAccessToken,checkIfUserAlreadyHasAccount,generatePrivateKey,updateAccountBeforeTransfer,transferACC,updateAccountAfterTransfer]);
router.post('/issuer',[veryfyAccessToken,checkIfUserAlreadyIssuer,RegisterIssuer,updateUserAsIssuer]);

module.exports = router;
