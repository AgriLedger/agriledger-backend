
const express = require('express');
const app = require('../../server');
const fs=require('fs');
const path=require('path');
const normalizeUrl=require('../normalizeUrlParams').normalize;
const router = express.Router();
const axios=require('axios');
const OPEN_WEATHER_API_KEY=require('../../env_variables').OPEN_WEATHER_API_KEY;
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


const getCurrent=async (req,res)=>{

  let url='http://api.openweathermap.org/data/2.5/weather';
  if(!req.query.lat || !req.query.long){
    return res.status(400).send({message:'Bad request'});
  }

  url=`${url}?lat=${req.query.lat}&lon=${req.query.long}&APPID=${OPEN_WEATHER_API_KEY}`;

  try{
    let response=await axios.get(url)
    if(response && response.data){
      cache.put(req.url,response.data);
      return res.send(response.data);

    }
    else{
      return res.status(400).send({});

    }

  }
  catch (err){
    let errmsg=errorHandler.getError(err,'We could not get the weather');
    return res.status(400).send({message:errmsg});
  }


}



const getForecast=async (req,res)=>{

  let url='http://api.openweathermap.org/data/2.5/forecast';
  if(!req.query.lat || !req.query.long){
    return res.status(400).send({message:'Bad request'});
  }

  url=`${url}?lat=${req.query.lat}&lon=${req.query.long}&APPID=${OPEN_WEATHER_API_KEY}`;
  try{
    let response=await axios.get(url)
    if(response && response.data){
      cache.put(req.url,response.data);
      return res.send(response.data);
    }
    else{
      return res.status(400).send({});
    }

  }
  catch (err){
    let errmsg=errorHandler.getError(err,'We could not get the weather');
    return res.status(400).send({message:errmsg});
  }
};

router.get('/current',[veryfyAccessToken,cache.get,getCurrent])

router.get('/forecast',[veryfyAccessToken,cache.get,getForecast])

module.exports = router;
