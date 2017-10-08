var colormodes = [
    'Bitmap',
    'Grayscale',
    'Indexed',
    'RGB',
    'CMYK',
    'HSL',
    'HSB',
    'Multichannel',
    'Duotone',
    'Lab'
];

exports.parse = function(fileHelper) {
    var fileHeader = {};
    var signature = fileHelper.readString(4);
    var version = fileHelper.readUint16();

    fileHeader.valid = false;
    if(signature === '8BPS' && version === 1) {
        fileHelper.skip(6);
        fileHeader.valid = true;
        fileHeader.channels = fileHelper.readUint16();
        fileHeader.height = fileHelper.readUint32();
        fileHeader.width = fileHelper.readUint32();
        fileHeader.depth = fileHelper.readUint16();
        fileHeader.colormode = colormodes[fileHelper.readUint16()];
    }

    return fileHeader;
};

exports.compose = function(fileHelper, psd) {
    var psd = psd || {};

    fileHelper.extend(26);
    fileHelper.writeString('8BPS');
    fileHelper.writeUint16(1);
    fileHelper.writeUint8Array([0,0,0,0,0,0]);
    fileHelper.writeUint16(psd.channels);
    fileHelper.writeUint32(psd.height);
    fileHelper.writeUint32(psd.width);
    fileHelper.writeUint16(psd.depth || 8);
    fileHelper.writeUint16(colormodes.indexOf(psd.colormode || 'RGB'));
};
