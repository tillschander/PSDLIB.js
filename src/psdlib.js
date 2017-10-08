var FileHelper = require('./FileHelper.js');
var header = require('./header.js');
var colorModeData = require('./colorModeData.js');
var imageResources = require('./imageResources.js');
var layerAndMaskInfo = require('./layerAndMaskInfo.js');
var imageHelper = require('./imageHelper.js');
var imageData = require('./imageData.js');

exports.parse = function(arrayBuffer) {
    var psd = {};
    var fileHelper = new FileHelper();

    fileHelper.open(arrayBuffer);
    var headerData = header.parse(fileHelper);

    if(headerData.depth !== 8 || headerData.colormode !== 'RGB') {
        console.error('ERROR: Only 8 Bit RGB PSDs are supported!!');
    } else if(headerData.valid) {
        psd.channels = headerData.channels;
        psd.height = headerData.height;
        psd.width = headerData.width;
        psd.depth = headerData.depth;
        psd.colormode = headerData.colormode;
        psd.colorModeData = colorModeData.parse(fileHelper);
        psd.imageResources = imageResources.parse(fileHelper);
        var lmi = layerAndMaskInfo.parse(fileHelper);
        psd.layers = lmi.layers;
        psd.globalLayerMaskInfo = lmi.globalLayerMaskInfo;
        psd.imageData = imageData.parse(fileHelper, psd.width, psd.height, psd.channels);
        psd.toBase64 = imageHelper.toBase64.bind({width: psd.width, height: psd.height, channels: [
            {id: 0, data: psd.imageData[0]},
            {id: 1, data: psd.imageData[1]},
            {id: 2, data: psd.imageData[2]},
            {id:-1, data: psd.imageData[3]},
        ]});
        psd.toPng = imageHelper.toPng.bind({width: psd.width, height: psd.height, toBase64: psd.toBase64});

        return psd;
    } else {
        console.error('ERROR: The provided file is not a valid Photoshop file!');
    }

    return;
};

exports.compose = function(psd, options) {
    var options = options || {output: 'arrayBuffer'};
    var fileHelper = new FileHelper();

    fileHelper.create(0);
    header.compose(fileHelper, psd);
    colorModeData.compose(fileHelper);
    imageResources.compose(fileHelper, psd);
    layerAndMaskInfo.compose(fileHelper, psd);
    imageData.compose(fileHelper, psd);

    if(options.output === 'blob') {
        return new Blob([fileHelper.arrayBuffer], {type: 'image/vnd.adobe.photoshop'});
    } else {
        return fileHelper.arrayBuffer;
    }
}
