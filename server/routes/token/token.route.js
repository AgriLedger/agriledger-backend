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
const errorHandler=require('../errorhandler')

const getTokenByAddress=async(req,res,next)=>{

  if(!req.query.address){
    return res.status(400).send({message:'Bad request.Wallet address is required'});
  }
  let url;
  url = `${BLOCKCHAIN_URL}/api/uia/balances/${req.query.address}`;
  try{
    let response=await axios.get(url,{headers:{version:BLOCKCHAIN_VERSION, magic:BLOCKCHAIN_MAGIC}})
    if(response && response.data && response.data.success){
      return res.send(response.data.balances);

    }
    else{
      return res.status(400).send({message:response.data.error});
    }

  }
  catch (err){
    let errmsg=errorHandler.getError(err,'We could not get the tokens');
    return res.status(400).send({message:errmsg});
  }
};

const getAllTokens=async(req,res,next)=>{

  let url;
  url = `${BLOCKCHAIN_URL}/api/uia/issues/applying`;
  try{
    let response=await axios.get(url,{headers:{version:BLOCKCHAIN_VERSION, magic:BLOCKCHAIN_MAGIC}})
    if(response && response.data && response.data.success){
      return res.send(response.data.issues);

    }
    else{
      return res.status(400).send({message:response.data.error});
    }

  }
  catch (err){

    let errmsg=errorHandler.getError(err,'We could not get the tokens');
    return res.status(400).send({message:errmsg});
  }
};


router.get('/getTokensByAddress',getTokenByAddress);

router.get('/getAllTokens',getAllTokens);



module.exports = router;
