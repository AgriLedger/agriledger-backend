const express = require('express');
const app = require('../../server');
const normalizeUrl=require('../normalizeUrlParams').normalize;
const router = express.Router();
const errorHandler=require('../errorhandler');
const cache = require('../cache.middleware');
const Client = require('bitcoin-core');

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



const MULTICHAIN_CONFIG={
  rpcUsername:'multichainrpc',
  rpcPassword:'3P79Uu3VfkPF82PpLDyFrRkjuQuC6m1jhGBPHkUELk8b',
  host:'139.59.243.90',
  port:'8372'
};
const client = new Client({ host:MULTICHAIN_CONFIG.host,
  port:MULTICHAIN_CONFIG.port,
  username:MULTICHAIN_CONFIG.rpcUsername,
  password:MULTICHAIN_CONFIG.rpcPassword,
  ssl:{enabled:false}
});

/*
client.getTransaction().then((help) => console.log(help));
*/





const updateUserAfterWalletCreate=(req,res)=> {
  let User=app.models.user;
  let userId=req.userId;// come from first middleware
  User.findById(userId,(err,user)=>{
    let multichain={};
    multichain.address=req.multichainAddress;
    multichain.privateKey=req.multichainPrivateKey;
    multichain.publicKey=req.multichainPublicKey;

    user.updateAttributes({
      multichain:multichain,
    }, function (err, instance) {
      if (err) {
        return res.status(400).json({message:'We could not update'});
      }
      else{
        return res.send(req.multichainAddress);
      }
    })
  })
};
const checkAddressOwnership=(req,res,next)=> {
  let User=app.models.user;
  let userId=req.userId;// come from first middleware
  User.findById(userId,(err,user)=>{
    if(err){
      return res.status(400).send({message:err});
    }
    if(user){
      if(!user.multichain || !user.multichain.address){
        return res.status(400).send({message:'User does not have a multichain account'});
      }
      if(user.multichain.address!==req.query.from){
        return res.status(400).send({message:'This address does not belong to request user'});
      }
      else{
        req.multichainPrivateKey=user.multichain.privateKey;
        return next();

      }
    }
  })
}

const checkAddressExist=(req,res,next)=> {
  let User=app.models.user;
  let userId=req.userId;// come from first middleware
  User.findById(userId,(err,user)=>{
    if(err){
      return res.status(400).send({message:err});
    }
    if(user){
      if(user.multichain && user.multichain.address){
        return res.status(400).send({message:'User already have a multichain account'});

      }
      else{
        return next();

      }
    }
  })
}
const getaddresses= (req,res)=>{
  const batch = [
    {
      method: 'getaddresses', parameters: []
    }
  ];

  client.command(batch).then((data) => {
    console.log(data)
    res.send(data);
  }).catch((err)=>{
    return res.status(400).send(err);
  })
};

const createAccount= async (req,res,next)=>{

  let result1,result2;
  const batch1 = [
    {
      method: 'createkeypairs', parameters: []
    }
  ];

  const batch2 = [
    {
      method: 'importaddress', parameters: []
    }
  ];

  try{
    [result1]= await client.command(batch1);
    console.log('first result')
    console.log(result1)
    console.log(Array.isArray(result1))
  }
  catch (e){
    console.log('first error')

    return res.status(400).send({message:e})
  }

  if(result1){
    try {
      batch2[0].parameters.push(result1[0].address);
      batch2[0].parameters.push('');
      batch2[0].parameters.push(false);
      console.log(batch2)
      result2=await client.command(batch2);// return null if success
      console.log(result2)
      console.log('second result')

    }
    catch (e){
      console.log('second error')
      console.log(e)

      return res.status(400).send({message:e})


    }

    if(result2[0]===null){
      req.multichainAddress=result1[0].address;
      req.multichainPrivateKey=result1[0].privkey;
      req.multichainPublicKey=result1[0].pubkey;

      return next();
    }
    else{
      return res.status(400).send({message:'we could not create an account.try again'})

    }
  }

};


const getaddressbalances=(req,res)=>{
  if(!req.query.address){
    return res.status(400).send({message:'Bad request.Address is not found'});
  }
  const batch = [
    {
      method: 'getaddressbalances', parameters: [req.query.address]
    }
  ];

  client.command(batch).then(([data]) => {
    console.log(data)
    res.send(data);
  }).catch((err)=>{
    return res.status(400).send(err);
  })
};


const sendfrom=(req,res)=>{
  if(!req.query.from){
    return res.status(400).send({message:'Bad request.sender address is not found'});
  }
  if(!req.query.to){
    return res.status(400).send({message:'Bad request.Recepient Address is not found'});
  }
  if(!req.query.amount){
    return res.status(400).send({message:'Bad request.amount is not found'});
  }

  const batch = [
    {
      method: 'sendfrom', parameters: [req.query.from,req.query.to,parseInt(req.query.amount)]
    }
  ];

  console.log(batch)
  client.command(batch).then((data) => {
    console.log(data)
    res.send(data);
  }).catch((err)=>{
    return res.status(400).send(err);
  })
};

