const async=require('async');
const chalk=require('chalk');
const fs=require('fs');
const logger=require('../logger');
const path=require('path');
const ENV=require('../env_variables');
const rolesList=['ops','sponsor','farmer'];

function randomIntFromInterval(min,max){
  return Math.floor(Math.random()*(max-min+1)+min);
}
module.exports = function(app) {
  const User = app.models.user;
  const Profile = app.models.profile;

  const Role = app.models.Role;

  let DummyUsers=[
    {
      name: 'Ops',
      phone:ENV.OPS_PHONE,
      email: ENV.OPS_EMAIL,
      password:ENV.OPS_PASSWORD,
      role:rolesList[0],
      isPasswordChanged:true,
      isRegisteredOnBlockchain:true,
      isIssuerOnBlockchain:true
    },


  ];

  async.series({

    createRole:
    function createRole(mainCallback) {
      async.eachSeries(rolesList, function (roleName, callback) {

        Role.findOne({where: {name: roleName}}, function (err, role) {
          if (err) return callback(err);

          if (role) {
            return callback(null);
          }
          else {
            Role.create({name:roleName}, function (err, role) {
              if (err) return callback(err);
              else{
                return callback(null);

              }
            })
          }
        })

      },function (err,results) {
        if(err){
          logger.error('roles could not be created ',err);
          return mainCallback(err);
        }
        else{
          logger.info('roles for application has been created')
          return mainCallback(null);
        }

      })
    }

    ,createKeyPeople:
      function createKeyPeople(mainCallback) {
        async.eachSeries (DummyUsers, function(dummyUser, callback) {

          User.findOrCreate({where: {email: dummyUser.email}},dummyUser, function(err, user, userCreated) {
            if (err) return callback(err);

            if(!userCreated){
              return callback(null);
            }
            else{

              Profile.create({userId:user.id,name:dummyUser.name,phone:dummyUser.phone},(err)=>{
                if(err){
                  logger.error('seed user profile could not be created ',err);

                  return callback(err)
                }
                else {
                  logger.info('seed user profile for application has been created');
                  return callback (null)

                }

              })
            }

          });

        },function (err,results) {
          if(err){
            logger.error('seed user could not be created ',err);
            return mainCallback(err);
          }
          else{
            logger.info('seed user for application has been created')
            return mainCallback(null);
          }

        });
      }

  },(err,result)=>{
    if(err){
      logger.error('Oops! either seed user or seed roles could not be created ',err);
      throw err;
    }
    else{
      logger.info('Great!seed user and seed roles has been created successfully')

    }

  });






};
