var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    return fileHelper.readUnicodeString();
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    // TODO: find out why this has to be two bytes longer than expected
    sectionData.create(data.length*2 + 6); // 2 Byte per char + 4 Byte for the length field
    sectionData.writeUnicodeString(data);

    return sectionData.arrayBuffer;
};
