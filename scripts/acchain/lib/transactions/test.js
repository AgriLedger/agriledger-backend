/**
 * Created by admin on 02-09-2017.
 */

const request=require('request');
const fs=require('fs');
const crypto=require('./crypto');
const hash=crypto.getHash2();
function calculateHash() {
    return new Promise((resolve,reject)=>{
        var req=request('http://madeby.google.com/static/images/google_g_logo.svg');
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
