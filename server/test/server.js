
const chai = require('chai');
const expect = require('chai').expect;
const chaiColors = require('chai-colors');

chai.use(chaiColors);
chai.use(require('chai-http'));

const app = require('../server'); // Our app

const assetTestSuite=require('./asset.test');
const assetpoolTestSuite=require('./assetpool.test');

before(function(done) {
  app.start(done);
});

after(function () {

});
assetTestSuite(app);
assetpoolTestSuite(app)
