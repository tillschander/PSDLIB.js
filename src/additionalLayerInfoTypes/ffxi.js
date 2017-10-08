var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    return fileHelper.readUint32(); // ID of the Foreign effect
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(4);
    sectionData.writeUint32(data);

    return sectionData.arrayBuffer;
};
