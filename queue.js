
const request=require('request');
const fs=require('fs');
const crypto=require('crypto');
let hash = crypto.createHash('sha256');

function calculateHash() {
  return new Promise((resolve,reject)=>{
    var req=request('http://bit.ly/2mTM3nY');
    req.on('data',function (d) {
      console.log('.')
      hash.update(d);
    });
    req.on('error',function (err) {
      console.log(err);
      reject(err)
    });
    req.on('end',function (d) {
      console.log('finished');
      resolve(hash.digest('hex'));
    })

  })
}


calculateHash().then((hash)=>{
  console.log(hash)
}).catch((err)=>{
  console.log(err);
})
