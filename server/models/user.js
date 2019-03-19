const Ajv = require('ajv');

const logger=require('../logger');

let welcomeEmail=require('../email-templates/welcomeMail');
let passwordResetEmail=require('../email-templates/passwordResetMail');

const Schema=require('../validation/schema');
const webUrl='http://139.59.243.90:8888';
const passwordResetUrlForInternal='http://139.59.243.90:8888/set-internal-password';
const passwordResetUrlForFarmer='http://139.59.243.90:8888/set-farmer-password';
const DEFAULT_ROLE='farmer';
const ALLOWED_ROLES=[DEFAULT_ROLE,'ops','sponsor'];

const FILTERED_PROPERTIES = [
  'privateKey',
  'publicKey',
  'walletAddress',
  'transactionId',
  'createdAt',
  'transferStatus',
  'isPasswordChanged',
  'isIssuerOnBlockchain',
  'isRegisteredOnBlockchain'
];

function sendWelcomeEmail(UserModal,instance) {
  let user=instance;
  user.pwd=instance.pwd;
  let url=webUrl;
  UserModal.app.models.email.send({
    to:`${user.email}`,
    from: 'admin@spectrus-group.com',
    subject: 'AgriLedger Welcomes You',
    text: 'We have sent you the credentials',
    html: instance.role==='farmer' ? welcomeEmail.getTemplateForFarmer(user,url): welcomeEmail.getTemplateForInternal(user,url)
  }, function(err, mail) {
    if(err){
      logger.error(`email for ${user.email} could not be sent`)

    }
    else{
      logger.info(`email for ${user.email} is sent`)
    }
  });

}

