
const chai = require('chai');
const expect = require('chai').expect;
const chaiColors = require('chai-colors');

chai.use(chaiColors);
chai.use(require('chai-http'));





module.exports=(app)=>{

  describe('Testing all the end point of Asset ', function() {
    this.timeout(5000); // How long to wait for a response (ms)

    it('#get category ,should return 400 bad request without query params', function () {
      return chai.request(app)
        .get('/api/blockchain/asset/category')
        .then(function (res) {
          throw new Error('Did not send the bad request!');
        })
        .catch(function(err) {
          expect(err).to.have.status(400);
        });
    });
    // GET - List all colors
    it('#get category ,should return  empty array if no category found', function () {
      return chai.request(app)
        .get('/api/blockchain/asset/category?level=1')
        .then(function (res) {


          expect(res).to.have.status(200);
          expect(res.body).to.be.empty;
        })
        .catch(function(err) {
          console.log(err)
          throw new Error(err);

        })
    });

    it('#get category , should return array ', function () {
      return chai.request(app)
        .get('/api/blockchain/asset/category?level=11')
        .then(function (res) {


          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.above(1);
        })
        .catch(function(err) {
          console.log(err)
          throw new Error(err);

        })
    });  });


};
