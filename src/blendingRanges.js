var FileHelper = require('./FileHelper.js');

exports.parse = function(fileHelper) {
    var blendingRanges = [];
    var sectionLength = fileHelper.readUint32();

    for(var i=0; i<sectionLength; i+=4) {
        blendingRanges.push([
            fileHelper.readUint8(),
            fileHelper.readUint8(),
            fileHelper.readUint8(),
            fileHelper.readUint8(),
        ]);
    }

    return blendingRanges;
};

exports.compose = function(record) {
    var sectionData = new FileHelper();

    if(record.blendingRanges !== undefined) {
        var sectionDataLength = record.blendingRanges.length * 4;

        sectionData.create(sectionDataLength + 4);
        sectionData.writeUint32(sectionDataLength);
        for(var i=0; i<record.blendingRanges.length; i++) {
            sectionData.writeUint8Array(record.blendingRanges[i]);
        }
    } else {
        var ranges = record.channels.length * 2 + 2; // source and destination range per channel + two more

        sectionData.create(ranges*4 + 4);
        sectionData.writeUint32(ranges*4);
        for(var i=0; i<ranges; i++) {
            sectionData.writeUint8Array([0, 0, 255, 255]);
        }
    }

    return sectionData.arrayBuffer;
};