module.exports = function(User) {

  User.disableRemoteMethodByName("upsert"); // disables PATCH /MyUsers

  User.disableRemoteMethodByName("replaceOrCreate");// disables PUT /MyUsers
  User.disableRemoteMethodByName("replaceById");// disables PUT /MyUsers/{id}
  User.disableRemoteMethodByName("deleteById"); // disables DELETE /MyUsers/{id}
  User.disableRemoteMethodByName("update");  // disables POST /MyUsers/update
  User.disableRemoteMethodByName("upsertWithWhere");// disables POST /MyUsers/upsertWithWhere
  User.disableRemoteMethodByName("prototype.updateAttributes"); // disables PATCH /MyUsers/{id}

  User.disableRemoteMethodByName('prototype.__create__profiles'); // disable DELETE /MyUsers/{id}/accessTokens
  User.disableRemoteMethodByName('prototype.__destroy__profiles'); // disable DELETE /MyUsers/{id}/accessTokens



  User.beforeRemote('prototype.__update__profiles', function (ctx, modelInstance, next) {

    logger.debug('inside prototype.__update__profiles');
      const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      ctx.req.body=ctx.req.body||{};
      if(ctx.options && ctx.options.authorizedRoles && ctx.options.authorizedRoles['$owner']){
        ctx.req.body.verificationStatus='pending';
      }

      if(!ctx.req.body.farmDetails || !Array.isArray(ctx.req.body.farmDetails)){
        ctx.req.body.farmDetails=[];
      }

      ctx.req.body.farmDetails=ctx.req.body.farmDetails.filter((farm)=>{
        let allowed=false;
        Object.keys(farm).forEach((prop)=>{
          if(farm[prop] && farm[prop].length){
            allowed=true;
          }
        });

        return allowed;
      });


      const isProfileValid = ajv.validate(Schema.profileSchema,ctx.req.body);
      if (!isProfileValid) {
        let error = new Error();
        error.name='ValidationError';
        error.status = 422;
        error.statusCode=422;
        error.message = ajv.errorsText();
        return next(error);
      }
      else{
        return next();
      }


  });


  User.afterRemote('login', (ctx, user, next) => {
    if(!user || !user.userId){
      return next();
    }
    User.findById(user.userId,(err,userFound)=>{
      if(err)
        return next(err);
      if(!userFound)
        return next();
      userFound.updateAttribute('lastLoggedIn',new Date(),(err,inst)=>{
        return next();
      })
    });

  });


  User.on('resetPasswordRequest', function (info) {

    // requires AccessToken.belongsTo(User)
    info.accessToken.user(function (err, user) {


      if(user){
        let url;
        if(user.role==='farmer'){
          url=passwordResetUrlForFarmer+`?accessToken=${info.accessToken.id}&role=${user.role}`
        }
        else {
          url=passwordResetUrlForInternal+`?accessToken=${info.accessToken.id}&role=${user.role}`
        }
        User.app.models.email.send({
          to:`${info.email}`,
          from: 'admin@spectrus-group.com',
          subject: 'AgriLedger:Password Reset',
          text: 'Reset your AgriLedger Password',
          html: passwordResetEmail.getTemplate(url)
        }, function(err, mail) {
          if(err){
            logger.error(`password reset email for ${user.email} could not be sent`)

          }
          else{
            logger.info(`password reset email for ${user.email} is sent`)
          }
        });
      }

      else{

      }

    });
  });


  User.beforeRemote('create',(ctx, modelInstance, next)=>{

    logger.debug('inside user.beforeRemote(create)');

    const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    ctx.req.body.profiles=ctx.req.body.profiles||{};
    if(!ctx.req.body.profiles.farmDetails || !Array.isArray(ctx.req.body.profiles.farmDetails)){
      ctx.req.body.profiles.farmDetails=[];
    }

    ctx.req.body.profiles.farmDetails=ctx.req.body.profiles.farmDetails.filter((farm)=>{
      let allowed=false;
      Object.keys(farm).forEach((prop)=>{
        if(farm[prop] && farm[prop].length){
          allowed=true;
        }
      });

      return allowed;
    });
    FILTERED_PROPERTIES.forEach(function(p) {
      if(ctx.req.body[p]){
        delete ctx.req.body[p]
      }
    });

    if(!ALLOWED_ROLES.includes(ctx.req.body.role)){
      ctx.req.body.role=DEFAULT_ROLE;
    }
    // to be used to send an email with the plain password
    ctx.req.pwd=ctx.req.body.password;


    // validate user password

    let isUserValid;
    if(ctx.req.body.role==='farmer'){
      isUserValid = ajv.validate(Schema.userSchemaForFarmer,ctx.req.body);
    }
    else{
      isUserValid = ajv.validate(Schema.userSchemaForInternal,ctx.req.body);
    }
      if (!isUserValid) {
        let error = new Error();
        error.name='ValidationError';
        error.status = 422;
        error.statusCode=422;
        error.message = ajv.errorsText();
        logger.debug('user is not valid according to schema')
        return next(error);
      }

    // validate profiles
    const isProfileValid = ajv.validate(Schema.profileSchema,ctx.req.body.profiles);
    if (!isProfileValid) {
      let error = new Error();
      error.name='ValidationError';
      error.status = 422;
      error.statusCode=422;
      error.message = ajv.errorsText();
      logger.debug('user profile is not valid according to schema')

      return next(error);
    }

    logger.debug('user and their profile is valid according to schema')

    return next();
  });

  User.afterRemote('create',(ctx, modelInstance, next)=>{

    logger.debug('user has been successfully created')

    modelInstance.pwd=ctx.req.pwd;


    let profile=ctx.req.body.profiles;
    profile.userId=modelInstance.id;
    profile.verificationStatus='approved';
    let ProfileModal=User.app.models.profile;
    ProfileModal.create(profile,(err,p)=>{
      if(err){
        logger.error(err);
        return next(err);
      }
      else{
        logger.debug('profile is created');
        sendWelcomeEmail(User,modelInstance)
        return next();
      }
    })


  });

  User.observe('after save', function setRoleMapping(ctx, next) {
    logger.debug('inside user.observe(after save)')

    if(ctx.isNewInstance) {
      logger.debug('its a new instance')
      const RoleMapping = User.app.models.RoleMapping;
      const Role = User.app.models.Role;
      Role.findOne({where: {name: ctx.instance.role}}, function(err, role) {
        if (err) {
          logger.error(err)
          return next(null)
        }
        if(role) {
          RoleMapping.create({
            principalType: "USER",
            principalId: ctx.instance.id,
            roleId: role.id
          }, function (err, roleMapping) {
            if(err){
              logger.error(err);
            }
            else {
              return next();
            }
          })
        }
        else{
          return next()
        }
      })


    }
    else{
      logger.debug('its not a new instance')
      return next();

    }
  });

  User.observe('before save', function (ctx, next) {

    logger.debug('inside user.observe(before save) hook)');


    var app = ctx.Model.app;

    //Apply this hooks for save operation only..
    if(ctx.isNewInstance) {
      let mongoConnector = app.dataSources.mongo.connector;
      mongoConnector.collection("counter").findAndModify(
        {collection: 'user'},
        {},
        { $inc: { value: 1 } },
        {new: true, upsert: true},

        function (err, sequence) {
          if (err) {
            logger.error(err);
            return next(err);
          } else {
            logger.debug(`agriId ${sequence.value.value} has been assigned`);
            ctx.instance.agriId = sequence.value.value;
            return next();
          }
        })

    }

    else
    {
      next();
    }

  });


  User.afterRemote('changePassword', function(context,instance, next){

    User.findById(context.args.id,(err,user)=>{
      if(err)
        return next(err);
      if(!user)
        return next();
      user.updateAttribute('isPasswordChanged',true,(err,inst)=>{
        if(err)
          return next(err);
        return next();

      })
    })
  });


};
