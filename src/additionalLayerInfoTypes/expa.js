var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    var data = {};

    data.version = fileHelper.readUint16();
    data.exposure = fileHelper.readUint32();
    data.offset = fileHelper.readUint32();
    data.gamma = fileHelper.readUint32();

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(14);
    sectionData.writeUint16(data.version);
    sectionData.writeUint32(data.exposure);
    sectionData.writeUint32(data.offset);
    sectionData.writeUint32(data.gamma);

    return sectionData.arrayBuffer;
};
