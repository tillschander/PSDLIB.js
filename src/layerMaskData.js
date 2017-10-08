var FileHelper = require('./FileHelper.js');

exports.parse = function(fileHelper) {
    var maskData = {};
    var sectionLength = fileHelper.readUint32();

    if(sectionLength !== 0) {
        maskData.top = fileHelper.readUint32();
        maskData.left = fileHelper.readUint32();
        maskData.bottom = fileHelper.readUint32();
        maskData.right = fileHelper.readUint32();
        maskData.width = maskData.right - maskData.left;
        maskData.height = maskData.bottom - maskData.top;
        maskData.defaultColor = fileHelper.readUint8();
        maskData.flags = fileHelper.read8Bits();
        maskData.flags = maskData.flags.slice(0, 5); // Only the first five bits are flags
        if(maskData.flags[4] === 1) {
            // TODO: mask parameters
            console.error('FATAL ERROR: Mask Parsing not fully implemented');
        }
        if(sectionLength === 20) {
            fileHelper.skip(2);
        } else {
            // TODO: Spec says the same data is repeated now?
            console.error('FATAL ERROR: Mask Parsing not fully implemented');
        }
    }

    return maskData;
};

exports.compose = function(record) {
    var sectionData = new FileHelper();

    if(record.maskData === undefined || record.maskData.top === undefined) { // no mask
        sectionData.create(4);
        sectionData.writeUint32(0); // Section length
    } else {
        sectionData.create(24);
        sectionData.writeUint32(20); // Section length
        sectionData.writeUint32(record.maskData.top);
        sectionData.writeUint32(record.maskData.left);
        sectionData.writeUint32(record.maskData.bottom);
        sectionData.writeUint32(record.maskData.right);
        sectionData.writeUint8(record.maskData.defaultColor || 255);
        record.maskData.flags = record.maskData.flags || [0, 0, 0, 0, 0];
        record.maskData.flags.push(0, 0, 0); // Fill with zeros to get 8 bits
        sectionData.write8Bits(record.maskData.flags);
        sectionData.writeUint16(0); // Padding
        // TODO: mask parameters
    }

    return sectionData.arrayBuffer;
};
