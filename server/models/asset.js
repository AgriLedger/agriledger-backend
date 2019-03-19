'use strict';

module.exports = function(Asset) {
  Asset.observe('before save', function check(ctx, next) {
    if(ctx.isNewInstance) {
      if(ctx.instance)
      {

      }      }
      else{
        if(ctx.data)
          ctx.data.updatedAt=Date.now();
      }


      return next();

  });
};
