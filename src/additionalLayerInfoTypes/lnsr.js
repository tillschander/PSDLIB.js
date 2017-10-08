var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    // TODO: is this really a Uint32?
    return fileHelper.readUint32(); // ID for the layer name
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(4);
    sectionData.writeUint32(data);

    return sectionData.arrayBuffer;
};
