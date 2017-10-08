var layerRecord = require('./layerRecord.js');
var FileHelper = require('./FileHelper.js');

exports.parse = function(fileHelper) {
    var layers = [];
    fileHelper.skip(4); // section length
    var layerCount = fileHelper.readInt16();
    if(layerCount < 0) {
        layerCount = Math.abs(layerCount);
        // TODO: If layer count is negative => first alpha channel contains
        // the transparency data for the merged result.
    }
    for(var i=0; i<layerCount; i++) {
        layers.push(layerRecord.parse(fileHelper));
    }

    return layers;
};

exports.compose = function(fileHelper, psd) {
    var psd = psd || {};
    var sectionData = new FileHelper();
    sectionData.create(4);

    if(psd.layers !== undefined && psd.layers[0] !== undefined) {
        sectionData.skip(4); // Section length temporary zero until we know it
        sectionData.extend(2);
        sectionData.writeUint16(psd.layers.length);

        for(var i=0; i<psd.layers.length; i++) {
            var layerData = new Uint8Array(layerRecord.compose(psd.layers[i]));

            sectionData.extend(layerData.length);
            sectionData.writeUint8Array(layerData);
        }

        var sectionLength = sectionData.arrayBuffer.byteLength; // TODO: round to multiple of two
        sectionData.revert(sectionLength);
        for(var i=0; i<psd.layers.length; i++) {
            for(var j=0; j<psd.layers[i].channels.length; j++) {
                sectionLength += psd.layers[i].channels[j].data.length + 2;
            }
        }
        sectionData.writeUint32(sectionLength);
    }

    return sectionData.arrayBuffer;
};
