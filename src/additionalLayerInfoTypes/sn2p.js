var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    return Boolean(fileHelper.readUint32());
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(4);
    sectionData.writeUint32(data ? 1 : 0);

    return sectionData.arrayBuffer;
};
