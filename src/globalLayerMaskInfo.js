var FileHelper = require('./FileHelper.js');

exports.parse = function(fileHelper) {
    var globalLayerMaskInfo = {};
    var sectionLength = fileHelper.readUint32();
    var startPosition = fileHelper.pointer;

    if(sectionLength !== 0) {
        globalLayerMaskInfo.overlayColorSpace = fileHelper.readUint16();
        globalLayerMaskInfo.colorComponents = [];
        globalLayerMaskInfo.colorComponents.push(fileHelper.readInt16());
        globalLayerMaskInfo.colorComponents.push(fileHelper.readInt16());
        globalLayerMaskInfo.colorComponents.push(fileHelper.readInt16());
        globalLayerMaskInfo.colorComponents.push(fileHelper.readInt16());
        globalLayerMaskInfo.opacity = fileHelper.readUint16();
        globalLayerMaskInfo.kind = fileHelper.readUint8();
        fileHelper.skip(sectionLength - (fileHelper.pointer - startPosition));
    }

    return globalLayerMaskInfo;
};

exports.compose = function(fileHelper, psd) {
    var psd = psd || {};
    var sectionData = new FileHelper();
    sectionData.create(4);

    if(psd.globalLayerMaskInfo !== undefined && psd.globalLayerMaskInfo.overlayColorSpace !== undefined) {
        sectionData.writeUint32(16); // Length
        sectionData.extend(16);
        sectionData.writeUint16(psd.globalLayerMaskInfo.overlayColorSpace);
        sectionData.writeUint16(psd.globalLayerMaskInfo.colorComponents[0]);
        sectionData.writeUint16(psd.globalLayerMaskInfo.colorComponents[1]);
        sectionData.writeUint16(psd.globalLayerMaskInfo.colorComponents[2]);
        sectionData.writeUint16(psd.globalLayerMaskInfo.colorComponents[3]);
        sectionData.writeUint16(psd.globalLayerMaskInfo.opacity);
        sectionData.writeUint8(psd.globalLayerMaskInfo.kind);
        // TODO: Spec says there can ba a variable amount of filler zeros here?
    }

    return sectionData.arrayBuffer;
};
