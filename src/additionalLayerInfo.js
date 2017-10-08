var types = require('./additionalLayerInfoTypes.js');
var FileHelper = require('./FileHelper.js');

exports.parse = function(fileHelper) {
    var item = {};

    fileHelper.skip(4); // signature
    item.key = fileHelper.readString(4);
    item.name = types[item.key].name;

    var dataLength = fileHelper.readUint32();
    var startPosition = fileHelper.pointer;

    if(types[item.key].module !== undefined) {
        item.data = types[item.key].module.parse(fileHelper, dataLength);
    } else {
        item.data = fileHelper.readUint8Array(dataLength);
    }

    if(fileHelper.pointer < startPosition + dataLength) {
        fileHelper.skip(dataLength - (fileHelper.pointer - startPosition));
    }

    return item;
};

exports.compose = function(record) {
    var sectionData = new FileHelper();
    sectionData.create(0);

    if(record.additionalLayerInfo !== undefined) {
        for(var i=0; i<record.additionalLayerInfo.length; i++) {
            var info = record.additionalLayerInfo[i];
            if(types[info.key] !== undefined && types[info.key].module !== undefined) {
                var infoSection = new Uint8Array(types[info.key].module.compose(info.data));
            } else {
                var infoSection = info.data;
            }

            sectionData.extend(infoSection.length + 12);
            sectionData.writeString('8BIM'); // TODO: spec says this can be '8B64' aswell?
            sectionData.writeString(info.key);
            sectionData.writeUint32(infoSection.length);
            sectionData.writeUint8Array(infoSection);
        }
    }

    return sectionData.arrayBuffer;
};
