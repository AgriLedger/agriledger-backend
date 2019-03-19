'use strict';

const chalk=require('chalk');

const env=process.env.NODE_ENV||'development';
console.log(chalk.red(`loopback server is running in ${env} mode `));

const loopback = require('loopback');
const boot = require('loopback-boot');
const app = module.exports = loopback();
const errorHandler = require('strong-error-handler');
const bodyParser=require('body-parser');
const path=require('path')
const fs=require('fs')
const crypto = require('crypto');



app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));


const assetRoutes=require('./routes/assets/asset.route')
const onboardingRoutes=require('./routes/onboarding/onboarding.route')
const walletRoutes=require('./routes/wallet/wallet.route')
const assetpoolRoutes=require('./routes/assetpool/assetpool.route')
const userRoute=require('./routes/user/user')
const weatherRoute=require('./routes/weather/weather')

const tokenRoutes=require('./routes/token/token.route')

const multichainRoutes=require('./routes/multichain/server');

app.get('/api/wechat',(req,res)=>{

  const token='agriledger123';
  const signature=req.query.signature;
  const timestamp=req.query.timestamp;
  const nonce=req.query.nonce;
  const echostr=req.query.echostr;

  let arr=[token,timestamp,nonce];
  arr.sort();
  let str=arr.join('');
  let shasum = crypto.createHash('sha1');
  shasum.update(str);
  shasum=shasum.digest('hex');
  console.log(shasum);

  if( shasum === signature ){
    return res.send(echostr);
  }else{
    return res.send('access failed');
  }
});

app.use('/api/blockchain/asset', assetRoutes);
app.use('/api/blockchain/assetpool', assetpoolRoutes);

app.use('/api/blockchain/onboarding', onboardingRoutes);
app.use('/api/blockchain/wallet', walletRoutes);

app.use('/api/blockchain/token', tokenRoutes);
app.use('/api/users', userRoute);
app.use('/api/weather', weatherRoute);

app.use('/api/multichain', multichainRoutes);


app.use(errorHandler({
  debug: app.get('env') === 'development',
  log: true,
}));

app.start = function(done) {
  // start the web server
  return app.listen(function() {
    app.emit('started');

    if(done){
      done();
    }

    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      let explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
