const async=require('async');
const path=require('path')

const fs = require('fs');
const data = JSON.parse(fs.readFileSync(path.resolve('server','address.json'), 'utf8'));

const logger=require('../logger');

module.exports = function(app) {
  const Country = app.models.country;
  const Province = app.models.province;
  const City = app.models.city;
  const District = app.models.district;

  async.auto({
    delete_country:function (mainCallback) {
      Country.destroyAll(function(err, instance, isCreated) {
        return mainCallback(err);
      });
    },
    delete_province:function (mainCallback) {
      Province.destroyAll(function(err, instance, isCreated) {
        return mainCallback(err);
      });
    },
    delete_city:function (mainCallback) {
      City.destroyAll(function(err, instance, isCreated) {
        return mainCallback(err);
      });
    },
    delete_district:function (mainCallback) {
      District.destroyAll(function(err, instance, isCreated) {
        return mainCallback(err);
      });
    },
    create_country: ['delete_country',function(result,mainCallback) {
      async.eachSeries (data.countryList, function(countryName, callback) {
        Country.findOrCreate({where: {name: countryName}},{name:countryName}, function(err, instance, isCreated) {
          return callback(err);
        });

      },function (err,results) {
        if(err){
          logger.error(err);
        }
        else {
          logger.info('country crated succesfully');

        }
        return mainCallback(err);

      });

    }],
    create_province:['delete_province',function (result,mainCallback) {

      async.eachOf(data.provinceList, function (value, key, callback) {
        let d=data.provinceList[key]

        d=d.map((ele)=>{
          "use strict";
          return {name:ele,country:key}
        });

        Province.create(d, function(err, instance, isCreated) {
          return callback(err);
        });
      }, function (err) {
        if(err){
          logger.error(err);
        }
        else {
          logger.info('province crated succesfully');

        }

        mainCallback(err);
      });



    }],
    create_city: ['delete_city',function(result,mainCallback) {
      async.eachOf(data.cityList, function (value, key, callback) {
        let d=data.cityList[key]

        d=d.map((ele)=>{
          "use strict";
          return {name:ele,province:key}
        });

        City.create(d, function(err, instance, isCreated) {
          return callback(err);
        });
      }, function (err) {
        if(err){
          logger.error(err);
        }
        else {
          logger.info('city crated succesfully');

        }

        mainCallback(err);
      });

    }],
    create_district: ['delete_district',function(result,mainCallback) {
      async.eachOf(data.districtList, function (value, key, callback) {
        let d=data.districtList[key]

        d=d.map((ele)=>{
          "use strict";
          return {name:ele,city:key}
        });

        District.create(d, function(err, instance, isCreated) {
          return callback(err);
        });
      }, function (err) {
        if(err){
          logger.error(err);
        }
        else {
          logger.info('district crated succesfully');

        }

        mainCallback(err);
      });
    }],
  }, function(err, results) {
    if(err){
      logger.error(err);
    }
    else {
      logger.info('Great! address has been upload succesfully');

    }
  });








};

