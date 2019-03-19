'use strict';
const app = require('../server');
const crypto = require('crypto');
const fs = require('fs');
const path=require('path');
const storageApiForProfile = '/api/containers/profiles/download/';
const storageApiForevidences = '/api/containers/evidences/download/';
const storageApiForProfileDocuments = '/api/containers/profile_documents/download/';
const storageApiForAssetDocuments = '/api/containers/asset_documents/download/';

module.exports = function (Container) {

  Container.beforeRemote('upload', function (context, remoteMethodOutput, next) {

/*
    if (!context.req.headers['x-id'])
      return next({message: 'id not present in header'})*/
    next();
  });


  Container.afterRemote('upload', function (context, output, next) {
    let url = '';
    if (output && output.result && output.result.files && output.result.files.file && output.result.files.file.length) {
      if (output.result.files.file[0].container === 'profiles') {
        url = storageApiForProfile + '' + output.result.files.file[0].name;

      }
      else if (output.result.files.file[0].container === 'evidences') {
        url = storageApiForevidences + '' + output.result.files.file[0].name;
      }
      else if (output.result.files.file[0].container === 'profile_documents') {
        url = storageApiForProfileDocuments + '' + output.result.files.file[0].name;
      }
      else if (output.result.files.file[0].container === 'asset_documents') {
        url = storageApiForAssetDocuments + '' + output.result.files.file[0].name;
      }
    }


    let id = context.req.headers['x-id'];


    if (output.result.files.file[0].container === 'profiles') {

      app.models.profile.findById(id, (err, instance)=> {
        if (err) {
          return next(err);
        }
        else {
          if (!instance) {
            return next(new Error('User does not have valid profile yet'));
          }

          let data = {
            url: url || null,
            lat: context.req.headers['lat'] || null,
            long: context.req.headers['long'] || null
          };
          instance.updateAttribute('profileUrl', data, (err, i)=> {
            if (err) {
              next(err);
            }
            else {
              output.result.files.file[0].data=data;
              next();
            }
          })
        }
      })
    }

    else if (output.result.files.file[0].container === 'profile_documents') {

      let filePath;
      try{
        filePath=path.normalize(`/files/${output.result.files.file[0].container}/${output.result.files.file[0].name}`);


      }
      catch (err){
        return next(err);
      }
      let hash = crypto.createHash('sha1');

      let readStream = fs.createReadStream(filePath);
      readStream
        .on('data', function (chunk) {
          hash.update(chunk);
        })
        .on('end', function () {
          let digest;
          try {
            digest=hash.digest('hex');
          }
          catch (err){
            return next(err);

          }

          app.models.profile.findById(id, (err, instance)=> {
            if (err) {
              return next(err);
            }
            else {
              if (!instance) {
                return next(new Error('Profile is not created'));
              }

              let data = {
                url: url || null,
                lat: context.req.headers['lat'] || null,
                long: context.req.headers['long'] || null,
                hash:digest,
                description:context.req.headers['description'] || null,
                date:new Date()
              };

              if(!instance.documents){
                instance.documents=[data];
              }
              else
                instance.documents.push(data)


              instance.save((err, i)=> {
                if (err) {
                  next(err);
                }
                else {
                  output.result.files.file[0].data=data;

                  next();
                }
              })
            }
          })

        })
        .on('error',(err)=>{
          return next(err)


        })


    }
    else if (output.result.files.file[0].container === 'asset_documents') {
      let assetId = context.req.headers['x-assetid'];



      let filePath;
      try{
        filePath=path.normalize(`/files/${output.result.files.file[0].container}/${output.result.files.file[0].name}`);


      }
      catch (err){
        return next(err);
      }
      var hash = crypto.createHash('sha1');

      var readStream = fs.createReadStream(filePath);
      readStream
        .on('data', function (chunk) {
          hash.update(chunk);
        })
        .on('end', function () {
          let digest;
          try {
            digest=hash.digest('hex');
          }
          catch (err){
            return next(err);

          }

          app.models.asset.findById(assetId, (err, instance)=> {
            if (err) {
              return next(err);
            }
            else {
              if (!instance) {
                return next(new Error('Asset is not created'));
              }

              let data = {
                url: url || null,
                lat: context.req.headers['lat'] || null,
                long: context.req.headers['long'] || null,
                hash:digest,
                date:new Date()
              };

              if(!instance.documents){
                instance.documents=[data];
              }
              else
                instance.documents.push(data)


              instance.save((err, i)=> {
                if (err) {
                  next(err);
                }
                else {
                  output.result.files.file[0].data=data;

                  next();
                }
              })
            }
          })

        })
        .on('error',(err)=>{
          return next(err)


        })


    }

    else if (output.result.files.file[0].container === 'evidences') {
      let assetId = context.req.headers['x-assetid'];



      let filePath;
      try{
        filePath=path.normalize(`/files/${output.result.files.file[0].container}/${output.result.files.file[0].name}`);


      }
      catch (err){
        return next(err);
      }
      var hash = crypto.createHash('sha1');

      var readStream = fs.createReadStream(filePath);
      readStream
        .on('data', function (chunk) {
          hash.update(chunk);
        })
        .on('end', function () {
          let digest;
          try {
            digest=hash.digest('hex');
          }
          catch (err){
            return next(err);

          }

          app.models.asset.findById(assetId, (err, instance)=> {
            if (err) {
              return next(err);
            }
            else {
              if (!instance) {
                return next(new Error('Asset is not created'));
              }

              let data = {
                url: url || null,
                lat: context.req.headers['lat'] || null,
                long: context.req.headers['long'] || null,
                hash:digest,
                date:new Date()
              };

              if(!instance.evidences){
                instance.evidences=[data];
              }
              else
                instance.evidences.push(data)


              instance.save((err, i)=> {
                if (err) {
                  next(err);
                }
                else {
                  output.result.files.file[0].data=data;

                  next();
                }
              })
            }
          })

        })
        .on('error',(err)=>{
          return next(err)


        })


    }
    else {
      next()
    }

  });


  /*  Profile.observe('before save', function(ctx, next) {
   console.log(ctx)

   next();

   });*/

  /*  Profile.observe('after delete', function(ctx, next) {
   console.log('')
   next();
   });*/
};
