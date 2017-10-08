var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    var length = fileHelper.readUint32();
    return fileHelper.readUint8Array(length);
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(data.length + 4);
    sectionData.writeUint32(data.length);
    sectionData.writeUint8Array(data);

    return sectionData.arrayBuffer;
};
