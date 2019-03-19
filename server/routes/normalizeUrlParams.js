
module.exports.normalize=function normalizeURL(url,params) {
  let query='?';
  for(let i in params){
    query=query+i+'='+params[i]+'&';
  }
  url=url+query;
  url = url.slice(0, -1); // remove & from last

  return url;
}
