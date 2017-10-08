var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    // TODO: this is probably wrong but i don't have files with data here
    var data = fileHelper.readUint32();

    fileHelper.skip(4);

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(8);
    sectionData.writeUint32(data);
    sectionData.writeUint32(0);

    return sectionData.arrayBuffer;
};
