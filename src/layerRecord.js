var blendModes = require('./blendModes.js');
var layerMaskData = require('./layerMaskData.js');
var blendingRanges = require('./blendingRanges.js');
var additionalLayerInfo = require('./additionalLayerInfo.js');
var imageHelper = require('./imageHelper.js');
var FileHelper = require('./FileHelper.js');

exports.parse = function(fileHelper) {
    var record = {};

    record.top = fileHelper.readUint32();
    record.left = fileHelper.readUint32();
    record.bottom = fileHelper.readUint32();
    record.right = fileHelper.readUint32();
    record.width = record.right - record.left;
    record.height = record.bottom - record.top;
    var channelCount = fileHelper.readUint16();
    record.channelInfo = [];
    for(var i=0; i<channelCount; i++) {
        record.channelInfo.push({
            id: fileHelper.readInt16(),
            dataLength: fileHelper.readUint32()
        });
    }
    fileHelper.skip(4); // blend mode signature
    record.blendMode = blendModes[fileHelper.readString(4)];
    record.opacity = fileHelper.readUint8();
    record.clipping = fileHelper.readUint8();
    record.flags = fileHelper.read8Bits();
    record.flags = record.flags.slice(0, 5); // Only the first five bits are flags
    fileHelper.skip(1); // Filler

    var extraDataEnd = fileHelper.pointer + fileHelper.readUint32();
    record.maskData = layerMaskData.parse(fileHelper);
    record.blendingRanges = blendingRanges.parse(fileHelper);
    record.name = fileHelper.readPascalString('multipleOfFourBytes');
    record.additionalLayerInfo = [];
    while(fileHelper.pointer < extraDataEnd) {
        var item = additionalLayerInfo.parse(fileHelper);
        record.additionalLayerInfo.push(item);
    }

    record.toBase64 = imageHelper.toBase64;
    record.toPng = imageHelper.toPng;

    return record;
};

exports.compose = function(record) {
    var record = record || {};
    var sectionData = new FileHelper();

    sectionData.create(34 + 6*record.channels.length);
    sectionData.writeUint32(record.top);
    sectionData.writeUint32(record.left);
    sectionData.writeUint32(record.bottom);
    sectionData.writeUint32(record.right);
    sectionData.writeUint16(record.channels.length);
    for(var i=0; i<record.channels.length; i++) {
        sectionData.writeUint16(record.channels[i].id); // ChannelID
        sectionData.writeUint32(record.channels[i].data.length + 2); // Channel length
    }
    sectionData.writeString('8BIM');
    var blendModeKey = Object.keys(blendModes).filter(function(key) {
        return blendModes[key] === record.blendMode;
    })[0];
    sectionData.writeString(blendModeKey || 'norm');
    sectionData.writeUint8(record.opacity || 255);
    sectionData.writeUint8(record.clipping || 0);
    record.flags = record.flags || [0, 0, 0, 0, 0];
    record.flags.push(0, 0, 0); // Fill with zeros to get 8 bits
    sectionData.write8Bits(record.flags);
    sectionData.writeUint8(0); // Filler
    var layerMaskDataSection = layerMaskData.compose(record);
    var blendingRangesSection = blendingRanges.compose(record);
    var additionalLayerInfoSection = additionalLayerInfo.compose(record);
    var nameLength = Math.ceil((record.name.length+1)/4.0) * 4; // multiple of four (+1 to count the length byte)
    var extraDataLength = layerMaskDataSection.byteLength + blendingRangesSection.byteLength;
    extraDataLength += nameLength + additionalLayerInfoSection.byteLength;
    sectionData.writeUint32(extraDataLength);
    sectionData.extend(extraDataLength);
    sectionData.writeUint8Array(new Uint8Array(layerMaskDataSection));
    sectionData.writeUint8Array(new Uint8Array(blendingRangesSection));
    sectionData.writePascalString(record.name, 'multipleOfFourBytes');
    sectionData.writeUint8Array(new Uint8Array(additionalLayerInfoSection));

    return sectionData.arrayBuffer;
};
