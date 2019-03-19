const chalk=require('chalk');
module.exports.getError=(err,defaultMessage)=>{

  let errmsg;

  try{
    if (err.response) {
      if(err.response.data && err.response.data.error)
        errmsg=err.response.data.error;
    }
    else{
      errmsg=err.message;
    }


    return errmsg || defaultMessage ||  'Something went wrong';


  }
  catch (e){
    return e;
  }


};


module.exports.log=(errmsg)=>{


};
