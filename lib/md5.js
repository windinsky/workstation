var crypto = require('crypto');

module.exports = function(val){
    var md5 = crypto.createHash('md5');
    md5.update(val);
    return md5.digest('hex');
};
