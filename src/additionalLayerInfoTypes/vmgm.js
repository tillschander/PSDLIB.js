var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    var data = Boolean(fileHelper.readUint8());

    fileHelper.skip(3);

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(4);
    sectionData.writeUint8(data ? 1 : 0);

    return sectionData.arrayBuffer;
};
