var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('http://192.168.99.100:8000',{allowHttp:true});

const axios=require('axios');





function generateKey() {
  const keypair = StellarSdk.Keypair.random();
  const secret = keypair.secret();
  const publicKey = keypair.publicKey();

  console.log('pub key is')
  console.log(publicKey)

  console.log('secret is')
  console.log(secret)

  return {publicKey,secret};

}


function createAccount() {

  const keypair=generateKey();
   let result=StellarSdk.Operation.createAccount({destination:keypair.publicKey,startingBalance:'0.00001'});
   console.log(result)

}


function loadAccount() {

  server.loadAccount('GBCZTV4O2PBI62AQL2OBGNMNVSQPOEBDE25ED4WKYWDKWENNBPNBYZKL').then(function(account) {
    account.balances.forEach(function(balance) {
      console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
    });
  });
}

function getLumens() {
  const keypair=generateKey();

  axios.get('https://horizon-testnet.stellar.org/friendbot?addr='+keypair.publicKey).then((res)=>{
    "use strict";
    console.log(res.data)

  }).catch((err)=>{
    "use strict";
    console.log(err)
  })


}



loadAccount();


//GBCZTV4O2PBI62AQL2OBGNMNVSQPOEBDE25ED4WKYWDKWENNBPNBYZKL

//secret
//SC7MDCQGBFNLS5B3ND67AZEQHPJSP7SMJMJE6VL4WEOES5TUPLVJGBSB