const sendassetfrom =async (req,res)=>{
  let from,to,assetName,quantity,result1,result2,result3;
  from=req.query.from;
  to=req.query.to;
  assetName=req.query.assetName||"";
  quantity=req.query.quantity;

  if(!from){
    return res.status(400).send({message:'Bad request.sender address is not found'});
  }
  if(!to){
    return res.status(400).send({message:'Bad request.recepient address is not found'});
  }
  if(!quantity){
    return res.status(400).send({message:'Bad request.quantity is not found'});
  }
  const batch = [
    {
      method: 'createrawsendfrom', parameters: [from,{[to]:{[assetName]:Number(quantity)}}]
    }
  ];

  console.log(JSON.stringify(batch))

  try{
    result1=await client.command(batch);
    console.log('result 1')
    console.log(result1)
  }
  catch(err) {
    console.log('catch 1')
    console.log(err);
    return res.status(400).send({message:err});
  }

  if(Array.isArray(result1) && !result1[0].code){
    const batch = [
      {
        method: 'signrawtransaction', parameters: [result1[0],[],[req.multichainPrivateKey]]
      }
    ];

    console.log(batch)
    try{
      result2=await client.command(batch);
      console.log('result 2')
      console.log(result2)
    }
    catch (err){
      console.log('catch 2')
      console.log(err);
      return res.status(400).send({message:err});

    }

    if(Array.isArray(result2) && !result2[0].code && result2[0].complete){
      const batch = [
        {
          method: 'sendrawtransaction', parameters: [result2[0].hex]
        }
      ];

      try{
        result3=await client.command(batch);
        console.log('result 3')
        console.log(result3)
      }

      catch (err){
        console.log('catch 3')
        console.log(err);
        return res.status(400).send({message:err});

      }


      if(Array.isArray(result3) && !result3[0].code){
        console.log('all success')
        res.send(result3[0]);
      }
      else{
        return res.status(400).send({message:result3[0].message || 'we could not transfer.try again'})
      }
    }

    else {
      return res.status(400).send({message:result2[0].message || 'we could not transfer.try again'})

    }
  }
  else{
    return res.status(400).send({message:result1[0].message || 'we could not transfer.try again'})

  }

};

const grant=(req,res)=>{
  if(!req.query.address){
    return res.status(400).send({message:'Bad request.address is not found'});
  }
  if(!req.query.permissions){
    return res.status(400).send({message:'Bad request.permissions is not found'});
  }
  const batch = [
    {
      method: 'grant', parameters: [req.query.address,req.query.permissions]
    }
  ];

  client.command(batch).then((data) => {
    console.log(data)
    res.send(data);
  }).catch((err)=>{
    return res.status(400).send(err);
  })
};

const listaddresstransactions=(req,res)=>{
  if(!req.query.address){
    return res.status(400).send({message:'Bad request.address is not found'});
  }

  const batch = [
    {
      method: 'listaddresstransactions', parameters: [req.query.address]
    }
  ];

  client.command(batch).then(([data]) => {
    console.log(data)
    res.send(data);
  }).catch((err)=>{
    return res.status(400).send(err);
  })
};


const test=(req,res)=>{
  "use strict";
  const batch = [
    { method: 'foobar', params: [] },
    { method: 'getnewaddress', params: [] }
  ]

  client.command(batch).then((response) => console.log('inside succ',response)).catch((err)=>{
    console.log('inside error')
    console.log(err)
  });
}






/**
 * @api {get} /sendfrom send token from your address to another address
 * @apiGroup Send and Receive
 * @apiParam {String} from
 * @apiParam {String} to
 * @apiParam {String} amount
 * @apiHeader {String} x-access-token Users token
 * @apiSuccess {String} txnId Transaction ID.
 * @apiError {Object} Error Error object containing message property

 */

router.get('/sendfrom',[veryfyAccessToken,checkAddressOwnership,sendfrom]);



/**
 * @api {get} /sendassetfrom send asset from your address to another address
 * @apiGroup Send and Receive
 * @apiParam {String} from
 * @apiParam {String} to
 * @apiParam {String} amount
 * @apiHeader {String} x-access-token Users token
 * @apiSuccess {String} txnId Transaction ID.
 * @apiError {Object} Error Error object containing message property

 */

router.get('/sendassetfrom',[veryfyAccessToken,checkAddressOwnership,sendassetfrom]);



/**
 * @api {get} /getaddresses get all addresses in wallet
 * @apiGroup Wallet
 * @apiHeader {String} x-access-token Users token
 * @apiSuccess {String[]} address list of address in node's wallet.
 * @apiError {Object} Error Error object containing message property

 */

router.get('/getaddresses',[veryfyAccessToken,getaddresses]);

/**
 * @api {get} /getaddressbalances get balance by address
 * @apiGroup Wallet
 * @apiParam {String} address
 * @apiHeader {String} x-access-token Users token
 * @apiSuccess {Object[]} balance list of balances for this address
 * @apiError {Object} Error Error object containing message property

 */

router.get('/getaddressbalances',[veryfyAccessToken,getaddressbalances]);

/**
 * @api {get} /createAccount generate address  for user
 * @apiGroup Wallet
 * @apiHeader {String} x-access-token Users token
 * @apiSuccess {String} address return created address
 * @apiError {Object} Error Error object containing message property

 */
router.get('/createAccount',[veryfyAccessToken,checkAddressExist,createAccount,updateUserAfterWalletCreate]);




/**
 * @api {get} /listaddresstransactions get all the txn from by address
 * @apiGroup Wallet
 * @apiParam {String} address
 * @apiHeader {String} x-access-token Users token
 * @apiHeader {Object[]} txn list of transactions for this address
 * @apiError {Object} Error Error object containing message property


 */

router.get('/listaddresstransactions',[veryfyAccessToken,listaddresstransactions]);


router.get('/grant',[veryfyAccessToken,grant]);


module.exports = router;
