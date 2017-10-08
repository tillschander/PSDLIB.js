var blendModes = require('../blendModes.js');
var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper, dataLength) {
    var data = {};
    var type = fileHelper.readUint32();

    if(type === 0) {
        data.type = 'other';
    } else if(type === 1) {
        data.type = 'open folder';
    } else if(type === 2) {
        data.type = 'closed folder';
    } else if(type === 3) {
        data.type = 'divider';
    }

    if(dataLength >= 12) {
        fileHelper.skip(4); // Signature
        data.blendMode = blendModes[fileHelper.readString(4)];
    }

    if(dataLength >= 16) {
        if(fileHelper.readUint32() === 0) {
            data.subType = 'normal';
        } else {
            data.subType = 'scene group';
        }
    }

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(4);
    if(data.type === 'other') {
        sectionData.writeUint32(0);
    } else if(data.type === 'open folder') {
        sectionData.writeUint32(1);
    } else if(data.type === 'closed folder') {
        sectionData.writeUint32(2);
    } else if(data.type === 'divider') {
        sectionData.writeUint32(3);
    }

    if(data.blendMode !== undefined) {
        var blendModeKey = Object.keys(blendModes).filter(function(key) {
            return blendModes[key] === data.blendMode;
        })[0];
        sectionData.extend(8);
        sectionData.writeString('8BIM');
        sectionData.writeString(blendModeKey);
    }

    if(data.subType !== undefined) {
        sectionData.extend(4);
        if(data.subType === 'scene group') {
            sectionData.writeUint32(1);
        } else {
            sectionData.writeUint32(0);
        }
    }

    return sectionData.arrayBuffer;
};
