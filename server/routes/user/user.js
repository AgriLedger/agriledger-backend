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


const changePasscode=(req,res,next)=>{

  if(!req.body.passcode){
    return res.status(400).send({message:'Bad request'});
  }
  let User=app.models.user;
  let userId=req.userId;// come from first middleware
  User.findById(userId,(err,user)=>{
    user.updateAttributes({
      passcode:req.body.passcode,
    }, function (err, instance) {
      if (err) {
        return res.status(400).json({message:'We could not update'});
      }
      else{
        return res.json({success:true});
      }
    })
  })
};





router.post('/change-passcode',[veryfyAccessToken,changePasscode])


module.exports = router;
