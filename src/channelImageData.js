var imageData = require('./imageData.js');
var FileHelper = require('./FileHelper.js');

exports.parse = function(fileHelper, layers) {
    for(var i=0; i<layers.length; i++) {
        var record = layers[i];
        record.channels = [];

        for(var j=0; j<record.channelInfo.length; j++) {
            var id = record.channelInfo[j].id;
            var width = (id < -1) ? record.maskData.width : record.width;
            var height = (id < -1) ? record.maskData.height : record.height;
            record.channels.push({
                id: id,
                data: imageData.parse(fileHelper, width, height, 1)[0]
            });
        }

        delete record.channelInfo; // Not needed anymore
    }
};

exports.compose = function(fileHelper, psd) {
    var psd = psd || {};
    var sectionData = new FileHelper();
    sectionData.create(0);

    if(psd.layers !== undefined && psd.layers[0] !== undefined) { // If there are no layers continue
        for(var i=0; i<psd.layers.length; i++) {
            var record = psd.layers[i];
            for(var j=0; j<record.channels.length; j++) {
                sectionData.extend(record.channels[j].data.byteLength + 2);
                sectionData.writeUint16(0); // TODO: maybe use compression in the future
                sectionData.writeUint8Array(record.channels[j].data); // section data
            }
        }
    }

    return sectionData.arrayBuffer;
};
