/**
* Build.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
    version: {type: 'string'},
    detail: {type:'text'},
    url: {type: 'string'},
    plist: {type: 'string'},
    owner:{ model: 'app'}
  }
};
