var layerInfo = require('./layerInfo.js');
var channelImageData = require('./channelImageData.js');
var globalLayerMaskInfo = require('./globalLayerMaskInfo.js');

// TODO: add type attribute to layers (for folders) an nest them
exports.parse = function(fileHelper) {
    var layerAndMaskInformation = {};
    var sectionLength = fileHelper.readUint32();
    var startPosition = fileHelper.pointer;

    layerAndMaskInformation.layers = layerInfo.parse(fileHelper);
    channelImageData.parse(fileHelper, layerAndMaskInformation.layers);
    layerAndMaskInformation.globalLayerMaskInfo = globalLayerMaskInfo.parse(fileHelper);
    fileHelper.skip(sectionLength - (fileHelper.pointer - startPosition));
    // TODO: check if skipping is the best idea here

    return layerAndMaskInformation;
};

exports.compose = function(fileHelper, psd) {
    var psd = psd || {};
    var layerInfoBuffer = layerInfo.compose(fileHelper, psd);
    var channelImageDataBuffer = channelImageData.compose(fileHelper, psd);
    var globalLayerMaskInfoBuffer = globalLayerMaskInfo.compose(fileHelper, psd);
    var sectionLength = layerInfoBuffer.byteLength + channelImageDataBuffer.byteLength + globalLayerMaskInfoBuffer.byteLength;

    fileHelper.extend(4);
    fileHelper.writeUint32(sectionLength); // section length
    fileHelper.extend(sectionLength);
    fileHelper.writeUint8Array(new Uint8Array(layerInfoBuffer)); // section data
    fileHelper.writeUint8Array(new Uint8Array(channelImageDataBuffer)); // section data
    fileHelper.writeUint8Array(new Uint8Array(globalLayerMaskInfoBuffer)); // section data
};
