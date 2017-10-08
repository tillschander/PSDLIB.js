var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    var data = {};

    data.brightness = fileHelper.readUint16();
    data.contrast = fileHelper.readUint16();
    data.mean = fileHelper.readUint16();
    data.labOnly = Boolean(fileHelper.readUint8());

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(7);
    sectionData.writeUint16(data.brightness);
    sectionData.writeUint16(data.contrast);
    sectionData.writeUint16(data.mean);
    sectionData.writeUint8(data.labOnly ? 1 : 0);

    return sectionData.arrayBuffer;
};
