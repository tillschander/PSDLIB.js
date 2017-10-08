var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    var data = {};

    data.x = fileHelper.readFloat64();
    data.y = fileHelper.readFloat64();

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(16);
    sectionData.writeFloat64(data.x);
    sectionData.writeFloat64(data.y);

    return sectionData.arrayBuffer;
};
