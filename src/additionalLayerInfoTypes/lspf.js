var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    var flags = fileHelper.read8Bits();
    var data = {
        'transparancy': false,
        'composite': false,
        'position': false
    };

    fileHelper.skip(3);
    if (flags[0] === 1) {
        data['transparency'] = true;
    }
    if (flags[1] === 1) {
        data['composite'] = true;
    }
    if (flags[2] === 1) {
        data['position'] = true;
    }

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();
    var flags = [0, 0, 0, 0, 0, 0, 0, 0];

    sectionData.create(4);
    sectionData.writeUint8(0);
    sectionData.writeUint8(0);
    sectionData.writeUint8(0);
    if (data['transparency']) {
        flags[0] = 1;
    }
    if (data['composite']) {
        flags[1] = 1;
    }
    if (data['position']) {
        flags[2] = 1;
    }
    sectionData.write8Bits(flags);

    return sectionData.arrayBuffer;
};
