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
const cache = require('../cache.middleware');
const errorHandler=require('../errorhandler')


const getCategory=async(req,res)=>{
  let level = req.query.level;

  if(req.query.level===undefined){
    return res.status(400).send({message:'Bad request'})
  }
  let url = `${BLOCKCHAIN_URL}/api/uia/categories/${level}`;

  try {
    let response=await axios.get(url,{headers:{version:BLOCKCHAIN_VERSION,magic:BLOCKCHAIN_MAGIC}});

    if(!response || !response.data || !response.data.success){

      return res.status(400).json({message:response.data.error});
    }

    // this is because they return null instead of an array if there is no category
    if(response.data.categories && response.data.categories.length){
      cache.put(req.url,response.data.categories);
      return res.send(response.data.categories);
    }
    else{
      return res.send([]);

    }

  }
  catch (err){
    let errmsg=errorHandler.getError(err,'We could not get the categories');
    return res.status(400).send({message:errmsg});
  }




};


router.get('/category',[cache.get,getCategory]);



module.exports = router;
