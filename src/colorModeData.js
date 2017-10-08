exports.parse = function(fileHelper) {
    var sectionLength = fileHelper.readUint32();
    var colorModeData = [];

    if(sectionLength > 0) {
        console.error('Neither Indexed nor Duotone colormode supported yet!');
        colorModeData = fileHelper.readUint8Array(sectionLength);
        // TODO: Add support for indexed color / duotone and then implement this
    }

    return colorModeData;
};

exports.compose = function(fileHelper, psd) {
    var psd = psd || {};

    if(psd.colorModeData !== undefined) {
        console.error('Neither Indexed nor Duotone colormode supported yet!');
        // TODO: Add support for indexed color / duotone and then implement this
    }

    fileHelper.extend(4);
    fileHelper.writeUint32(0);
};
