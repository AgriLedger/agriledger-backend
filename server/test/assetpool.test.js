
const chai = require('chai');
const expect = require('chai').expect;
const chaiColors = require('chai-colors');

chai.use(chaiColors);
chai.use(require('chai-http'));

module.exports=(app)=>{

  describe('Testing all the end point of Asset Pool ', function() {
    this.timeout(5000); // How long to wait for a response (ms)

    it('Base url of asset pool api should return 404', function () {
      return chai.request(app)
        .get('/api/blockchain/assetpool')
        .then(function (res) {
          throw new Error('Did not send the bad request!');
        })
        .catch(function(err) {
          expect(err).to.have.status(404);
        });
    });


    it('#getAssetinfo category ,should return 400 bad request without assetName query', function () {
      return chai.request(app)
        .get('/api/blockchain/assetpool/getinfo')
        .then(function (res) {
          throw new Error('Did not send the bad request!');
        })
        .catch(function(err) {
          expect(err).to.have.status(400);
        });
    });
  });


};
