var isNode=new Function("try {return this===global;}catch(e){return false;}");
var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");


if(isNode()) console.log("running under node.js");
if(isBrowser()) console.log("running under browser");