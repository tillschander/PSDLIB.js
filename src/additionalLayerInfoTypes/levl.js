var FileHelper = require('../FileHelper.js');

function parseLevelRecord(fileHelper) {
    var record = {};

    record.inputFloor = fileHelper.readUint16();
    record.inputCeiling = fileHelper.readUint16();
    record.outputFloor = fileHelper.readUint16();
    record.outputCeiling = fileHelper.readUint16();
    record.gamma = fileHelper.readUint16();

    return record;
}

exports.parse = function(fileHelper) {
    var data = {};

    data.version = fileHelper.readUint16();
    data.records = [];
    for(var i=0; i<29; i++) {
        data.records.push(parseLevelRecord(fileHelper));
    }
    var extraLevelsMarker = fileHelper.readString(4);
    if(extraLevelsMarker === 'Lvls') {
        data.version = fileHelper.readUint16();
        var extraLevelsCount = fileHelper.readUint16() - 29;
        for(var i=0; i<extraLevelsCount; i++) {
            data.records.push(parseLevelRecord(fileHelper));
        }
    } else {
        fileHelper.revert(4);
    }

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(292);
    sectionData.writeUint16(2); // Version
    for(var i=0; i<29; i++) {
        sectionData.writeUint16(data.records[i].inputFloor);
        sectionData.writeUint16(data.records[i].inputCeiling);
        sectionData.writeUint16(data.records[i].outputFloor);
        sectionData.writeUint16(data.records[i].outputCeiling);
        sectionData.writeUint16(data.records[i].gamma);
    }
    if(data.version === 3) {
        var additionalRecordCount = data.records.length - 29;
        sectionData.extend(4 + 2 + 2 + 10*additionalRecordCount);
        sectionData.writeString('Lvls');
        sectionData.writeUint16(3); // Version
        sectionData.writeUint16(data.records.length);
        for(var i=29; i<data.records.length; i++) {
            sectionData.writeUint16(data.records[i].inputFloor);
            sectionData.writeUint16(data.records[i].inputCeiling);
            sectionData.writeUint16(data.records[i].outputFloor);
            sectionData.writeUint16(data.records[i].outputCeiling);
            sectionData.writeUint16(data.records[i].gamma);
        }
    }

    return sectionData.arrayBuffer;
};
