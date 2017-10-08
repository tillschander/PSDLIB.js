(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PSDLIB = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var File = function() {
    this.pointer = 0;
    this.arrayBuffer = undefined;
    this.dataView = undefined;
};
module.exports = File;

File.prototype.create = function(length) {
    this.arrayBuffer = new ArrayBuffer(length);
    this.dataView = new DataView(this.arrayBuffer);
};

File.prototype.open = function (arrayBuffer) {
    this.arrayBuffer = arrayBuffer;
    this.dataView = new DataView(this.arrayBuffer);
};

File.prototype.skip = function (length) {
    this.pointer += length;
};

File.prototype.revert = function (length) {
    this.pointer -= length;
};

File.prototype.extend = function(length) {
    // TODO: is there a better way to do this?
    var newArrayBuffer = new ArrayBuffer(this.arrayBuffer.byteLength + length);
    var newDataView = new DataView(newArrayBuffer);
    for(var i=0; i<this.arrayBuffer.byteLength; i++) {
        newDataView.setUint8(i, this.dataView.getUint8(i));
    }
    this.arrayBuffer = newArrayBuffer;
    this.dataView = newDataView;
}

File.prototype.read8Bits = function (length) {
    var base10 = this.readUint8();
    var base2 = (base10).toString(2);
    var bits = ('00000000' + base2).slice(-8).split('').map(function(x) {
        return parseInt(x, 10);
    });
    return bits;
};

File.prototype.write8Bits = function (bits) {
    var byte = parseInt(bits.join(''), 2);
    this.writeUint8(byte);
};

File.prototype.readInt8Array = function (length) {
    var data = new Int8Array(this.arrayBuffer, this.pointer, length);
    this.pointer += length;
    return data;
};

File.prototype.readUint8Array = function (length) {
    var data = new Uint8Array(this.arrayBuffer, this.pointer, length);
    this.pointer += length;
    return data;
};

File.prototype.writeUint8Array = function (data) {
    for(var i=0; i<data.length; i++) {
        this.writeUint8(data[i]);
    }
};

File.prototype.readInt16Array = function (length) {
    var data = new Int16Array(this.arrayBuffer, this.pointer, length);
    this.pointer += length*2;
    return data;
};

File.prototype.readUint16Array = function (length) {
    var data = new Uint16Array(this.arrayBuffer, this.pointer, length);
    this.pointer += length*2;
    return data;
};

File.prototype.readInt8 = function () {
    var data = this.dataView.getInt8(this.pointer);
    this.pointer += 1;
    return data;
};

File.prototype.readUint8 = function () {
    var data = this.dataView.getUint8(this.pointer);
    this.pointer += 1;
    return data;
};

File.prototype.writeUint8 = function (data) {
    this.dataView.setUint8(this.pointer, data);
    this.pointer += 1;
};

File.prototype.readInt16 = function () {
    var data = this.dataView.getInt16(this.pointer);
    this.pointer += 2;
    return data;
};

File.prototype.readUint16 = function () {
    var data = this.dataView.getUint16(this.pointer);
    this.pointer += 2;
    return data;
};

File.prototype.writeUint16 = function (data) {
    this.dataView.setUint16(this.pointer, data);
    this.pointer += 2;
};

File.prototype.readInt32 = function () {
    var data = this.dataView.getInt32(this.pointer);
    this.pointer += 4;
    return data;
};

File.prototype.readUint32 = function () {
    var data = this.dataView.getUint32(this.pointer);
    this.pointer += 4;
    return data;
};

File.prototype.writeUint32 = function (data) {
    this.dataView.setUint32(this.pointer, data);
    this.pointer += 4;
};

File.prototype.readFloat32 = function () {
    var data = this.dataView.getFloat32(this.pointer);
    this.pointer += 4;
    return data;
};

File.prototype.writeFloat32 = function (data) {
    this.dataView.setFloat32(this.pointer, data);
    this.pointer += 4;
};

File.prototype.readFloat64 = function () {
    var data = this.dataView.getFloat64(this.pointer);
    this.pointer += 8;
    return data;
};

File.prototype.writeFloat64 = function (data) {
    this.dataView.setFloat64(this.pointer, data);
    this.pointer += 8;
};

File.prototype.readString = function (length) {
	var string = '';
    var charCodes = this.readUint8Array(length);

	for (var i = 0; i < length; i++) {
		string += String.fromCharCode(charCodes[i]);
	}

	return string;
};

File.prototype.writeString = function (string) {
	for (var i = 0; i < string.length; i++) {
        this.writeUint8(string.charCodeAt(i));
    }
};

File.prototype.readPascalString = function (extra) {
    var length = this.readUint8();
    var string = this.readString(length);

    if(extra == 'evenLength' && (length + 1) % 2 !== 0) { // +1 to count the length byte
        this.skip(1);
    } else if (extra == 'multipleOfFourBytes' && (length + 1) % 4 !== 0) { // +1 to count the length byte
        this.skip(4 - ((length + 1) % 4)); // +1 to count the length byte
    }

    return string;
};

File.prototype.writePascalString = function (string, extra) {
    this.writeUint8(string.length);
    this.writeString(string);

    if(extra == 'evenLength' && (string.length + 1) % 2 !== 0) { // +1 to count the length byte
        this.writeUint8(0);
    } else if (extra == 'multipleOfFourBytes' && (string.length + 1) % 4 !== 0) { // +1 to count the length byte
        var zerosToWrite = 4 - ((string.length + 1) % 4); // +1 to count the length byte
        for(var i=0; i<zerosToWrite; i++) {
            this.writeUint8(0);
        }
    }

    return string;
};

File.prototype.readUnicodeString = function () {
    var string = '';
    var length = this.readUint32();

	for (var i = 0; i < length; i++) {
        var charCode = this.readUint16();

        if(charCode !== 0) {
		    string += String.fromCharCode(charCode);
        }
    }

    return string;
};

File.prototype.writeUnicodeString = function (string) {
    this.writeUint32(string.length);

	for (var i = 0; i < string.length; i++) {
        this.writeUint16(string.charCodeAt(i));
    }

    return string;
};

},{}],2:[function(require,module,exports){
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

},{"./FileHelper.js":1,"./additionalLayerInfoTypes.js":3}],3:[function(require,module,exports){
// TODO: maybe merge some modules of equal data structure (e.g. ID Stuff)
// TODO: add the rest
module.exports = {
    'lrFX': {
        name: 'Effects Layer'
    },
    'tySh': {
        name: 'Type Tool'
    },
    'luni': {
        name: 'Unicode layer name',
        module: require('./additionalLayerInfoTypes/luni.js')
    },
    'lyid': {
        name: 'Layer ID',
        module: require('./additionalLayerInfoTypes/lyid.js')
    },
    'lfx2': {
        name: 'Object-based effects layer'
    },
    'Patt': {
        name: 'Pattern'
    },
    'Pat2': {
        name: 'Pattern 2'
    },
    'Pat3': {
        name: 'Pattern 3'
    },
    'Anno': {
        name: 'Annotations'
    },
    'clbl': {
        name: 'Blend clipping elements',
        module: require('./additionalLayerInfoTypes/clbl.js')
    },
    'infx': {
        name: 'Blend interior elements',
        module: require('./additionalLayerInfoTypes/infx.js')
    },
    'knko': {
        name: 'Knockout setting',
        module: require('./additionalLayerInfoTypes/knko.js')
    },
    'lspf': {
        name: 'Protected setting',
        module: require('./additionalLayerInfoTypes/lspf.js')
    },
    'lclr': {
        name: 'Sheet color setting',
        module: require('./additionalLayerInfoTypes/lclr.js')
    },
    'fxrp': {
        name: 'Reference point',
        module: require('./additionalLayerInfoTypes/fxrp.js')
    },
    'grdm': {
        name: 'Gradient settings'
    },
    'lsct': {
        name: 'Section divider setting',
        module: require('./additionalLayerInfoTypes/lsct.js')
    },
    'brst': {
        name: 'Channel blending restrictions setting'
    },
    'SoCo': {
        name: 'Solid color sheet setting'
    },
    'PtFl': {
        name: 'Pattern fill setting'
    },
    'GdFl': {
        name: 'Gradient fill setting'
    },
    'vmsk': {
        name: 'Vector mask setting'
    },
    'vsms': {
        name: 'Vector mask setting'
    },
    'TySh': {
        name: 'Type tool object setting'
    },
    'ffxi': {
        name: 'Foreign effect ID',
        module: require('./additionalLayerInfoTypes/ffxi.js')
    },
    'lnsr': {
        name: 'Layer name source setting',
        module: require('./additionalLayerInfoTypes/lnsr.js')
    },
    'shpa': {
        name: 'Pattern data'
    },
    'shmd': {
        name: 'Metadata setting'
    },
    'lyvr': {
        name: 'Layer version',
        module: require('./additionalLayerInfoTypes/lyvr.js')
    },
    'tsly': {
        name: 'Transparency shapes layer',
        module: require('./additionalLayerInfoTypes/tsly.js')
    },
    'lmgm': {
        name: 'Layer mask as global mask',
        module: require('./additionalLayerInfoTypes/lmgm.js')
    },
    'vmgm': {
        name: 'Vector mask as global mask',
        module: require('./additionalLayerInfoTypes/vmgm.js')
    },
    'brit': {
        name: 'Brightness/Contrast',
        module: require('./additionalLayerInfoTypes/brit.js')
    },
    'mixr': {
        name: 'Channel Mixer'
    },
    'clrL': {
        name: 'Color Lookup'
    },
    'plLd': {
        name: 'Placed Layer'
    },
    'lnkD': {
        name: 'Linked Layer'
    },
    'lnk2': {
        name: 'Linked Layer'
    },
    'lnk3': {
        name: 'Linked Layer'
    },
    'phfl': {
        name: 'Photo Filter',
    },
    'blwh': {
        name: 'Black White'
    },
    'CgEd': {
        name: 'Content Generator Extra Data'
    },
    'Txt2': {
        name: 'Text Engine Data',
        module: require('./additionalLayerInfoTypes/txt2.js')
    },
    'vibA': {
        name: 'Vibrance'
    },
    'pths': {
        name: 'Unicode Path Name'
    },
    'anFX': {
        name: 'Animation Effects'
    },
    'FMsk': {
        name: 'Filter Mask'
    },
    'SoLd': {
        name: 'Placed Layer Data'
    },
    'vstk': {
        name: 'Vector Stroke Data'
    },
    'vscg': {
        name: 'FVector Stroke Content Data'
    },
    'sn2P': {
        name: 'Using Aligned Rendering',
        module: require('./additionalLayerInfoTypes/sn2p.js')
    },
    'vogk': {
        name: 'Vector Origination Data'
    },
    'Mtrn': {
        name: 'Saving Merged Transparency'
    },
    'Mt16': {
        name: 'Saving Merged Transparency'
    },
    'Mt32': {
        name: 'Saving Merged Transparency'
    },
    'LMsk': {
        name: 'User Mask'
    },
    'expA': {
        name: 'Exposure',
        module: require('./additionalLayerInfoTypes/expa.js')
    },
    'FXid': {
        name: 'Filter Mask'
    },
    'FEid': {
        name: 'Filter Effects'
    },
    'SoCo': {
        name: 'Solid Color'
    },
    'PtFl': {
        name: 'Pattern"'
    },
    'levl': {
        name: 'Levels',
        module: require('./additionalLayerInfoTypes/levl.js')
    },
    'curv': {
        name: 'Curves',
    },
    'hue ': {
        name: 'Old Hue/saturation',
    },
    'hue2': {
        name: 'Hue/saturation',
    },
    'blnc': {
        name: 'Color Balance',
    },
    'nvrt': {
        name: 'Invert',
    },
    'post': {
        name: 'Posterize',
    },
    'thrs': {
        name: 'Threshold',
    },
    'selc': {
        name: 'Selective color'
    }
};

},{"./additionalLayerInfoTypes/brit.js":4,"./additionalLayerInfoTypes/clbl.js":5,"./additionalLayerInfoTypes/expa.js":6,"./additionalLayerInfoTypes/ffxi.js":7,"./additionalLayerInfoTypes/fxrp.js":8,"./additionalLayerInfoTypes/infx.js":9,"./additionalLayerInfoTypes/knko.js":10,"./additionalLayerInfoTypes/lclr.js":11,"./additionalLayerInfoTypes/levl.js":12,"./additionalLayerInfoTypes/lmgm.js":13,"./additionalLayerInfoTypes/lnsr.js":14,"./additionalLayerInfoTypes/lsct.js":15,"./additionalLayerInfoTypes/lspf.js":16,"./additionalLayerInfoTypes/luni.js":17,"./additionalLayerInfoTypes/lyid.js":18,"./additionalLayerInfoTypes/lyvr.js":19,"./additionalLayerInfoTypes/sn2p.js":20,"./additionalLayerInfoTypes/tsly.js":21,"./additionalLayerInfoTypes/txt2.js":22,"./additionalLayerInfoTypes/vmgm.js":23}],4:[function(require,module,exports){
var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    var data = {};

    data.brightness = fileHelper.readUint16();
    data.contrast = fileHelper.readUint16();
    data.mean = fileHelper.readUint16();
    data.labOnly = Boolean(fileHelper.readUint8());

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(7);
    sectionData.writeUint16(data.brightness);
    sectionData.writeUint16(data.contrast);
    sectionData.writeUint16(data.mean);
    sectionData.writeUint8(data.labOnly ? 1 : 0);

    return sectionData.arrayBuffer;
};

},{"../FileHelper.js":1}],5:[function(require,module,exports){
var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    var data = Boolean(fileHelper.readUint8());

    fileHelper.skip(3);

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(4);
    sectionData.writeUint8(data ? 1 : 0);

    return sectionData.arrayBuffer;
};

},{"../FileHelper.js":1}],6:[function(require,module,exports){
var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    var data = {};

    data.version = fileHelper.readUint16();
    data.exposure = fileHelper.readUint32();
    data.offset = fileHelper.readUint32();
    data.gamma = fileHelper.readUint32();

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(14);
    sectionData.writeUint16(data.version);
    sectionData.writeUint32(data.exposure);
    sectionData.writeUint32(data.offset);
    sectionData.writeUint32(data.gamma);

    return sectionData.arrayBuffer;
};

},{"../FileHelper.js":1}],7:[function(require,module,exports){
var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    return fileHelper.readUint32(); // ID of the Foreign effect
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(4);
    sectionData.writeUint32(data);

    return sectionData.arrayBuffer;
};

},{"../FileHelper.js":1}],8:[function(require,module,exports){
var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    var data = {};

    data.x = fileHelper.readFloat64();
    data.y = fileHelper.readFloat64();

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(16);
    sectionData.writeFloat64(data.x);
    sectionData.writeFloat64(data.y);

    return sectionData.arrayBuffer;
};

},{"../FileHelper.js":1}],9:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"../FileHelper.js":1,"dup":5}],10:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"../FileHelper.js":1,"dup":5}],11:[function(require,module,exports){
var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    // TODO: this is probably wrong but i don't have files with data here
    var data = fileHelper.readUint32();

    fileHelper.skip(4);

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(8);
    sectionData.writeUint32(data);
    sectionData.writeUint32(0);

    return sectionData.arrayBuffer;
};

},{"../FileHelper.js":1}],12:[function(require,module,exports){
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

},{"../FileHelper.js":1}],13:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"../FileHelper.js":1,"dup":5}],14:[function(require,module,exports){
var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    // TODO: is this really a Uint32?
    return fileHelper.readUint32(); // ID for the layer name
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(4);
    sectionData.writeUint32(data);

    return sectionData.arrayBuffer;
};

},{"../FileHelper.js":1}],15:[function(require,module,exports){
var blendModes = require('../blendModes.js');
var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper, dataLength) {
    var data = {};
    var type = fileHelper.readUint32();

    if(type === 0) {
        data.type = 'other';
    } else if(type === 1) {
        data.type = 'open folder';
    } else if(type === 2) {
        data.type = 'closed folder';
    } else if(type === 3) {
        data.type = 'divider';
    }

    if(dataLength >= 12) {
        fileHelper.skip(4); // Signature
        data.blendMode = blendModes[fileHelper.readString(4)];
    }

    if(dataLength >= 16) {
        if(fileHelper.readUint32() === 0) {
            data.subType = 'normal';
        } else {
            data.subType = 'scene group';
        }
    }

    return data;
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(4);
    if(data.type === 'other') {
        sectionData.writeUint32(0);
    } else if(data.type === 'open folder') {
        sectionData.writeUint32(1);
    } else if(data.type === 'closed folder') {
        sectionData.writeUint32(2);
    } else if(data.type === 'divider') {
        sectionData.writeUint32(3);
    }

    if(data.blendMode !== undefined) {
        var blendModeKey = Object.keys(blendModes).filter(function(key) {
            return blendModes[key] === data.blendMode;
        })[0];
        sectionData.extend(8);
        sectionData.writeString('8BIM');
        sectionData.writeString(blendModeKey);
    }

    if(data.subType !== undefined) {
        sectionData.extend(4);
        if(data.subType === 'scene group') {
            sectionData.writeUint32(1);
        } else {
            sectionData.writeUint32(0);
        }
    }

    return sectionData.arrayBuffer;
};

},{"../FileHelper.js":1,"../blendModes.js":24}],16:[function(require,module,exports){
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

},{"../FileHelper.js":1}],17:[function(require,module,exports){
var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    return fileHelper.readUnicodeString();
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    // TODO: find out why this has to be two bytes longer than expected
    sectionData.create(data.length*2 + 6); // 2 Byte per char + 4 Byte for the length field
    sectionData.writeUnicodeString(data);

    return sectionData.arrayBuffer;
};

},{"../FileHelper.js":1}],18:[function(require,module,exports){
var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    return fileHelper.readUint32();
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(4);
    sectionData.writeUint32(data);

    return sectionData.arrayBuffer;
};

},{"../FileHelper.js":1}],19:[function(require,module,exports){
arguments[4][18][0].apply(exports,arguments)
},{"../FileHelper.js":1,"dup":18}],20:[function(require,module,exports){
var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    return Boolean(fileHelper.readUint32());
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(4);
    sectionData.writeUint32(data ? 1 : 0);

    return sectionData.arrayBuffer;
};

},{"../FileHelper.js":1}],21:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"../FileHelper.js":1,"dup":5}],22:[function(require,module,exports){
var FileHelper = require('../FileHelper.js');

exports.parse = function(fileHelper) {
    var length = fileHelper.readUint32();
    return fileHelper.readUint8Array(length);
};

exports.compose = function(data) {
    var sectionData = new FileHelper();

    sectionData.create(data.length + 4);
    sectionData.writeUint32(data.length);
    sectionData.writeUint8Array(data);

    return sectionData.arrayBuffer;
};

},{"../FileHelper.js":1}],23:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"../FileHelper.js":1,"dup":5}],24:[function(require,module,exports){
module.exports = {
    'pass': 'pass through',
    'norm': 'normal',
    'diss': 'dissolve',
    'dark': 'darken',
    'mul ': 'multiply',
    'idiv': 'color burn',
    'lbrn': 'linear burn',
    'dkCl': 'darker color',
    'lite': 'lighten',
    'scrn': 'screen',
    'div ': 'color dodge',
    'lddg': 'linear dodge',
    'lgCl': 'lighter color',
    'over': 'overlay',
    'sLit': 'soft light',
    'hLit': 'hard light',
    'vLit': 'vivid light',
    'lLit': 'linear light',
    'pLit': 'pin light',
    'hMix': 'hard mix',
    'diff': 'difference',
    'smud': 'exclusion',
    'fsub': 'subtract',
    'fdiv': 'divide',
    'hue ': 'hue',
    'sat ': 'saturation',
    'colr': 'color',
    'lum ': 'luminosity'
};

},{}],25:[function(require,module,exports){
var FileHelper = require('./FileHelper.js');

exports.parse = function(fileHelper) {
    var blendingRanges = [];
    var sectionLength = fileHelper.readUint32();

    for(var i=0; i<sectionLength; i+=4) {
        blendingRanges.push([
            fileHelper.readUint8(),
            fileHelper.readUint8(),
            fileHelper.readUint8(),
            fileHelper.readUint8(),
        ]);
    }

    return blendingRanges;
};

exports.compose = function(record) {
    var sectionData = new FileHelper();

    if(record.blendingRanges !== undefined) {
        var sectionDataLength = record.blendingRanges.length * 4;

        sectionData.create(sectionDataLength + 4);
        sectionData.writeUint32(sectionDataLength);
        for(var i=0; i<record.blendingRanges.length; i++) {
            sectionData.writeUint8Array(record.blendingRanges[i]);
        }
    } else {
        var ranges = record.channels.length * 2 + 2; // source and destination range per channel + two more

        sectionData.create(ranges*4 + 4);
        sectionData.writeUint32(ranges*4);
        for(var i=0; i<ranges; i++) {
            sectionData.writeUint8Array([0, 0, 255, 255]);
        }
    }

    return sectionData.arrayBuffer;
};

},{"./FileHelper.js":1}],26:[function(require,module,exports){
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

},{"./FileHelper.js":1,"./imageData.js":30}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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

},{"./FileHelper.js":1}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
var rle = require('./rle.js');

exports.parse = function(fileHelper, width, height, channelCount) {
    var imageData = [];
    var pixelCount = width * height;

    try {
        var compression = fileHelper.readUint16();

        if (compression === 0) { // RAW
            for(var i=0; i<channelCount; i++) {
                imageData[i] = fileHelper.readUint8Array(pixelCount);
            }
        } else if (compression === 1) {  // RLE
            // TODO: can this be optimized?
            var scanLineCount = height * channelCount;
            var byteCounts = [];
            var decompressedData = new Uint8Array(scanLineCount*width);

            for(var i=0; i<scanLineCount; i++) {
                byteCounts[i] = fileHelper.readUint16();
            }
            for(var i=0; i<scanLineCount; i++) {
                var encodedArray = fileHelper.readInt8Array(byteCounts[i]);
                var decodedArray = rle.decode(encodedArray);
                decompressedData.set(decodedArray, i*width);
            }
            for(var i=0; i<channelCount; i++) {
                imageData[i] = decompressedData.slice(i*pixelCount, i*pixelCount+pixelCount);
            }
        } else {
            // TODO: case 2 & 3: ZIP compression
            console.error('FATAL ERROR: Unknown compression type ' + compression);
        }
    } catch (exception) {
        // Composite image not present
        // In theory we could rebuild it from all the layer data
        // But thats almost like rebuilding photoshop completely
    }

    return imageData;
};

exports.compose = function(fileHelper, psd) {
    var psd = psd || {};

    if(psd.imageData !== undefined && psd.imageData[0] !== undefined) {
        fileHelper.extend(psd.imageData[0].length * psd.imageData.length + 2); // Channel length * channel count + size
        fileHelper.writeUint16(0); // TODO: maybe use compression in the future
        for(var i=0; i<psd.imageData.length; i++) {
            fileHelper.writeUint8Array(psd.imageData[i]);
        }
    } else {
        fileHelper.extend(3);
    }
};

},{"./rle.js":38}],31:[function(require,module,exports){
exports.toBase64 = function() {
    if (typeof window === 'undefined') {
        console.error('This function is not yet supported outside of browsers.');
        return;
    }

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = this.width;
    canvas.height = this.height;

    if(this.width > 0 && this.height > 0) {
        var imageData = ctx.getImageData(0, 0, this.width, this.height);
        var r = this.channels.filter(function(channel) { return channel.id === 0; })[0];
        var g = this.channels.filter(function(channel) { return channel.id === 1; })[0];
        var b = this.channels.filter(function(channel) { return channel.id === 2; })[0];
        var a = this.channels.filter(function(channel) { return channel.id === -2; })[0];
        if(a === undefined) {
            a = this.channels.filter(function(channel) { return channel.id === -1; })[0];
        }

        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var index = this.width * y + x;
                var maskIndex = index;

                if(this.maskData !== undefined && this.maskData.top !== undefined) {
                    var yMask = y + this.top - this.maskData.top;
                    var xMask = x + this.left - this.maskData.left;
                    var maskIndex = this.maskData.width * yMask + xMask;
                }

                imageData.data[index*4] = r.data[index];
                imageData.data[index*4 + 1] = g.data[index];
                imageData.data[index*4 + 2] = b.data[index];
                if(a !== undefined && a.data !== undefined) {
                    imageData.data[index*4 + 3] = a.data[maskIndex];
                } else {
                    imageData.data[index*4 + 3] = 255;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    return canvas.toDataURL('image/png');
};

exports.toPng = function() {
    if (typeof window === 'undefined') {
        console.error('This function is not yet supported outside of browsers.');
        return;
    }
    
    var dataUrl = this.toBase64();
    var image = new Image();

    image.width = this.width;
    image.height = this.height;
    image.src = dataUrl;

    return image;
};

},{}],32:[function(require,module,exports){
var FileHelper = require('./FileHelper.js');

exports.parse = function(fileHelper) {
    var imageResources = [];
    var imageResourcesEnd = fileHelper.pointer + fileHelper.readUint32();

    while(fileHelper.pointer < imageResourcesEnd) {
        var block = {};

        if(fileHelper.readString(4) === '8BIM') { // correct signature
            block.id = fileHelper.readUint16();
            block.name = fileHelper.readPascalString('evenLength');
            var dataLength = fileHelper.readUint32();
            block.data = fileHelper.readUint8Array(dataLength);
            if(dataLength % 2 !== 0) fileHelper.skip(1);  // padded to even length
            // TODO: do something with the data (at least with some of it)
            imageResources.push(block);
        }
    }

    return imageResources;
};

exports.compose = function(fileHelper, psd) {
    var psd = psd || {};

    if(psd.imageResources === undefined) { // No image resources
        fileHelper.extend(4);
        fileHelper.writeUint32(0);
    } else {
        var sectionData = new FileHelper();
        sectionData.create(0);

        for(var i=0; i<psd.imageResources.length; i++) {
            sectionData.extend(4);
            sectionData.writeString('8BIM');

            sectionData.extend(2);
            sectionData.writeUint16(psd.imageResources[i].id);

            if(psd.imageResources[i].name === undefined || psd.imageResources[i].name.length === 0) {
                sectionData.extend(2);
                sectionData.writeString('\0\0'); // Empty name is two zeros
            } else {
                var nameLength = Math.ceil(psd.imageResources[i].name.length/2.0) * 2 + 1; // multiple of two + 1 Byte length data
                sectionData.extend(nameLength); //
                sectionData.writePascalString(psd.imageResources[i].name, 'evenLength');
            }

            sectionData.extend(4);
            sectionData.writeUint32(psd.imageResources[i].data.length);

            sectionData.extend(psd.imageResources[i].data.length);
            sectionData.writeUint8Array(psd.imageResources[i].data);

            if(psd.imageResources[i].data.length % 2 !== 0) {  // pad to even length
                sectionData.extend(1);
                sectionData.writeUint8(0);
            }
        }

        fileHelper.extend(4);
        fileHelper.writeUint32(sectionData.arrayBuffer.byteLength); // section length
        fileHelper.extend(sectionData.arrayBuffer.byteLength);
        fileHelper.writeUint8Array(new Uint8Array(sectionData.arrayBuffer));   // section data
    }
};

},{"./FileHelper.js":1}],33:[function(require,module,exports){
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

},{"./channelImageData.js":26,"./globalLayerMaskInfo.js":28,"./layerInfo.js":34}],34:[function(require,module,exports){
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

},{"./FileHelper.js":1,"./layerRecord.js":36}],35:[function(require,module,exports){
var FileHelper = require('./FileHelper.js');

exports.parse = function(fileHelper) {
    var maskData = {};
    var sectionLength = fileHelper.readUint32();

    if(sectionLength !== 0) {
        maskData.top = fileHelper.readUint32();
        maskData.left = fileHelper.readUint32();
        maskData.bottom = fileHelper.readUint32();
        maskData.right = fileHelper.readUint32();
        maskData.width = maskData.right - maskData.left;
        maskData.height = maskData.bottom - maskData.top;
        maskData.defaultColor = fileHelper.readUint8();
        maskData.flags = fileHelper.read8Bits();
        maskData.flags = maskData.flags.slice(0, 5); // Only the first five bits are flags
        if(maskData.flags[4] === 1) {
            // TODO: mask parameters
            console.error('FATAL ERROR: Mask Parsing not fully implemented');
        }
        if(sectionLength === 20) {
            fileHelper.skip(2);
        } else {
            // TODO: Spec says the same data is repeated now?
            console.error('FATAL ERROR: Mask Parsing not fully implemented');
        }
    }

    return maskData;
};

exports.compose = function(record) {
    var sectionData = new FileHelper();

    if(record.maskData === undefined || record.maskData.top === undefined) { // no mask
        sectionData.create(4);
        sectionData.writeUint32(0); // Section length
    } else {
        sectionData.create(24);
        sectionData.writeUint32(20); // Section length
        sectionData.writeUint32(record.maskData.top);
        sectionData.writeUint32(record.maskData.left);
        sectionData.writeUint32(record.maskData.bottom);
        sectionData.writeUint32(record.maskData.right);
        sectionData.writeUint8(record.maskData.defaultColor || 255);
        record.maskData.flags = record.maskData.flags || [0, 0, 0, 0, 0];
        record.maskData.flags.push(0, 0, 0); // Fill with zeros to get 8 bits
        sectionData.write8Bits(record.maskData.flags);
        sectionData.writeUint16(0); // Padding
        // TODO: mask parameters
    }

    return sectionData.arrayBuffer;
};

},{"./FileHelper.js":1}],36:[function(require,module,exports){
var blendModes = require('./blendModes.js');
var layerMaskData = require('./layerMaskData.js');
var blendingRanges = require('./blendingRanges.js');
var additionalLayerInfo = require('./additionalLayerInfo.js');
var imageHelper = require('./imageHelper.js');
var FileHelper = require('./FileHelper.js');

exports.parse = function(fileHelper) {
    var record = {};

    record.top = fileHelper.readUint32();
    record.left = fileHelper.readUint32();
    record.bottom = fileHelper.readUint32();
    record.right = fileHelper.readUint32();
    record.width = record.right - record.left;
    record.height = record.bottom - record.top;
    var channelCount = fileHelper.readUint16();
    record.channelInfo = [];
    for(var i=0; i<channelCount; i++) {
        record.channelInfo.push({
            id: fileHelper.readInt16(),
            dataLength: fileHelper.readUint32()
        });
    }
    fileHelper.skip(4); // blend mode signature
    record.blendMode = blendModes[fileHelper.readString(4)];
    record.opacity = fileHelper.readUint8();
    record.clipping = fileHelper.readUint8();
    record.flags = fileHelper.read8Bits();
    record.flags = record.flags.slice(0, 5); // Only the first five bits are flags
    fileHelper.skip(1); // Filler

    var extraDataEnd = fileHelper.pointer + fileHelper.readUint32();
    record.maskData = layerMaskData.parse(fileHelper);
    record.blendingRanges = blendingRanges.parse(fileHelper);
    record.name = fileHelper.readPascalString('multipleOfFourBytes');
    record.additionalLayerInfo = [];
    while(fileHelper.pointer < extraDataEnd) {
        var item = additionalLayerInfo.parse(fileHelper);
        record.additionalLayerInfo.push(item);
    }

    record.toBase64 = imageHelper.toBase64;
    record.toPng = imageHelper.toPng;

    return record;
};

exports.compose = function(record) {
    var record = record || {};
    var sectionData = new FileHelper();

    sectionData.create(34 + 6*record.channels.length);
    sectionData.writeUint32(record.top);
    sectionData.writeUint32(record.left);
    sectionData.writeUint32(record.bottom);
    sectionData.writeUint32(record.right);
    sectionData.writeUint16(record.channels.length);
    for(var i=0; i<record.channels.length; i++) {
        sectionData.writeUint16(record.channels[i].id); // ChannelID
        sectionData.writeUint32(record.channels[i].data.length + 2); // Channel length
    }
    sectionData.writeString('8BIM');
    var blendModeKey = Object.keys(blendModes).filter(function(key) {
        return blendModes[key] === record.blendMode;
    })[0];
    sectionData.writeString(blendModeKey || 'norm');
    sectionData.writeUint8(record.opacity || 255);
    sectionData.writeUint8(record.clipping || 0);
    record.flags = record.flags || [0, 0, 0, 0, 0];
    record.flags.push(0, 0, 0); // Fill with zeros to get 8 bits
    sectionData.write8Bits(record.flags);
    sectionData.writeUint8(0); // Filler
    var layerMaskDataSection = layerMaskData.compose(record);
    var blendingRangesSection = blendingRanges.compose(record);
    var additionalLayerInfoSection = additionalLayerInfo.compose(record);
    var nameLength = Math.ceil((record.name.length+1)/4.0) * 4; // multiple of four (+1 to count the length byte)
    var extraDataLength = layerMaskDataSection.byteLength + blendingRangesSection.byteLength;
    extraDataLength += nameLength + additionalLayerInfoSection.byteLength;
    sectionData.writeUint32(extraDataLength);
    sectionData.extend(extraDataLength);
    sectionData.writeUint8Array(new Uint8Array(layerMaskDataSection));
    sectionData.writeUint8Array(new Uint8Array(blendingRangesSection));
    sectionData.writePascalString(record.name, 'multipleOfFourBytes');
    sectionData.writeUint8Array(new Uint8Array(additionalLayerInfoSection));

    return sectionData.arrayBuffer;
};

},{"./FileHelper.js":1,"./additionalLayerInfo.js":2,"./blendModes.js":24,"./blendingRanges.js":25,"./imageHelper.js":31,"./layerMaskData.js":35}],37:[function(require,module,exports){
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

},{"./FileHelper.js":1,"./colorModeData.js":27,"./header.js":29,"./imageData.js":30,"./imageHelper.js":31,"./imageResources.js":32,"./layerAndMaskInfo.js":33}],38:[function(require,module,exports){
// PackBits run-length decoding
exports.decode = function(encodedArray) {
    var decodedArray = [];
    var i=0;

    while (i < encodedArray.length) {
        var n = encodedArray[i];
        if(encodedArray[i] > -1) {
            for(var j=0; j<n+1; j++) {
                i++;
                decodedArray.push(encodedArray[i]);
            }
        } else if (encodedArray[i] > -128) {
            i++;
            for(var j=0; j<1-n; j++) {
                decodedArray.push(encodedArray[i]);
            }
        }
        i++;
    }

    return Uint8Array.from(decodedArray);
};

},{}]},{},[37])(37)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRmlsZUhlbHBlci5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvLmpzIiwic3JjL2FkZGl0aW9uYWxMYXllckluZm9UeXBlcy5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvYnJpdC5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvY2xibC5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvZXhwYS5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvZmZ4aS5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvZnhycC5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvbGNsci5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvbGV2bC5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvbG5zci5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvbHNjdC5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvbHNwZi5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvbHVuaS5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvbHlpZC5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvc24ycC5qcyIsInNyYy9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvdHh0Mi5qcyIsInNyYy9ibGVuZE1vZGVzLmpzIiwic3JjL2JsZW5kaW5nUmFuZ2VzLmpzIiwic3JjL2NoYW5uZWxJbWFnZURhdGEuanMiLCJzcmMvY29sb3JNb2RlRGF0YS5qcyIsInNyYy9nbG9iYWxMYXllck1hc2tJbmZvLmpzIiwic3JjL2hlYWRlci5qcyIsInNyYy9pbWFnZURhdGEuanMiLCJzcmMvaW1hZ2VIZWxwZXIuanMiLCJzcmMvaW1hZ2VSZXNvdXJjZXMuanMiLCJzcmMvbGF5ZXJBbmRNYXNrSW5mby5qcyIsInNyYy9sYXllckluZm8uanMiLCJzcmMvbGF5ZXJNYXNrRGF0YS5qcyIsInNyYy9sYXllclJlY29yZC5qcyIsInNyYy9wc2RsaWIuanMiLCJzcmMvcmxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEZpbGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBvaW50ZXIgPSAwO1xuICAgIHRoaXMuYXJyYXlCdWZmZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5kYXRhVmlldyA9IHVuZGVmaW5lZDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEZpbGU7XG5cbkZpbGUucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGxlbmd0aCkge1xuICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIobGVuZ3RoKTtcbiAgICB0aGlzLmRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KHRoaXMuYXJyYXlCdWZmZXIpO1xufTtcblxuRmlsZS5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uIChhcnJheUJ1ZmZlcikge1xuICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBhcnJheUJ1ZmZlcjtcbiAgICB0aGlzLmRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KHRoaXMuYXJyYXlCdWZmZXIpO1xufTtcblxuRmlsZS5wcm90b3R5cGUuc2tpcCA9IGZ1bmN0aW9uIChsZW5ndGgpIHtcbiAgICB0aGlzLnBvaW50ZXIgKz0gbGVuZ3RoO1xufTtcblxuRmlsZS5wcm90b3R5cGUucmV2ZXJ0ID0gZnVuY3Rpb24gKGxlbmd0aCkge1xuICAgIHRoaXMucG9pbnRlciAtPSBsZW5ndGg7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5leHRlbmQgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgICAvLyBUT0RPOiBpcyB0aGVyZSBhIGJldHRlciB3YXkgdG8gZG8gdGhpcz9cbiAgICB2YXIgbmV3QXJyYXlCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIodGhpcy5hcnJheUJ1ZmZlci5ieXRlTGVuZ3RoICsgbGVuZ3RoKTtcbiAgICB2YXIgbmV3RGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcobmV3QXJyYXlCdWZmZXIpO1xuICAgIGZvcih2YXIgaT0wOyBpPHRoaXMuYXJyYXlCdWZmZXIuYnl0ZUxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5ld0RhdGFWaWV3LnNldFVpbnQ4KGksIHRoaXMuZGF0YVZpZXcuZ2V0VWludDgoaSkpO1xuICAgIH1cbiAgICB0aGlzLmFycmF5QnVmZmVyID0gbmV3QXJyYXlCdWZmZXI7XG4gICAgdGhpcy5kYXRhVmlldyA9IG5ld0RhdGFWaWV3O1xufVxuXG5GaWxlLnByb3RvdHlwZS5yZWFkOEJpdHMgPSBmdW5jdGlvbiAobGVuZ3RoKSB7XG4gICAgdmFyIGJhc2UxMCA9IHRoaXMucmVhZFVpbnQ4KCk7XG4gICAgdmFyIGJhc2UyID0gKGJhc2UxMCkudG9TdHJpbmcoMik7XG4gICAgdmFyIGJpdHMgPSAoJzAwMDAwMDAwJyArIGJhc2UyKS5zbGljZSgtOCkuc3BsaXQoJycpLm1hcChmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh4LCAxMCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGJpdHM7XG59O1xuXG5GaWxlLnByb3RvdHlwZS53cml0ZThCaXRzID0gZnVuY3Rpb24gKGJpdHMpIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KGJpdHMuam9pbignJyksIDIpO1xuICAgIHRoaXMud3JpdGVVaW50OChieXRlKTtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRJbnQ4QXJyYXkgPSBmdW5jdGlvbiAobGVuZ3RoKSB7XG4gICAgdmFyIGRhdGEgPSBuZXcgSW50OEFycmF5KHRoaXMuYXJyYXlCdWZmZXIsIHRoaXMucG9pbnRlciwgbGVuZ3RoKTtcbiAgICB0aGlzLnBvaW50ZXIgKz0gbGVuZ3RoO1xuICAgIHJldHVybiBkYXRhO1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFVpbnQ4QXJyYXkgPSBmdW5jdGlvbiAobGVuZ3RoKSB7XG4gICAgdmFyIGRhdGEgPSBuZXcgVWludDhBcnJheSh0aGlzLmFycmF5QnVmZmVyLCB0aGlzLnBvaW50ZXIsIGxlbmd0aCk7XG4gICAgdGhpcy5wb2ludGVyICs9IGxlbmd0aDtcbiAgICByZXR1cm4gZGF0YTtcbn07XG5cbkZpbGUucHJvdG90eXBlLndyaXRlVWludDhBcnJheSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZm9yKHZhciBpPTA7IGk8ZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLndyaXRlVWludDgoZGF0YVtpXSk7XG4gICAgfVxufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZEludDE2QXJyYXkgPSBmdW5jdGlvbiAobGVuZ3RoKSB7XG4gICAgdmFyIGRhdGEgPSBuZXcgSW50MTZBcnJheSh0aGlzLmFycmF5QnVmZmVyLCB0aGlzLnBvaW50ZXIsIGxlbmd0aCk7XG4gICAgdGhpcy5wb2ludGVyICs9IGxlbmd0aCoyO1xuICAgIHJldHVybiBkYXRhO1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFVpbnQxNkFycmF5ID0gZnVuY3Rpb24gKGxlbmd0aCkge1xuICAgIHZhciBkYXRhID0gbmV3IFVpbnQxNkFycmF5KHRoaXMuYXJyYXlCdWZmZXIsIHRoaXMucG9pbnRlciwgbGVuZ3RoKTtcbiAgICB0aGlzLnBvaW50ZXIgKz0gbGVuZ3RoKjI7XG4gICAgcmV0dXJuIGRhdGE7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YVZpZXcuZ2V0SW50OCh0aGlzLnBvaW50ZXIpO1xuICAgIHRoaXMucG9pbnRlciArPSAxO1xuICAgIHJldHVybiBkYXRhO1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFVpbnQ4ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhVmlldy5nZXRVaW50OCh0aGlzLnBvaW50ZXIpO1xuICAgIHRoaXMucG9pbnRlciArPSAxO1xuICAgIHJldHVybiBkYXRhO1xufTtcblxuRmlsZS5wcm90b3R5cGUud3JpdGVVaW50OCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdGhpcy5kYXRhVmlldy5zZXRVaW50OCh0aGlzLnBvaW50ZXIsIGRhdGEpO1xuICAgIHRoaXMucG9pbnRlciArPSAxO1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZEludDE2ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhVmlldy5nZXRJbnQxNih0aGlzLnBvaW50ZXIpO1xuICAgIHRoaXMucG9pbnRlciArPSAyO1xuICAgIHJldHVybiBkYXRhO1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFVpbnQxNiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YVZpZXcuZ2V0VWludDE2KHRoaXMucG9pbnRlcik7XG4gICAgdGhpcy5wb2ludGVyICs9IDI7XG4gICAgcmV0dXJuIGRhdGE7XG59O1xuXG5GaWxlLnByb3RvdHlwZS53cml0ZVVpbnQxNiA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdGhpcy5kYXRhVmlldy5zZXRVaW50MTYodGhpcy5wb2ludGVyLCBkYXRhKTtcbiAgICB0aGlzLnBvaW50ZXIgKz0gMjtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRJbnQzMiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YVZpZXcuZ2V0SW50MzIodGhpcy5wb2ludGVyKTtcbiAgICB0aGlzLnBvaW50ZXIgKz0gNDtcbiAgICByZXR1cm4gZGF0YTtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRVaW50MzIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFWaWV3LmdldFVpbnQzMih0aGlzLnBvaW50ZXIpO1xuICAgIHRoaXMucG9pbnRlciArPSA0O1xuICAgIHJldHVybiBkYXRhO1xufTtcblxuRmlsZS5wcm90b3R5cGUud3JpdGVVaW50MzIgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHRoaXMuZGF0YVZpZXcuc2V0VWludDMyKHRoaXMucG9pbnRlciwgZGF0YSk7XG4gICAgdGhpcy5wb2ludGVyICs9IDQ7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5yZWFkRmxvYXQzMiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YVZpZXcuZ2V0RmxvYXQzMih0aGlzLnBvaW50ZXIpO1xuICAgIHRoaXMucG9pbnRlciArPSA0O1xuICAgIHJldHVybiBkYXRhO1xufTtcblxuRmlsZS5wcm90b3R5cGUud3JpdGVGbG9hdDMyID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB0aGlzLmRhdGFWaWV3LnNldEZsb2F0MzIodGhpcy5wb2ludGVyLCBkYXRhKTtcbiAgICB0aGlzLnBvaW50ZXIgKz0gNDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRGbG9hdDY0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhVmlldy5nZXRGbG9hdDY0KHRoaXMucG9pbnRlcik7XG4gICAgdGhpcy5wb2ludGVyICs9IDg7XG4gICAgcmV0dXJuIGRhdGE7XG59O1xuXG5GaWxlLnByb3RvdHlwZS53cml0ZUZsb2F0NjQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHRoaXMuZGF0YVZpZXcuc2V0RmxvYXQ2NCh0aGlzLnBvaW50ZXIsIGRhdGEpO1xuICAgIHRoaXMucG9pbnRlciArPSA4O1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFN0cmluZyA9IGZ1bmN0aW9uIChsZW5ndGgpIHtcblx0dmFyIHN0cmluZyA9ICcnO1xuICAgIHZhciBjaGFyQ29kZXMgPSB0aGlzLnJlYWRVaW50OEFycmF5KGxlbmd0aCk7XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdHN0cmluZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXJDb2Rlc1tpXSk7XG5cdH1cblxuXHRyZXR1cm4gc3RyaW5nO1xufTtcblxuRmlsZS5wcm90b3R5cGUud3JpdGVTdHJpbmcgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMud3JpdGVVaW50OChzdHJpbmcuY2hhckNvZGVBdChpKSk7XG4gICAgfVxufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFBhc2NhbFN0cmluZyA9IGZ1bmN0aW9uIChleHRyYSkge1xuICAgIHZhciBsZW5ndGggPSB0aGlzLnJlYWRVaW50OCgpO1xuICAgIHZhciBzdHJpbmcgPSB0aGlzLnJlYWRTdHJpbmcobGVuZ3RoKTtcblxuICAgIGlmKGV4dHJhID09ICdldmVuTGVuZ3RoJyAmJiAobGVuZ3RoICsgMSkgJSAyICE9PSAwKSB7IC8vICsxIHRvIGNvdW50IHRoZSBsZW5ndGggYnl0ZVxuICAgICAgICB0aGlzLnNraXAoMSk7XG4gICAgfSBlbHNlIGlmIChleHRyYSA9PSAnbXVsdGlwbGVPZkZvdXJCeXRlcycgJiYgKGxlbmd0aCArIDEpICUgNCAhPT0gMCkgeyAvLyArMSB0byBjb3VudCB0aGUgbGVuZ3RoIGJ5dGVcbiAgICAgICAgdGhpcy5za2lwKDQgLSAoKGxlbmd0aCArIDEpICUgNCkpOyAvLyArMSB0byBjb3VudCB0aGUgbGVuZ3RoIGJ5dGVcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nO1xufTtcblxuRmlsZS5wcm90b3R5cGUud3JpdGVQYXNjYWxTdHJpbmcgPSBmdW5jdGlvbiAoc3RyaW5nLCBleHRyYSkge1xuICAgIHRoaXMud3JpdGVVaW50OChzdHJpbmcubGVuZ3RoKTtcbiAgICB0aGlzLndyaXRlU3RyaW5nKHN0cmluZyk7XG5cbiAgICBpZihleHRyYSA9PSAnZXZlbkxlbmd0aCcgJiYgKHN0cmluZy5sZW5ndGggKyAxKSAlIDIgIT09IDApIHsgLy8gKzEgdG8gY291bnQgdGhlIGxlbmd0aCBieXRlXG4gICAgICAgIHRoaXMud3JpdGVVaW50OCgwKTtcbiAgICB9IGVsc2UgaWYgKGV4dHJhID09ICdtdWx0aXBsZU9mRm91ckJ5dGVzJyAmJiAoc3RyaW5nLmxlbmd0aCArIDEpICUgNCAhPT0gMCkgeyAvLyArMSB0byBjb3VudCB0aGUgbGVuZ3RoIGJ5dGVcbiAgICAgICAgdmFyIHplcm9zVG9Xcml0ZSA9IDQgLSAoKHN0cmluZy5sZW5ndGggKyAxKSAlIDQpOyAvLyArMSB0byBjb3VudCB0aGUgbGVuZ3RoIGJ5dGVcbiAgICAgICAgZm9yKHZhciBpPTA7IGk8emVyb3NUb1dyaXRlOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMud3JpdGVVaW50OCgwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmc7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5yZWFkVW5pY29kZVN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3RyaW5nID0gJyc7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMucmVhZFVpbnQzMigpO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoYXJDb2RlID0gdGhpcy5yZWFkVWludDE2KCk7XG5cbiAgICAgICAgaWYoY2hhckNvZGUgIT09IDApIHtcblx0XHQgICAgc3RyaW5nICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZztcbn07XG5cbkZpbGUucHJvdG90eXBlLndyaXRlVW5pY29kZVN0cmluZyA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICB0aGlzLndyaXRlVWludDMyKHN0cmluZy5sZW5ndGgpO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMud3JpdGVVaW50MTYoc3RyaW5nLmNoYXJDb2RlQXQoaSkpO1xuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmc7XG59O1xuIiwidmFyIHR5cGVzID0gcmVxdWlyZSgnLi9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMuanMnKTtcbnZhciBGaWxlSGVscGVyID0gcmVxdWlyZSgnLi9GaWxlSGVscGVyLmpzJyk7XG5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbihmaWxlSGVscGVyKSB7XG4gICAgdmFyIGl0ZW0gPSB7fTtcblxuICAgIGZpbGVIZWxwZXIuc2tpcCg0KTsgLy8gc2lnbmF0dXJlXG4gICAgaXRlbS5rZXkgPSBmaWxlSGVscGVyLnJlYWRTdHJpbmcoNCk7XG4gICAgaXRlbS5uYW1lID0gdHlwZXNbaXRlbS5rZXldLm5hbWU7XG5cbiAgICB2YXIgZGF0YUxlbmd0aCA9IGZpbGVIZWxwZXIucmVhZFVpbnQzMigpO1xuICAgIHZhciBzdGFydFBvc2l0aW9uID0gZmlsZUhlbHBlci5wb2ludGVyO1xuXG4gICAgaWYodHlwZXNbaXRlbS5rZXldLm1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGl0ZW0uZGF0YSA9IHR5cGVzW2l0ZW0ua2V5XS5tb2R1bGUucGFyc2UoZmlsZUhlbHBlciwgZGF0YUxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaXRlbS5kYXRhID0gZmlsZUhlbHBlci5yZWFkVWludDhBcnJheShkYXRhTGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihmaWxlSGVscGVyLnBvaW50ZXIgPCBzdGFydFBvc2l0aW9uICsgZGF0YUxlbmd0aCkge1xuICAgICAgICBmaWxlSGVscGVyLnNraXAoZGF0YUxlbmd0aCAtIChmaWxlSGVscGVyLnBvaW50ZXIgLSBzdGFydFBvc2l0aW9uKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW07XG59O1xuXG5leHBvcnRzLmNvbXBvc2UgPSBmdW5jdGlvbihyZWNvcmQpIHtcbiAgICB2YXIgc2VjdGlvbkRhdGEgPSBuZXcgRmlsZUhlbHBlcigpO1xuICAgIHNlY3Rpb25EYXRhLmNyZWF0ZSgwKTtcblxuICAgIGlmKHJlY29yZC5hZGRpdGlvbmFsTGF5ZXJJbmZvICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZm9yKHZhciBpPTA7IGk8cmVjb3JkLmFkZGl0aW9uYWxMYXllckluZm8ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpbmZvID0gcmVjb3JkLmFkZGl0aW9uYWxMYXllckluZm9baV07XG4gICAgICAgICAgICBpZih0eXBlc1tpbmZvLmtleV0gIT09IHVuZGVmaW5lZCAmJiB0eXBlc1tpbmZvLmtleV0ubW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5mb1NlY3Rpb24gPSBuZXcgVWludDhBcnJheSh0eXBlc1tpbmZvLmtleV0ubW9kdWxlLmNvbXBvc2UoaW5mby5kYXRhKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBpbmZvU2VjdGlvbiA9IGluZm8uZGF0YTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VjdGlvbkRhdGEuZXh0ZW5kKGluZm9TZWN0aW9uLmxlbmd0aCArIDEyKTtcbiAgICAgICAgICAgIHNlY3Rpb25EYXRhLndyaXRlU3RyaW5nKCc4QklNJyk7IC8vIFRPRE86IHNwZWMgc2F5cyB0aGlzIGNhbiBiZSAnOEI2NCcgYXN3ZWxsP1xuICAgICAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVTdHJpbmcoaW5mby5rZXkpO1xuICAgICAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MzIoaW5mb1NlY3Rpb24ubGVuZ3RoKTtcbiAgICAgICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDhBcnJheShpbmZvU2VjdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2VjdGlvbkRhdGEuYXJyYXlCdWZmZXI7XG59O1xuIiwiLy8gVE9ETzogbWF5YmUgbWVyZ2Ugc29tZSBtb2R1bGVzIG9mIGVxdWFsIGRhdGEgc3RydWN0dXJlIChlLmcuIElEIFN0dWZmKVxuLy8gVE9ETzogYWRkIHRoZSByZXN0XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAnbHJGWCc6IHtcbiAgICAgICAgbmFtZTogJ0VmZmVjdHMgTGF5ZXInXG4gICAgfSxcbiAgICAndHlTaCc6IHtcbiAgICAgICAgbmFtZTogJ1R5cGUgVG9vbCdcbiAgICB9LFxuICAgICdsdW5pJzoge1xuICAgICAgICBuYW1lOiAnVW5pY29kZSBsYXllciBuYW1lJyxcbiAgICAgICAgbW9kdWxlOiByZXF1aXJlKCcuL2FkZGl0aW9uYWxMYXllckluZm9UeXBlcy9sdW5pLmpzJylcbiAgICB9LFxuICAgICdseWlkJzoge1xuICAgICAgICBuYW1lOiAnTGF5ZXIgSUQnLFxuICAgICAgICBtb2R1bGU6IHJlcXVpcmUoJy4vYWRkaXRpb25hbExheWVySW5mb1R5cGVzL2x5aWQuanMnKVxuICAgIH0sXG4gICAgJ2xmeDInOiB7XG4gICAgICAgIG5hbWU6ICdPYmplY3QtYmFzZWQgZWZmZWN0cyBsYXllcidcbiAgICB9LFxuICAgICdQYXR0Jzoge1xuICAgICAgICBuYW1lOiAnUGF0dGVybidcbiAgICB9LFxuICAgICdQYXQyJzoge1xuICAgICAgICBuYW1lOiAnUGF0dGVybiAyJ1xuICAgIH0sXG4gICAgJ1BhdDMnOiB7XG4gICAgICAgIG5hbWU6ICdQYXR0ZXJuIDMnXG4gICAgfSxcbiAgICAnQW5ubyc6IHtcbiAgICAgICAgbmFtZTogJ0Fubm90YXRpb25zJ1xuICAgIH0sXG4gICAgJ2NsYmwnOiB7XG4gICAgICAgIG5hbWU6ICdCbGVuZCBjbGlwcGluZyBlbGVtZW50cycsXG4gICAgICAgIG1vZHVsZTogcmVxdWlyZSgnLi9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvY2xibC5qcycpXG4gICAgfSxcbiAgICAnaW5meCc6IHtcbiAgICAgICAgbmFtZTogJ0JsZW5kIGludGVyaW9yIGVsZW1lbnRzJyxcbiAgICAgICAgbW9kdWxlOiByZXF1aXJlKCcuL2FkZGl0aW9uYWxMYXllckluZm9UeXBlcy9pbmZ4LmpzJylcbiAgICB9LFxuICAgICdrbmtvJzoge1xuICAgICAgICBuYW1lOiAnS25vY2tvdXQgc2V0dGluZycsXG4gICAgICAgIG1vZHVsZTogcmVxdWlyZSgnLi9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMva25rby5qcycpXG4gICAgfSxcbiAgICAnbHNwZic6IHtcbiAgICAgICAgbmFtZTogJ1Byb3RlY3RlZCBzZXR0aW5nJyxcbiAgICAgICAgbW9kdWxlOiByZXF1aXJlKCcuL2FkZGl0aW9uYWxMYXllckluZm9UeXBlcy9sc3BmLmpzJylcbiAgICB9LFxuICAgICdsY2xyJzoge1xuICAgICAgICBuYW1lOiAnU2hlZXQgY29sb3Igc2V0dGluZycsXG4gICAgICAgIG1vZHVsZTogcmVxdWlyZSgnLi9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvbGNsci5qcycpXG4gICAgfSxcbiAgICAnZnhycCc6IHtcbiAgICAgICAgbmFtZTogJ1JlZmVyZW5jZSBwb2ludCcsXG4gICAgICAgIG1vZHVsZTogcmVxdWlyZSgnLi9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvZnhycC5qcycpXG4gICAgfSxcbiAgICAnZ3JkbSc6IHtcbiAgICAgICAgbmFtZTogJ0dyYWRpZW50IHNldHRpbmdzJ1xuICAgIH0sXG4gICAgJ2xzY3QnOiB7XG4gICAgICAgIG5hbWU6ICdTZWN0aW9uIGRpdmlkZXIgc2V0dGluZycsXG4gICAgICAgIG1vZHVsZTogcmVxdWlyZSgnLi9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvbHNjdC5qcycpXG4gICAgfSxcbiAgICAnYnJzdCc6IHtcbiAgICAgICAgbmFtZTogJ0NoYW5uZWwgYmxlbmRpbmcgcmVzdHJpY3Rpb25zIHNldHRpbmcnXG4gICAgfSxcbiAgICAnU29Dbyc6IHtcbiAgICAgICAgbmFtZTogJ1NvbGlkIGNvbG9yIHNoZWV0IHNldHRpbmcnXG4gICAgfSxcbiAgICAnUHRGbCc6IHtcbiAgICAgICAgbmFtZTogJ1BhdHRlcm4gZmlsbCBzZXR0aW5nJ1xuICAgIH0sXG4gICAgJ0dkRmwnOiB7XG4gICAgICAgIG5hbWU6ICdHcmFkaWVudCBmaWxsIHNldHRpbmcnXG4gICAgfSxcbiAgICAndm1zayc6IHtcbiAgICAgICAgbmFtZTogJ1ZlY3RvciBtYXNrIHNldHRpbmcnXG4gICAgfSxcbiAgICAndnNtcyc6IHtcbiAgICAgICAgbmFtZTogJ1ZlY3RvciBtYXNrIHNldHRpbmcnXG4gICAgfSxcbiAgICAnVHlTaCc6IHtcbiAgICAgICAgbmFtZTogJ1R5cGUgdG9vbCBvYmplY3Qgc2V0dGluZydcbiAgICB9LFxuICAgICdmZnhpJzoge1xuICAgICAgICBuYW1lOiAnRm9yZWlnbiBlZmZlY3QgSUQnLFxuICAgICAgICBtb2R1bGU6IHJlcXVpcmUoJy4vYWRkaXRpb25hbExheWVySW5mb1R5cGVzL2ZmeGkuanMnKVxuICAgIH0sXG4gICAgJ2xuc3InOiB7XG4gICAgICAgIG5hbWU6ICdMYXllciBuYW1lIHNvdXJjZSBzZXR0aW5nJyxcbiAgICAgICAgbW9kdWxlOiByZXF1aXJlKCcuL2FkZGl0aW9uYWxMYXllckluZm9UeXBlcy9sbnNyLmpzJylcbiAgICB9LFxuICAgICdzaHBhJzoge1xuICAgICAgICBuYW1lOiAnUGF0dGVybiBkYXRhJ1xuICAgIH0sXG4gICAgJ3NobWQnOiB7XG4gICAgICAgIG5hbWU6ICdNZXRhZGF0YSBzZXR0aW5nJ1xuICAgIH0sXG4gICAgJ2x5dnInOiB7XG4gICAgICAgIG5hbWU6ICdMYXllciB2ZXJzaW9uJyxcbiAgICAgICAgbW9kdWxlOiByZXF1aXJlKCcuL2FkZGl0aW9uYWxMYXllckluZm9UeXBlcy9seXZyLmpzJylcbiAgICB9LFxuICAgICd0c2x5Jzoge1xuICAgICAgICBuYW1lOiAnVHJhbnNwYXJlbmN5IHNoYXBlcyBsYXllcicsXG4gICAgICAgIG1vZHVsZTogcmVxdWlyZSgnLi9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvdHNseS5qcycpXG4gICAgfSxcbiAgICAnbG1nbSc6IHtcbiAgICAgICAgbmFtZTogJ0xheWVyIG1hc2sgYXMgZ2xvYmFsIG1hc2snLFxuICAgICAgICBtb2R1bGU6IHJlcXVpcmUoJy4vYWRkaXRpb25hbExheWVySW5mb1R5cGVzL2xtZ20uanMnKVxuICAgIH0sXG4gICAgJ3ZtZ20nOiB7XG4gICAgICAgIG5hbWU6ICdWZWN0b3IgbWFzayBhcyBnbG9iYWwgbWFzaycsXG4gICAgICAgIG1vZHVsZTogcmVxdWlyZSgnLi9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvdm1nbS5qcycpXG4gICAgfSxcbiAgICAnYnJpdCc6IHtcbiAgICAgICAgbmFtZTogJ0JyaWdodG5lc3MvQ29udHJhc3QnLFxuICAgICAgICBtb2R1bGU6IHJlcXVpcmUoJy4vYWRkaXRpb25hbExheWVySW5mb1R5cGVzL2JyaXQuanMnKVxuICAgIH0sXG4gICAgJ21peHInOiB7XG4gICAgICAgIG5hbWU6ICdDaGFubmVsIE1peGVyJ1xuICAgIH0sXG4gICAgJ2NsckwnOiB7XG4gICAgICAgIG5hbWU6ICdDb2xvciBMb29rdXAnXG4gICAgfSxcbiAgICAncGxMZCc6IHtcbiAgICAgICAgbmFtZTogJ1BsYWNlZCBMYXllcidcbiAgICB9LFxuICAgICdsbmtEJzoge1xuICAgICAgICBuYW1lOiAnTGlua2VkIExheWVyJ1xuICAgIH0sXG4gICAgJ2xuazInOiB7XG4gICAgICAgIG5hbWU6ICdMaW5rZWQgTGF5ZXInXG4gICAgfSxcbiAgICAnbG5rMyc6IHtcbiAgICAgICAgbmFtZTogJ0xpbmtlZCBMYXllcidcbiAgICB9LFxuICAgICdwaGZsJzoge1xuICAgICAgICBuYW1lOiAnUGhvdG8gRmlsdGVyJyxcbiAgICB9LFxuICAgICdibHdoJzoge1xuICAgICAgICBuYW1lOiAnQmxhY2sgV2hpdGUnXG4gICAgfSxcbiAgICAnQ2dFZCc6IHtcbiAgICAgICAgbmFtZTogJ0NvbnRlbnQgR2VuZXJhdG9yIEV4dHJhIERhdGEnXG4gICAgfSxcbiAgICAnVHh0Mic6IHtcbiAgICAgICAgbmFtZTogJ1RleHQgRW5naW5lIERhdGEnLFxuICAgICAgICBtb2R1bGU6IHJlcXVpcmUoJy4vYWRkaXRpb25hbExheWVySW5mb1R5cGVzL3R4dDIuanMnKVxuICAgIH0sXG4gICAgJ3ZpYkEnOiB7XG4gICAgICAgIG5hbWU6ICdWaWJyYW5jZSdcbiAgICB9LFxuICAgICdwdGhzJzoge1xuICAgICAgICBuYW1lOiAnVW5pY29kZSBQYXRoIE5hbWUnXG4gICAgfSxcbiAgICAnYW5GWCc6IHtcbiAgICAgICAgbmFtZTogJ0FuaW1hdGlvbiBFZmZlY3RzJ1xuICAgIH0sXG4gICAgJ0ZNc2snOiB7XG4gICAgICAgIG5hbWU6ICdGaWx0ZXIgTWFzaydcbiAgICB9LFxuICAgICdTb0xkJzoge1xuICAgICAgICBuYW1lOiAnUGxhY2VkIExheWVyIERhdGEnXG4gICAgfSxcbiAgICAndnN0ayc6IHtcbiAgICAgICAgbmFtZTogJ1ZlY3RvciBTdHJva2UgRGF0YSdcbiAgICB9LFxuICAgICd2c2NnJzoge1xuICAgICAgICBuYW1lOiAnRlZlY3RvciBTdHJva2UgQ29udGVudCBEYXRhJ1xuICAgIH0sXG4gICAgJ3NuMlAnOiB7XG4gICAgICAgIG5hbWU6ICdVc2luZyBBbGlnbmVkIFJlbmRlcmluZycsXG4gICAgICAgIG1vZHVsZTogcmVxdWlyZSgnLi9hZGRpdGlvbmFsTGF5ZXJJbmZvVHlwZXMvc24ycC5qcycpXG4gICAgfSxcbiAgICAndm9nayc6IHtcbiAgICAgICAgbmFtZTogJ1ZlY3RvciBPcmlnaW5hdGlvbiBEYXRhJ1xuICAgIH0sXG4gICAgJ010cm4nOiB7XG4gICAgICAgIG5hbWU6ICdTYXZpbmcgTWVyZ2VkIFRyYW5zcGFyZW5jeSdcbiAgICB9LFxuICAgICdNdDE2Jzoge1xuICAgICAgICBuYW1lOiAnU2F2aW5nIE1lcmdlZCBUcmFuc3BhcmVuY3knXG4gICAgfSxcbiAgICAnTXQzMic6IHtcbiAgICAgICAgbmFtZTogJ1NhdmluZyBNZXJnZWQgVHJhbnNwYXJlbmN5J1xuICAgIH0sXG4gICAgJ0xNc2snOiB7XG4gICAgICAgIG5hbWU6ICdVc2VyIE1hc2snXG4gICAgfSxcbiAgICAnZXhwQSc6IHtcbiAgICAgICAgbmFtZTogJ0V4cG9zdXJlJyxcbiAgICAgICAgbW9kdWxlOiByZXF1aXJlKCcuL2FkZGl0aW9uYWxMYXllckluZm9UeXBlcy9leHBhLmpzJylcbiAgICB9LFxuICAgICdGWGlkJzoge1xuICAgICAgICBuYW1lOiAnRmlsdGVyIE1hc2snXG4gICAgfSxcbiAgICAnRkVpZCc6IHtcbiAgICAgICAgbmFtZTogJ0ZpbHRlciBFZmZlY3RzJ1xuICAgIH0sXG4gICAgJ1NvQ28nOiB7XG4gICAgICAgIG5hbWU6ICdTb2xpZCBDb2xvcidcbiAgICB9LFxuICAgICdQdEZsJzoge1xuICAgICAgICBuYW1lOiAnUGF0dGVyblwiJ1xuICAgIH0sXG4gICAgJ2xldmwnOiB7XG4gICAgICAgIG5hbWU6ICdMZXZlbHMnLFxuICAgICAgICBtb2R1bGU6IHJlcXVpcmUoJy4vYWRkaXRpb25hbExheWVySW5mb1R5cGVzL2xldmwuanMnKVxuICAgIH0sXG4gICAgJ2N1cnYnOiB7XG4gICAgICAgIG5hbWU6ICdDdXJ2ZXMnLFxuICAgIH0sXG4gICAgJ2h1ZSAnOiB7XG4gICAgICAgIG5hbWU6ICdPbGQgSHVlL3NhdHVyYXRpb24nLFxuICAgIH0sXG4gICAgJ2h1ZTInOiB7XG4gICAgICAgIG5hbWU6ICdIdWUvc2F0dXJhdGlvbicsXG4gICAgfSxcbiAgICAnYmxuYyc6IHtcbiAgICAgICAgbmFtZTogJ0NvbG9yIEJhbGFuY2UnLFxuICAgIH0sXG4gICAgJ252cnQnOiB7XG4gICAgICAgIG5hbWU6ICdJbnZlcnQnLFxuICAgIH0sXG4gICAgJ3Bvc3QnOiB7XG4gICAgICAgIG5hbWU6ICdQb3N0ZXJpemUnLFxuICAgIH0sXG4gICAgJ3RocnMnOiB7XG4gICAgICAgIG5hbWU6ICdUaHJlc2hvbGQnLFxuICAgIH0sXG4gICAgJ3NlbGMnOiB7XG4gICAgICAgIG5hbWU6ICdTZWxlY3RpdmUgY29sb3InXG4gICAgfVxufTtcbiIsInZhciBGaWxlSGVscGVyID0gcmVxdWlyZSgnLi4vRmlsZUhlbHBlci5qcycpO1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24oZmlsZUhlbHBlcikge1xuICAgIHZhciBkYXRhID0ge307XG5cbiAgICBkYXRhLmJyaWdodG5lc3MgPSBmaWxlSGVscGVyLnJlYWRVaW50MTYoKTtcbiAgICBkYXRhLmNvbnRyYXN0ID0gZmlsZUhlbHBlci5yZWFkVWludDE2KCk7XG4gICAgZGF0YS5tZWFuID0gZmlsZUhlbHBlci5yZWFkVWludDE2KCk7XG4gICAgZGF0YS5sYWJPbmx5ID0gQm9vbGVhbihmaWxlSGVscGVyLnJlYWRVaW50OCgpKTtcblxuICAgIHJldHVybiBkYXRhO1xufTtcblxuZXhwb3J0cy5jb21wb3NlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBzZWN0aW9uRGF0YSA9IG5ldyBGaWxlSGVscGVyKCk7XG5cbiAgICBzZWN0aW9uRGF0YS5jcmVhdGUoNyk7XG4gICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYoZGF0YS5icmlnaHRuZXNzKTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQxNihkYXRhLmNvbnRyYXN0KTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQxNihkYXRhLm1lYW4pO1xuICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDgoZGF0YS5sYWJPbmx5ID8gMSA6IDApO1xuXG4gICAgcmV0dXJuIHNlY3Rpb25EYXRhLmFycmF5QnVmZmVyO1xufTtcbiIsInZhciBGaWxlSGVscGVyID0gcmVxdWlyZSgnLi4vRmlsZUhlbHBlci5qcycpO1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24oZmlsZUhlbHBlcikge1xuICAgIHZhciBkYXRhID0gQm9vbGVhbihmaWxlSGVscGVyLnJlYWRVaW50OCgpKTtcblxuICAgIGZpbGVIZWxwZXIuc2tpcCgzKTtcblxuICAgIHJldHVybiBkYXRhO1xufTtcblxuZXhwb3J0cy5jb21wb3NlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBzZWN0aW9uRGF0YSA9IG5ldyBGaWxlSGVscGVyKCk7XG5cbiAgICBzZWN0aW9uRGF0YS5jcmVhdGUoNCk7XG4gICAgc2VjdGlvbkRhdGEud3JpdGVVaW50OChkYXRhID8gMSA6IDApO1xuXG4gICAgcmV0dXJuIHNlY3Rpb25EYXRhLmFycmF5QnVmZmVyO1xufTtcbiIsInZhciBGaWxlSGVscGVyID0gcmVxdWlyZSgnLi4vRmlsZUhlbHBlci5qcycpO1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24oZmlsZUhlbHBlcikge1xuICAgIHZhciBkYXRhID0ge307XG5cbiAgICBkYXRhLnZlcnNpb24gPSBmaWxlSGVscGVyLnJlYWRVaW50MTYoKTtcbiAgICBkYXRhLmV4cG9zdXJlID0gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG4gICAgZGF0YS5vZmZzZXQgPSBmaWxlSGVscGVyLnJlYWRVaW50MzIoKTtcbiAgICBkYXRhLmdhbW1hID0gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG5cbiAgICByZXR1cm4gZGF0YTtcbn07XG5cbmV4cG9ydHMuY29tcG9zZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgc2VjdGlvbkRhdGEgPSBuZXcgRmlsZUhlbHBlcigpO1xuXG4gICAgc2VjdGlvbkRhdGEuY3JlYXRlKDE0KTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQxNihkYXRhLnZlcnNpb24pO1xuICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKGRhdGEuZXhwb3N1cmUpO1xuICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKGRhdGEub2Zmc2V0KTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQzMihkYXRhLmdhbW1hKTtcblxuICAgIHJldHVybiBzZWN0aW9uRGF0YS5hcnJheUJ1ZmZlcjtcbn07XG4iLCJ2YXIgRmlsZUhlbHBlciA9IHJlcXVpcmUoJy4uL0ZpbGVIZWxwZXIuanMnKTtcblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uKGZpbGVIZWxwZXIpIHtcbiAgICByZXR1cm4gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7IC8vIElEIG9mIHRoZSBGb3JlaWduIGVmZmVjdFxufTtcblxuZXhwb3J0cy5jb21wb3NlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBzZWN0aW9uRGF0YSA9IG5ldyBGaWxlSGVscGVyKCk7XG5cbiAgICBzZWN0aW9uRGF0YS5jcmVhdGUoNCk7XG4gICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MzIoZGF0YSk7XG5cbiAgICByZXR1cm4gc2VjdGlvbkRhdGEuYXJyYXlCdWZmZXI7XG59O1xuIiwidmFyIEZpbGVIZWxwZXIgPSByZXF1aXJlKCcuLi9GaWxlSGVscGVyLmpzJyk7XG5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbihmaWxlSGVscGVyKSB7XG4gICAgdmFyIGRhdGEgPSB7fTtcblxuICAgIGRhdGEueCA9IGZpbGVIZWxwZXIucmVhZEZsb2F0NjQoKTtcbiAgICBkYXRhLnkgPSBmaWxlSGVscGVyLnJlYWRGbG9hdDY0KCk7XG5cbiAgICByZXR1cm4gZGF0YTtcbn07XG5cbmV4cG9ydHMuY29tcG9zZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgc2VjdGlvbkRhdGEgPSBuZXcgRmlsZUhlbHBlcigpO1xuXG4gICAgc2VjdGlvbkRhdGEuY3JlYXRlKDE2KTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZUZsb2F0NjQoZGF0YS54KTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZUZsb2F0NjQoZGF0YS55KTtcblxuICAgIHJldHVybiBzZWN0aW9uRGF0YS5hcnJheUJ1ZmZlcjtcbn07XG4iLCJ2YXIgRmlsZUhlbHBlciA9IHJlcXVpcmUoJy4uL0ZpbGVIZWxwZXIuanMnKTtcblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uKGZpbGVIZWxwZXIpIHtcbiAgICAvLyBUT0RPOiB0aGlzIGlzIHByb2JhYmx5IHdyb25nIGJ1dCBpIGRvbid0IGhhdmUgZmlsZXMgd2l0aCBkYXRhIGhlcmVcbiAgICB2YXIgZGF0YSA9IGZpbGVIZWxwZXIucmVhZFVpbnQzMigpO1xuXG4gICAgZmlsZUhlbHBlci5za2lwKDQpO1xuXG4gICAgcmV0dXJuIGRhdGE7XG59O1xuXG5leHBvcnRzLmNvbXBvc2UgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHNlY3Rpb25EYXRhID0gbmV3IEZpbGVIZWxwZXIoKTtcblxuICAgIHNlY3Rpb25EYXRhLmNyZWF0ZSg4KTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQzMihkYXRhKTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQzMigwKTtcblxuICAgIHJldHVybiBzZWN0aW9uRGF0YS5hcnJheUJ1ZmZlcjtcbn07XG4iLCJ2YXIgRmlsZUhlbHBlciA9IHJlcXVpcmUoJy4uL0ZpbGVIZWxwZXIuanMnKTtcblxuZnVuY3Rpb24gcGFyc2VMZXZlbFJlY29yZChmaWxlSGVscGVyKSB7XG4gICAgdmFyIHJlY29yZCA9IHt9O1xuXG4gICAgcmVjb3JkLmlucHV0Rmxvb3IgPSBmaWxlSGVscGVyLnJlYWRVaW50MTYoKTtcbiAgICByZWNvcmQuaW5wdXRDZWlsaW5nID0gZmlsZUhlbHBlci5yZWFkVWludDE2KCk7XG4gICAgcmVjb3JkLm91dHB1dEZsb29yID0gZmlsZUhlbHBlci5yZWFkVWludDE2KCk7XG4gICAgcmVjb3JkLm91dHB1dENlaWxpbmcgPSBmaWxlSGVscGVyLnJlYWRVaW50MTYoKTtcbiAgICByZWNvcmQuZ2FtbWEgPSBmaWxlSGVscGVyLnJlYWRVaW50MTYoKTtcblxuICAgIHJldHVybiByZWNvcmQ7XG59XG5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbihmaWxlSGVscGVyKSB7XG4gICAgdmFyIGRhdGEgPSB7fTtcblxuICAgIGRhdGEudmVyc2lvbiA9IGZpbGVIZWxwZXIucmVhZFVpbnQxNigpO1xuICAgIGRhdGEucmVjb3JkcyA9IFtdO1xuICAgIGZvcih2YXIgaT0wOyBpPDI5OyBpKyspIHtcbiAgICAgICAgZGF0YS5yZWNvcmRzLnB1c2gocGFyc2VMZXZlbFJlY29yZChmaWxlSGVscGVyKSk7XG4gICAgfVxuICAgIHZhciBleHRyYUxldmVsc01hcmtlciA9IGZpbGVIZWxwZXIucmVhZFN0cmluZyg0KTtcbiAgICBpZihleHRyYUxldmVsc01hcmtlciA9PT0gJ0x2bHMnKSB7XG4gICAgICAgIGRhdGEudmVyc2lvbiA9IGZpbGVIZWxwZXIucmVhZFVpbnQxNigpO1xuICAgICAgICB2YXIgZXh0cmFMZXZlbHNDb3VudCA9IGZpbGVIZWxwZXIucmVhZFVpbnQxNigpIC0gMjk7XG4gICAgICAgIGZvcih2YXIgaT0wOyBpPGV4dHJhTGV2ZWxzQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgZGF0YS5yZWNvcmRzLnB1c2gocGFyc2VMZXZlbFJlY29yZChmaWxlSGVscGVyKSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmaWxlSGVscGVyLnJldmVydCg0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbn07XG5cbmV4cG9ydHMuY29tcG9zZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgc2VjdGlvbkRhdGEgPSBuZXcgRmlsZUhlbHBlcigpO1xuXG4gICAgc2VjdGlvbkRhdGEuY3JlYXRlKDI5Mik7XG4gICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYoMik7IC8vIFZlcnNpb25cbiAgICBmb3IodmFyIGk9MDsgaTwyOTsgaSsrKSB7XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDE2KGRhdGEucmVjb3Jkc1tpXS5pbnB1dEZsb29yKTtcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYoZGF0YS5yZWNvcmRzW2ldLmlucHV0Q2VpbGluZyk7XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDE2KGRhdGEucmVjb3Jkc1tpXS5vdXRwdXRGbG9vcik7XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDE2KGRhdGEucmVjb3Jkc1tpXS5vdXRwdXRDZWlsaW5nKTtcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYoZGF0YS5yZWNvcmRzW2ldLmdhbW1hKTtcbiAgICB9XG4gICAgaWYoZGF0YS52ZXJzaW9uID09PSAzKSB7XG4gICAgICAgIHZhciBhZGRpdGlvbmFsUmVjb3JkQ291bnQgPSBkYXRhLnJlY29yZHMubGVuZ3RoIC0gMjk7XG4gICAgICAgIHNlY3Rpb25EYXRhLmV4dGVuZCg0ICsgMiArIDIgKyAxMCphZGRpdGlvbmFsUmVjb3JkQ291bnQpO1xuICAgICAgICBzZWN0aW9uRGF0YS53cml0ZVN0cmluZygnTHZscycpO1xuICAgICAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQxNigzKTsgLy8gVmVyc2lvblxuICAgICAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQxNihkYXRhLnJlY29yZHMubGVuZ3RoKTtcbiAgICAgICAgZm9yKHZhciBpPTI5OyBpPGRhdGEucmVjb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYoZGF0YS5yZWNvcmRzW2ldLmlucHV0Rmxvb3IpO1xuICAgICAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYoZGF0YS5yZWNvcmRzW2ldLmlucHV0Q2VpbGluZyk7XG4gICAgICAgICAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQxNihkYXRhLnJlY29yZHNbaV0ub3V0cHV0Rmxvb3IpO1xuICAgICAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYoZGF0YS5yZWNvcmRzW2ldLm91dHB1dENlaWxpbmcpO1xuICAgICAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYoZGF0YS5yZWNvcmRzW2ldLmdhbW1hKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzZWN0aW9uRGF0YS5hcnJheUJ1ZmZlcjtcbn07XG4iLCJ2YXIgRmlsZUhlbHBlciA9IHJlcXVpcmUoJy4uL0ZpbGVIZWxwZXIuanMnKTtcblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uKGZpbGVIZWxwZXIpIHtcbiAgICAvLyBUT0RPOiBpcyB0aGlzIHJlYWxseSBhIFVpbnQzMj9cbiAgICByZXR1cm4gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7IC8vIElEIGZvciB0aGUgbGF5ZXIgbmFtZVxufTtcblxuZXhwb3J0cy5jb21wb3NlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBzZWN0aW9uRGF0YSA9IG5ldyBGaWxlSGVscGVyKCk7XG5cbiAgICBzZWN0aW9uRGF0YS5jcmVhdGUoNCk7XG4gICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MzIoZGF0YSk7XG5cbiAgICByZXR1cm4gc2VjdGlvbkRhdGEuYXJyYXlCdWZmZXI7XG59O1xuIiwidmFyIGJsZW5kTW9kZXMgPSByZXF1aXJlKCcuLi9ibGVuZE1vZGVzLmpzJyk7XG52YXIgRmlsZUhlbHBlciA9IHJlcXVpcmUoJy4uL0ZpbGVIZWxwZXIuanMnKTtcblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uKGZpbGVIZWxwZXIsIGRhdGFMZW5ndGgpIHtcbiAgICB2YXIgZGF0YSA9IHt9O1xuICAgIHZhciB0eXBlID0gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG5cbiAgICBpZih0eXBlID09PSAwKSB7XG4gICAgICAgIGRhdGEudHlwZSA9ICdvdGhlcic7XG4gICAgfSBlbHNlIGlmKHR5cGUgPT09IDEpIHtcbiAgICAgICAgZGF0YS50eXBlID0gJ29wZW4gZm9sZGVyJztcbiAgICB9IGVsc2UgaWYodHlwZSA9PT0gMikge1xuICAgICAgICBkYXRhLnR5cGUgPSAnY2xvc2VkIGZvbGRlcic7XG4gICAgfSBlbHNlIGlmKHR5cGUgPT09IDMpIHtcbiAgICAgICAgZGF0YS50eXBlID0gJ2RpdmlkZXInO1xuICAgIH1cblxuICAgIGlmKGRhdGFMZW5ndGggPj0gMTIpIHtcbiAgICAgICAgZmlsZUhlbHBlci5za2lwKDQpOyAvLyBTaWduYXR1cmVcbiAgICAgICAgZGF0YS5ibGVuZE1vZGUgPSBibGVuZE1vZGVzW2ZpbGVIZWxwZXIucmVhZFN0cmluZyg0KV07XG4gICAgfVxuXG4gICAgaWYoZGF0YUxlbmd0aCA+PSAxNikge1xuICAgICAgICBpZihmaWxlSGVscGVyLnJlYWRVaW50MzIoKSA9PT0gMCkge1xuICAgICAgICAgICAgZGF0YS5zdWJUeXBlID0gJ25vcm1hbCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhLnN1YlR5cGUgPSAnc2NlbmUgZ3JvdXAnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG59O1xuXG5leHBvcnRzLmNvbXBvc2UgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHNlY3Rpb25EYXRhID0gbmV3IEZpbGVIZWxwZXIoKTtcblxuICAgIHNlY3Rpb25EYXRhLmNyZWF0ZSg0KTtcbiAgICBpZihkYXRhLnR5cGUgPT09ICdvdGhlcicpIHtcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MzIoMCk7XG4gICAgfSBlbHNlIGlmKGRhdGEudHlwZSA9PT0gJ29wZW4gZm9sZGVyJykge1xuICAgICAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQzMigxKTtcbiAgICB9IGVsc2UgaWYoZGF0YS50eXBlID09PSAnY2xvc2VkIGZvbGRlcicpIHtcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MzIoMik7XG4gICAgfSBlbHNlIGlmKGRhdGEudHlwZSA9PT0gJ2RpdmlkZXInKSB7XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKDMpO1xuICAgIH1cblxuICAgIGlmKGRhdGEuYmxlbmRNb2RlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIGJsZW5kTW9kZUtleSA9IE9iamVjdC5rZXlzKGJsZW5kTW9kZXMpLmZpbHRlcihmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBibGVuZE1vZGVzW2tleV0gPT09IGRhdGEuYmxlbmRNb2RlO1xuICAgICAgICB9KVswXTtcbiAgICAgICAgc2VjdGlvbkRhdGEuZXh0ZW5kKDgpO1xuICAgICAgICBzZWN0aW9uRGF0YS53cml0ZVN0cmluZygnOEJJTScpO1xuICAgICAgICBzZWN0aW9uRGF0YS53cml0ZVN0cmluZyhibGVuZE1vZGVLZXkpO1xuICAgIH1cblxuICAgIGlmKGRhdGEuc3ViVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNlY3Rpb25EYXRhLmV4dGVuZCg0KTtcbiAgICAgICAgaWYoZGF0YS5zdWJUeXBlID09PSAnc2NlbmUgZ3JvdXAnKSB7XG4gICAgICAgICAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQzMigxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlY3Rpb25EYXRhLmFycmF5QnVmZmVyO1xufTtcbiIsInZhciBGaWxlSGVscGVyID0gcmVxdWlyZSgnLi4vRmlsZUhlbHBlci5qcycpO1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24oZmlsZUhlbHBlcikge1xuICAgIHZhciBmbGFncyA9IGZpbGVIZWxwZXIucmVhZDhCaXRzKCk7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICd0cmFuc3BhcmFuY3knOiBmYWxzZSxcbiAgICAgICAgJ2NvbXBvc2l0ZSc6IGZhbHNlLFxuICAgICAgICAncG9zaXRpb24nOiBmYWxzZVxuICAgIH07XG5cbiAgICBmaWxlSGVscGVyLnNraXAoMyk7XG4gICAgaWYgKGZsYWdzWzBdID09PSAxKSB7XG4gICAgICAgIGRhdGFbJ3RyYW5zcGFyZW5jeSddID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGZsYWdzWzFdID09PSAxKSB7XG4gICAgICAgIGRhdGFbJ2NvbXBvc2l0ZSddID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGZsYWdzWzJdID09PSAxKSB7XG4gICAgICAgIGRhdGFbJ3Bvc2l0aW9uJ10gPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xufTtcblxuZXhwb3J0cy5jb21wb3NlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBzZWN0aW9uRGF0YSA9IG5ldyBGaWxlSGVscGVyKCk7XG4gICAgdmFyIGZsYWdzID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdO1xuXG4gICAgc2VjdGlvbkRhdGEuY3JlYXRlKDQpO1xuICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDgoMCk7XG4gICAgc2VjdGlvbkRhdGEud3JpdGVVaW50OCgwKTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQ4KDApO1xuICAgIGlmIChkYXRhWyd0cmFuc3BhcmVuY3knXSkge1xuICAgICAgICBmbGFnc1swXSA9IDE7XG4gICAgfVxuICAgIGlmIChkYXRhWydjb21wb3NpdGUnXSkge1xuICAgICAgICBmbGFnc1sxXSA9IDE7XG4gICAgfVxuICAgIGlmIChkYXRhWydwb3NpdGlvbiddKSB7XG4gICAgICAgIGZsYWdzWzJdID0gMTtcbiAgICB9XG4gICAgc2VjdGlvbkRhdGEud3JpdGU4Qml0cyhmbGFncyk7XG5cbiAgICByZXR1cm4gc2VjdGlvbkRhdGEuYXJyYXlCdWZmZXI7XG59O1xuIiwidmFyIEZpbGVIZWxwZXIgPSByZXF1aXJlKCcuLi9GaWxlSGVscGVyLmpzJyk7XG5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbihmaWxlSGVscGVyKSB7XG4gICAgcmV0dXJuIGZpbGVIZWxwZXIucmVhZFVuaWNvZGVTdHJpbmcoKTtcbn07XG5cbmV4cG9ydHMuY29tcG9zZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgc2VjdGlvbkRhdGEgPSBuZXcgRmlsZUhlbHBlcigpO1xuXG4gICAgLy8gVE9ETzogZmluZCBvdXQgd2h5IHRoaXMgaGFzIHRvIGJlIHR3byBieXRlcyBsb25nZXIgdGhhbiBleHBlY3RlZFxuICAgIHNlY3Rpb25EYXRhLmNyZWF0ZShkYXRhLmxlbmd0aCoyICsgNik7IC8vIDIgQnl0ZSBwZXIgY2hhciArIDQgQnl0ZSBmb3IgdGhlIGxlbmd0aCBmaWVsZFxuICAgIHNlY3Rpb25EYXRhLndyaXRlVW5pY29kZVN0cmluZyhkYXRhKTtcblxuICAgIHJldHVybiBzZWN0aW9uRGF0YS5hcnJheUJ1ZmZlcjtcbn07XG4iLCJ2YXIgRmlsZUhlbHBlciA9IHJlcXVpcmUoJy4uL0ZpbGVIZWxwZXIuanMnKTtcblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uKGZpbGVIZWxwZXIpIHtcbiAgICByZXR1cm4gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG59O1xuXG5leHBvcnRzLmNvbXBvc2UgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHNlY3Rpb25EYXRhID0gbmV3IEZpbGVIZWxwZXIoKTtcblxuICAgIHNlY3Rpb25EYXRhLmNyZWF0ZSg0KTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQzMihkYXRhKTtcblxuICAgIHJldHVybiBzZWN0aW9uRGF0YS5hcnJheUJ1ZmZlcjtcbn07XG4iLCJ2YXIgRmlsZUhlbHBlciA9IHJlcXVpcmUoJy4uL0ZpbGVIZWxwZXIuanMnKTtcblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uKGZpbGVIZWxwZXIpIHtcbiAgICByZXR1cm4gQm9vbGVhbihmaWxlSGVscGVyLnJlYWRVaW50MzIoKSk7XG59O1xuXG5leHBvcnRzLmNvbXBvc2UgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHNlY3Rpb25EYXRhID0gbmV3IEZpbGVIZWxwZXIoKTtcblxuICAgIHNlY3Rpb25EYXRhLmNyZWF0ZSg0KTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQzMihkYXRhID8gMSA6IDApO1xuXG4gICAgcmV0dXJuIHNlY3Rpb25EYXRhLmFycmF5QnVmZmVyO1xufTtcbiIsInZhciBGaWxlSGVscGVyID0gcmVxdWlyZSgnLi4vRmlsZUhlbHBlci5qcycpO1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24oZmlsZUhlbHBlcikge1xuICAgIHZhciBsZW5ndGggPSBmaWxlSGVscGVyLnJlYWRVaW50MzIoKTtcbiAgICByZXR1cm4gZmlsZUhlbHBlci5yZWFkVWludDhBcnJheShsZW5ndGgpO1xufTtcblxuZXhwb3J0cy5jb21wb3NlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBzZWN0aW9uRGF0YSA9IG5ldyBGaWxlSGVscGVyKCk7XG5cbiAgICBzZWN0aW9uRGF0YS5jcmVhdGUoZGF0YS5sZW5ndGggKyA0KTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQzMihkYXRhLmxlbmd0aCk7XG4gICAgc2VjdGlvbkRhdGEud3JpdGVVaW50OEFycmF5KGRhdGEpO1xuXG4gICAgcmV0dXJuIHNlY3Rpb25EYXRhLmFycmF5QnVmZmVyO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgICdwYXNzJzogJ3Bhc3MgdGhyb3VnaCcsXG4gICAgJ25vcm0nOiAnbm9ybWFsJyxcbiAgICAnZGlzcyc6ICdkaXNzb2x2ZScsXG4gICAgJ2RhcmsnOiAnZGFya2VuJyxcbiAgICAnbXVsICc6ICdtdWx0aXBseScsXG4gICAgJ2lkaXYnOiAnY29sb3IgYnVybicsXG4gICAgJ2xicm4nOiAnbGluZWFyIGJ1cm4nLFxuICAgICdka0NsJzogJ2RhcmtlciBjb2xvcicsXG4gICAgJ2xpdGUnOiAnbGlnaHRlbicsXG4gICAgJ3Njcm4nOiAnc2NyZWVuJyxcbiAgICAnZGl2ICc6ICdjb2xvciBkb2RnZScsXG4gICAgJ2xkZGcnOiAnbGluZWFyIGRvZGdlJyxcbiAgICAnbGdDbCc6ICdsaWdodGVyIGNvbG9yJyxcbiAgICAnb3Zlcic6ICdvdmVybGF5JyxcbiAgICAnc0xpdCc6ICdzb2Z0IGxpZ2h0JyxcbiAgICAnaExpdCc6ICdoYXJkIGxpZ2h0JyxcbiAgICAndkxpdCc6ICd2aXZpZCBsaWdodCcsXG4gICAgJ2xMaXQnOiAnbGluZWFyIGxpZ2h0JyxcbiAgICAncExpdCc6ICdwaW4gbGlnaHQnLFxuICAgICdoTWl4JzogJ2hhcmQgbWl4JyxcbiAgICAnZGlmZic6ICdkaWZmZXJlbmNlJyxcbiAgICAnc211ZCc6ICdleGNsdXNpb24nLFxuICAgICdmc3ViJzogJ3N1YnRyYWN0JyxcbiAgICAnZmRpdic6ICdkaXZpZGUnLFxuICAgICdodWUgJzogJ2h1ZScsXG4gICAgJ3NhdCAnOiAnc2F0dXJhdGlvbicsXG4gICAgJ2NvbHInOiAnY29sb3InLFxuICAgICdsdW0gJzogJ2x1bWlub3NpdHknXG59O1xuIiwidmFyIEZpbGVIZWxwZXIgPSByZXF1aXJlKCcuL0ZpbGVIZWxwZXIuanMnKTtcblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uKGZpbGVIZWxwZXIpIHtcbiAgICB2YXIgYmxlbmRpbmdSYW5nZXMgPSBbXTtcbiAgICB2YXIgc2VjdGlvbkxlbmd0aCA9IGZpbGVIZWxwZXIucmVhZFVpbnQzMigpO1xuXG4gICAgZm9yKHZhciBpPTA7IGk8c2VjdGlvbkxlbmd0aDsgaSs9NCkge1xuICAgICAgICBibGVuZGluZ1Jhbmdlcy5wdXNoKFtcbiAgICAgICAgICAgIGZpbGVIZWxwZXIucmVhZFVpbnQ4KCksXG4gICAgICAgICAgICBmaWxlSGVscGVyLnJlYWRVaW50OCgpLFxuICAgICAgICAgICAgZmlsZUhlbHBlci5yZWFkVWludDgoKSxcbiAgICAgICAgICAgIGZpbGVIZWxwZXIucmVhZFVpbnQ4KCksXG4gICAgICAgIF0pO1xuICAgIH1cblxuICAgIHJldHVybiBibGVuZGluZ1Jhbmdlcztcbn07XG5cbmV4cG9ydHMuY29tcG9zZSA9IGZ1bmN0aW9uKHJlY29yZCkge1xuICAgIHZhciBzZWN0aW9uRGF0YSA9IG5ldyBGaWxlSGVscGVyKCk7XG5cbiAgICBpZihyZWNvcmQuYmxlbmRpbmdSYW5nZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgc2VjdGlvbkRhdGFMZW5ndGggPSByZWNvcmQuYmxlbmRpbmdSYW5nZXMubGVuZ3RoICogNDtcblxuICAgICAgICBzZWN0aW9uRGF0YS5jcmVhdGUoc2VjdGlvbkRhdGFMZW5ndGggKyA0KTtcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MzIoc2VjdGlvbkRhdGFMZW5ndGgpO1xuICAgICAgICBmb3IodmFyIGk9MDsgaTxyZWNvcmQuYmxlbmRpbmdSYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDhBcnJheShyZWNvcmQuYmxlbmRpbmdSYW5nZXNbaV0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJhbmdlcyA9IHJlY29yZC5jaGFubmVscy5sZW5ndGggKiAyICsgMjsgLy8gc291cmNlIGFuZCBkZXN0aW5hdGlvbiByYW5nZSBwZXIgY2hhbm5lbCArIHR3byBtb3JlXG5cbiAgICAgICAgc2VjdGlvbkRhdGEuY3JlYXRlKHJhbmdlcyo0ICsgNCk7XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKHJhbmdlcyo0KTtcbiAgICAgICAgZm9yKHZhciBpPTA7IGk8cmFuZ2VzOyBpKyspIHtcbiAgICAgICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDhBcnJheShbMCwgMCwgMjU1LCAyNTVdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzZWN0aW9uRGF0YS5hcnJheUJ1ZmZlcjtcbn07XG4iLCJ2YXIgaW1hZ2VEYXRhID0gcmVxdWlyZSgnLi9pbWFnZURhdGEuanMnKTtcbnZhciBGaWxlSGVscGVyID0gcmVxdWlyZSgnLi9GaWxlSGVscGVyLmpzJyk7XG5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbihmaWxlSGVscGVyLCBsYXllcnMpIHtcbiAgICBmb3IodmFyIGk9MDsgaTxsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJlY29yZCA9IGxheWVyc1tpXTtcbiAgICAgICAgcmVjb3JkLmNoYW5uZWxzID0gW107XG5cbiAgICAgICAgZm9yKHZhciBqPTA7IGo8cmVjb3JkLmNoYW5uZWxJbmZvLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgaWQgPSByZWNvcmQuY2hhbm5lbEluZm9bal0uaWQ7XG4gICAgICAgICAgICB2YXIgd2lkdGggPSAoaWQgPCAtMSkgPyByZWNvcmQubWFza0RhdGEud2lkdGggOiByZWNvcmQud2lkdGg7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gKGlkIDwgLTEpID8gcmVjb3JkLm1hc2tEYXRhLmhlaWdodCA6IHJlY29yZC5oZWlnaHQ7XG4gICAgICAgICAgICByZWNvcmQuY2hhbm5lbHMucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgIGRhdGE6IGltYWdlRGF0YS5wYXJzZShmaWxlSGVscGVyLCB3aWR0aCwgaGVpZ2h0LCAxKVswXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWxldGUgcmVjb3JkLmNoYW5uZWxJbmZvOyAvLyBOb3QgbmVlZGVkIGFueW1vcmVcbiAgICB9XG59O1xuXG5leHBvcnRzLmNvbXBvc2UgPSBmdW5jdGlvbihmaWxlSGVscGVyLCBwc2QpIHtcbiAgICB2YXIgcHNkID0gcHNkIHx8IHt9O1xuICAgIHZhciBzZWN0aW9uRGF0YSA9IG5ldyBGaWxlSGVscGVyKCk7XG4gICAgc2VjdGlvbkRhdGEuY3JlYXRlKDApO1xuXG4gICAgaWYocHNkLmxheWVycyAhPT0gdW5kZWZpbmVkICYmIHBzZC5sYXllcnNbMF0gIT09IHVuZGVmaW5lZCkgeyAvLyBJZiB0aGVyZSBhcmUgbm8gbGF5ZXJzIGNvbnRpbnVlXG4gICAgICAgIGZvcih2YXIgaT0wOyBpPHBzZC5sYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByZWNvcmQgPSBwc2QubGF5ZXJzW2ldO1xuICAgICAgICAgICAgZm9yKHZhciBqPTA7IGo8cmVjb3JkLmNoYW5uZWxzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgc2VjdGlvbkRhdGEuZXh0ZW5kKHJlY29yZC5jaGFubmVsc1tqXS5kYXRhLmJ5dGVMZW5ndGggKyAyKTtcbiAgICAgICAgICAgICAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQxNigwKTsgLy8gVE9ETzogbWF5YmUgdXNlIGNvbXByZXNzaW9uIGluIHRoZSBmdXR1cmVcbiAgICAgICAgICAgICAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQ4QXJyYXkocmVjb3JkLmNoYW5uZWxzW2pdLmRhdGEpOyAvLyBzZWN0aW9uIGRhdGFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzZWN0aW9uRGF0YS5hcnJheUJ1ZmZlcjtcbn07XG4iLCJleHBvcnRzLnBhcnNlID0gZnVuY3Rpb24oZmlsZUhlbHBlcikge1xuICAgIHZhciBzZWN0aW9uTGVuZ3RoID0gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG4gICAgdmFyIGNvbG9yTW9kZURhdGEgPSBbXTtcblxuICAgIGlmKHNlY3Rpb25MZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ05laXRoZXIgSW5kZXhlZCBub3IgRHVvdG9uZSBjb2xvcm1vZGUgc3VwcG9ydGVkIHlldCEnKTtcbiAgICAgICAgY29sb3JNb2RlRGF0YSA9IGZpbGVIZWxwZXIucmVhZFVpbnQ4QXJyYXkoc2VjdGlvbkxlbmd0aCk7XG4gICAgICAgIC8vIFRPRE86IEFkZCBzdXBwb3J0IGZvciBpbmRleGVkIGNvbG9yIC8gZHVvdG9uZSBhbmQgdGhlbiBpbXBsZW1lbnQgdGhpc1xuICAgIH1cblxuICAgIHJldHVybiBjb2xvck1vZGVEYXRhO1xufTtcblxuZXhwb3J0cy5jb21wb3NlID0gZnVuY3Rpb24oZmlsZUhlbHBlciwgcHNkKSB7XG4gICAgdmFyIHBzZCA9IHBzZCB8fCB7fTtcblxuICAgIGlmKHBzZC5jb2xvck1vZGVEYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignTmVpdGhlciBJbmRleGVkIG5vciBEdW90b25lIGNvbG9ybW9kZSBzdXBwb3J0ZWQgeWV0IScpO1xuICAgICAgICAvLyBUT0RPOiBBZGQgc3VwcG9ydCBmb3IgaW5kZXhlZCBjb2xvciAvIGR1b3RvbmUgYW5kIHRoZW4gaW1wbGVtZW50IHRoaXNcbiAgICB9XG5cbiAgICBmaWxlSGVscGVyLmV4dGVuZCg0KTtcbiAgICBmaWxlSGVscGVyLndyaXRlVWludDMyKDApO1xufTtcbiIsInZhciBGaWxlSGVscGVyID0gcmVxdWlyZSgnLi9GaWxlSGVscGVyLmpzJyk7XG5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbihmaWxlSGVscGVyKSB7XG4gICAgdmFyIGdsb2JhbExheWVyTWFza0luZm8gPSB7fTtcbiAgICB2YXIgc2VjdGlvbkxlbmd0aCA9IGZpbGVIZWxwZXIucmVhZFVpbnQzMigpO1xuICAgIHZhciBzdGFydFBvc2l0aW9uID0gZmlsZUhlbHBlci5wb2ludGVyO1xuXG4gICAgaWYoc2VjdGlvbkxlbmd0aCAhPT0gMCkge1xuICAgICAgICBnbG9iYWxMYXllck1hc2tJbmZvLm92ZXJsYXlDb2xvclNwYWNlID0gZmlsZUhlbHBlci5yZWFkVWludDE2KCk7XG4gICAgICAgIGdsb2JhbExheWVyTWFza0luZm8uY29sb3JDb21wb25lbnRzID0gW107XG4gICAgICAgIGdsb2JhbExheWVyTWFza0luZm8uY29sb3JDb21wb25lbnRzLnB1c2goZmlsZUhlbHBlci5yZWFkSW50MTYoKSk7XG4gICAgICAgIGdsb2JhbExheWVyTWFza0luZm8uY29sb3JDb21wb25lbnRzLnB1c2goZmlsZUhlbHBlci5yZWFkSW50MTYoKSk7XG4gICAgICAgIGdsb2JhbExheWVyTWFza0luZm8uY29sb3JDb21wb25lbnRzLnB1c2goZmlsZUhlbHBlci5yZWFkSW50MTYoKSk7XG4gICAgICAgIGdsb2JhbExheWVyTWFza0luZm8uY29sb3JDb21wb25lbnRzLnB1c2goZmlsZUhlbHBlci5yZWFkSW50MTYoKSk7XG4gICAgICAgIGdsb2JhbExheWVyTWFza0luZm8ub3BhY2l0eSA9IGZpbGVIZWxwZXIucmVhZFVpbnQxNigpO1xuICAgICAgICBnbG9iYWxMYXllck1hc2tJbmZvLmtpbmQgPSBmaWxlSGVscGVyLnJlYWRVaW50OCgpO1xuICAgICAgICBmaWxlSGVscGVyLnNraXAoc2VjdGlvbkxlbmd0aCAtIChmaWxlSGVscGVyLnBvaW50ZXIgLSBzdGFydFBvc2l0aW9uKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdsb2JhbExheWVyTWFza0luZm87XG59O1xuXG5leHBvcnRzLmNvbXBvc2UgPSBmdW5jdGlvbihmaWxlSGVscGVyLCBwc2QpIHtcbiAgICB2YXIgcHNkID0gcHNkIHx8IHt9O1xuICAgIHZhciBzZWN0aW9uRGF0YSA9IG5ldyBGaWxlSGVscGVyKCk7XG4gICAgc2VjdGlvbkRhdGEuY3JlYXRlKDQpO1xuXG4gICAgaWYocHNkLmdsb2JhbExheWVyTWFza0luZm8gIT09IHVuZGVmaW5lZCAmJiBwc2QuZ2xvYmFsTGF5ZXJNYXNrSW5mby5vdmVybGF5Q29sb3JTcGFjZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKDE2KTsgLy8gTGVuZ3RoXG4gICAgICAgIHNlY3Rpb25EYXRhLmV4dGVuZCgxNik7XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDE2KHBzZC5nbG9iYWxMYXllck1hc2tJbmZvLm92ZXJsYXlDb2xvclNwYWNlKTtcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYocHNkLmdsb2JhbExheWVyTWFza0luZm8uY29sb3JDb21wb25lbnRzWzBdKTtcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYocHNkLmdsb2JhbExheWVyTWFza0luZm8uY29sb3JDb21wb25lbnRzWzFdKTtcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYocHNkLmdsb2JhbExheWVyTWFza0luZm8uY29sb3JDb21wb25lbnRzWzJdKTtcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYocHNkLmdsb2JhbExheWVyTWFza0luZm8uY29sb3JDb21wb25lbnRzWzNdKTtcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYocHNkLmdsb2JhbExheWVyTWFza0luZm8ub3BhY2l0eSk7XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDgocHNkLmdsb2JhbExheWVyTWFza0luZm8ua2luZCk7XG4gICAgICAgIC8vIFRPRE86IFNwZWMgc2F5cyB0aGVyZSBjYW4gYmEgYSB2YXJpYWJsZSBhbW91bnQgb2YgZmlsbGVyIHplcm9zIGhlcmU/XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlY3Rpb25EYXRhLmFycmF5QnVmZmVyO1xufTtcbiIsInZhciBjb2xvcm1vZGVzID0gW1xuICAgICdCaXRtYXAnLFxuICAgICdHcmF5c2NhbGUnLFxuICAgICdJbmRleGVkJyxcbiAgICAnUkdCJyxcbiAgICAnQ01ZSycsXG4gICAgJ0hTTCcsXG4gICAgJ0hTQicsXG4gICAgJ011bHRpY2hhbm5lbCcsXG4gICAgJ0R1b3RvbmUnLFxuICAgICdMYWInXG5dO1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24oZmlsZUhlbHBlcikge1xuICAgIHZhciBmaWxlSGVhZGVyID0ge307XG4gICAgdmFyIHNpZ25hdHVyZSA9IGZpbGVIZWxwZXIucmVhZFN0cmluZyg0KTtcbiAgICB2YXIgdmVyc2lvbiA9IGZpbGVIZWxwZXIucmVhZFVpbnQxNigpO1xuXG4gICAgZmlsZUhlYWRlci52YWxpZCA9IGZhbHNlO1xuICAgIGlmKHNpZ25hdHVyZSA9PT0gJzhCUFMnICYmIHZlcnNpb24gPT09IDEpIHtcbiAgICAgICAgZmlsZUhlbHBlci5za2lwKDYpO1xuICAgICAgICBmaWxlSGVhZGVyLnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgZmlsZUhlYWRlci5jaGFubmVscyA9IGZpbGVIZWxwZXIucmVhZFVpbnQxNigpO1xuICAgICAgICBmaWxlSGVhZGVyLmhlaWdodCA9IGZpbGVIZWxwZXIucmVhZFVpbnQzMigpO1xuICAgICAgICBmaWxlSGVhZGVyLndpZHRoID0gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG4gICAgICAgIGZpbGVIZWFkZXIuZGVwdGggPSBmaWxlSGVscGVyLnJlYWRVaW50MTYoKTtcbiAgICAgICAgZmlsZUhlYWRlci5jb2xvcm1vZGUgPSBjb2xvcm1vZGVzW2ZpbGVIZWxwZXIucmVhZFVpbnQxNigpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsZUhlYWRlcjtcbn07XG5cbmV4cG9ydHMuY29tcG9zZSA9IGZ1bmN0aW9uKGZpbGVIZWxwZXIsIHBzZCkge1xuICAgIHZhciBwc2QgPSBwc2QgfHwge307XG5cbiAgICBmaWxlSGVscGVyLmV4dGVuZCgyNik7XG4gICAgZmlsZUhlbHBlci53cml0ZVN0cmluZygnOEJQUycpO1xuICAgIGZpbGVIZWxwZXIud3JpdGVVaW50MTYoMSk7XG4gICAgZmlsZUhlbHBlci53cml0ZVVpbnQ4QXJyYXkoWzAsMCwwLDAsMCwwXSk7XG4gICAgZmlsZUhlbHBlci53cml0ZVVpbnQxNihwc2QuY2hhbm5lbHMpO1xuICAgIGZpbGVIZWxwZXIud3JpdGVVaW50MzIocHNkLmhlaWdodCk7XG4gICAgZmlsZUhlbHBlci53cml0ZVVpbnQzMihwc2Qud2lkdGgpO1xuICAgIGZpbGVIZWxwZXIud3JpdGVVaW50MTYocHNkLmRlcHRoIHx8IDgpO1xuICAgIGZpbGVIZWxwZXIud3JpdGVVaW50MTYoY29sb3Jtb2Rlcy5pbmRleE9mKHBzZC5jb2xvcm1vZGUgfHwgJ1JHQicpKTtcbn07XG4iLCJ2YXIgcmxlID0gcmVxdWlyZSgnLi9ybGUuanMnKTtcblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uKGZpbGVIZWxwZXIsIHdpZHRoLCBoZWlnaHQsIGNoYW5uZWxDb3VudCkge1xuICAgIHZhciBpbWFnZURhdGEgPSBbXTtcbiAgICB2YXIgcGl4ZWxDb3VudCA9IHdpZHRoICogaGVpZ2h0O1xuXG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIGNvbXByZXNzaW9uID0gZmlsZUhlbHBlci5yZWFkVWludDE2KCk7XG5cbiAgICAgICAgaWYgKGNvbXByZXNzaW9uID09PSAwKSB7IC8vIFJBV1xuICAgICAgICAgICAgZm9yKHZhciBpPTA7IGk8Y2hhbm5lbENvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICBpbWFnZURhdGFbaV0gPSBmaWxlSGVscGVyLnJlYWRVaW50OEFycmF5KHBpeGVsQ291bnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGNvbXByZXNzaW9uID09PSAxKSB7ICAvLyBSTEVcbiAgICAgICAgICAgIC8vIFRPRE86IGNhbiB0aGlzIGJlIG9wdGltaXplZD9cbiAgICAgICAgICAgIHZhciBzY2FuTGluZUNvdW50ID0gaGVpZ2h0ICogY2hhbm5lbENvdW50O1xuICAgICAgICAgICAgdmFyIGJ5dGVDb3VudHMgPSBbXTtcbiAgICAgICAgICAgIHZhciBkZWNvbXByZXNzZWREYXRhID0gbmV3IFVpbnQ4QXJyYXkoc2NhbkxpbmVDb3VudCp3aWR0aCk7XG5cbiAgICAgICAgICAgIGZvcih2YXIgaT0wOyBpPHNjYW5MaW5lQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgIGJ5dGVDb3VudHNbaV0gPSBmaWxlSGVscGVyLnJlYWRVaW50MTYoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvcih2YXIgaT0wOyBpPHNjYW5MaW5lQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBlbmNvZGVkQXJyYXkgPSBmaWxlSGVscGVyLnJlYWRJbnQ4QXJyYXkoYnl0ZUNvdW50c1tpXSk7XG4gICAgICAgICAgICAgICAgdmFyIGRlY29kZWRBcnJheSA9IHJsZS5kZWNvZGUoZW5jb2RlZEFycmF5KTtcbiAgICAgICAgICAgICAgICBkZWNvbXByZXNzZWREYXRhLnNldChkZWNvZGVkQXJyYXksIGkqd2lkdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yKHZhciBpPTA7IGk8Y2hhbm5lbENvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICBpbWFnZURhdGFbaV0gPSBkZWNvbXByZXNzZWREYXRhLnNsaWNlKGkqcGl4ZWxDb3VudCwgaSpwaXhlbENvdW50K3BpeGVsQ291bnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVE9ETzogY2FzZSAyICYgMzogWklQIGNvbXByZXNzaW9uXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGQVRBTCBFUlJPUjogVW5rbm93biBjb21wcmVzc2lvbiB0eXBlICcgKyBjb21wcmVzc2lvbik7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgLy8gQ29tcG9zaXRlIGltYWdlIG5vdCBwcmVzZW50XG4gICAgICAgIC8vIEluIHRoZW9yeSB3ZSBjb3VsZCByZWJ1aWxkIGl0IGZyb20gYWxsIHRoZSBsYXllciBkYXRhXG4gICAgICAgIC8vIEJ1dCB0aGF0cyBhbG1vc3QgbGlrZSByZWJ1aWxkaW5nIHBob3Rvc2hvcCBjb21wbGV0ZWx5XG4gICAgfVxuXG4gICAgcmV0dXJuIGltYWdlRGF0YTtcbn07XG5cbmV4cG9ydHMuY29tcG9zZSA9IGZ1bmN0aW9uKGZpbGVIZWxwZXIsIHBzZCkge1xuICAgIHZhciBwc2QgPSBwc2QgfHwge307XG5cbiAgICBpZihwc2QuaW1hZ2VEYXRhICE9PSB1bmRlZmluZWQgJiYgcHNkLmltYWdlRGF0YVswXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZpbGVIZWxwZXIuZXh0ZW5kKHBzZC5pbWFnZURhdGFbMF0ubGVuZ3RoICogcHNkLmltYWdlRGF0YS5sZW5ndGggKyAyKTsgLy8gQ2hhbm5lbCBsZW5ndGggKiBjaGFubmVsIGNvdW50ICsgc2l6ZVxuICAgICAgICBmaWxlSGVscGVyLndyaXRlVWludDE2KDApOyAvLyBUT0RPOiBtYXliZSB1c2UgY29tcHJlc3Npb24gaW4gdGhlIGZ1dHVyZVxuICAgICAgICBmb3IodmFyIGk9MDsgaTxwc2QuaW1hZ2VEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmaWxlSGVscGVyLndyaXRlVWludDhBcnJheShwc2QuaW1hZ2VEYXRhW2ldKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGZpbGVIZWxwZXIuZXh0ZW5kKDMpO1xuICAgIH1cbn07XG4iLCJleHBvcnRzLnRvQmFzZTY0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoaXMgZnVuY3Rpb24gaXMgbm90IHlldCBzdXBwb3J0ZWQgb3V0c2lkZSBvZiBicm93c2Vycy4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICBjYW52YXMud2lkdGggPSB0aGlzLndpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgIGlmKHRoaXMud2lkdGggPiAwICYmIHRoaXMuaGVpZ2h0ID4gMCkge1xuICAgICAgICB2YXIgaW1hZ2VEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIHZhciByID0gdGhpcy5jaGFubmVscy5maWx0ZXIoZnVuY3Rpb24oY2hhbm5lbCkgeyByZXR1cm4gY2hhbm5lbC5pZCA9PT0gMDsgfSlbMF07XG4gICAgICAgIHZhciBnID0gdGhpcy5jaGFubmVscy5maWx0ZXIoZnVuY3Rpb24oY2hhbm5lbCkgeyByZXR1cm4gY2hhbm5lbC5pZCA9PT0gMTsgfSlbMF07XG4gICAgICAgIHZhciBiID0gdGhpcy5jaGFubmVscy5maWx0ZXIoZnVuY3Rpb24oY2hhbm5lbCkgeyByZXR1cm4gY2hhbm5lbC5pZCA9PT0gMjsgfSlbMF07XG4gICAgICAgIHZhciBhID0gdGhpcy5jaGFubmVscy5maWx0ZXIoZnVuY3Rpb24oY2hhbm5lbCkgeyByZXR1cm4gY2hhbm5lbC5pZCA9PT0gLTI7IH0pWzBdO1xuICAgICAgICBpZihhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGEgPSB0aGlzLmNoYW5uZWxzLmZpbHRlcihmdW5jdGlvbihjaGFubmVsKSB7IHJldHVybiBjaGFubmVsLmlkID09PSAtMTsgfSlbMF07XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy53aWR0aCAqIHkgKyB4O1xuICAgICAgICAgICAgICAgIHZhciBtYXNrSW5kZXggPSBpbmRleDtcblxuICAgICAgICAgICAgICAgIGlmKHRoaXMubWFza0RhdGEgIT09IHVuZGVmaW5lZCAmJiB0aGlzLm1hc2tEYXRhLnRvcCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB5TWFzayA9IHkgKyB0aGlzLnRvcCAtIHRoaXMubWFza0RhdGEudG9wO1xuICAgICAgICAgICAgICAgICAgICB2YXIgeE1hc2sgPSB4ICsgdGhpcy5sZWZ0IC0gdGhpcy5tYXNrRGF0YS5sZWZ0O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWFza0luZGV4ID0gdGhpcy5tYXNrRGF0YS53aWR0aCAqIHlNYXNrICsgeE1hc2s7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaW1hZ2VEYXRhLmRhdGFbaW5kZXgqNF0gPSByLmRhdGFbaW5kZXhdO1xuICAgICAgICAgICAgICAgIGltYWdlRGF0YS5kYXRhW2luZGV4KjQgKyAxXSA9IGcuZGF0YVtpbmRleF07XG4gICAgICAgICAgICAgICAgaW1hZ2VEYXRhLmRhdGFbaW5kZXgqNCArIDJdID0gYi5kYXRhW2luZGV4XTtcbiAgICAgICAgICAgICAgICBpZihhICE9PSB1bmRlZmluZWQgJiYgYS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VEYXRhLmRhdGFbaW5kZXgqNCArIDNdID0gYS5kYXRhW21hc2tJbmRleF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VEYXRhLmRhdGFbaW5kZXgqNCArIDNdID0gMjU1O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGN0eC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XG59O1xuXG5leHBvcnRzLnRvUG5nID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoaXMgZnVuY3Rpb24gaXMgbm90IHlldCBzdXBwb3J0ZWQgb3V0c2lkZSBvZiBicm93c2Vycy4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICB2YXIgZGF0YVVybCA9IHRoaXMudG9CYXNlNjQoKTtcbiAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgIGltYWdlLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICBpbWFnZS5oZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICBpbWFnZS5zcmMgPSBkYXRhVXJsO1xuXG4gICAgcmV0dXJuIGltYWdlO1xufTtcbiIsInZhciBGaWxlSGVscGVyID0gcmVxdWlyZSgnLi9GaWxlSGVscGVyLmpzJyk7XG5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbihmaWxlSGVscGVyKSB7XG4gICAgdmFyIGltYWdlUmVzb3VyY2VzID0gW107XG4gICAgdmFyIGltYWdlUmVzb3VyY2VzRW5kID0gZmlsZUhlbHBlci5wb2ludGVyICsgZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG5cbiAgICB3aGlsZShmaWxlSGVscGVyLnBvaW50ZXIgPCBpbWFnZVJlc291cmNlc0VuZCkge1xuICAgICAgICB2YXIgYmxvY2sgPSB7fTtcblxuICAgICAgICBpZihmaWxlSGVscGVyLnJlYWRTdHJpbmcoNCkgPT09ICc4QklNJykgeyAvLyBjb3JyZWN0IHNpZ25hdHVyZVxuICAgICAgICAgICAgYmxvY2suaWQgPSBmaWxlSGVscGVyLnJlYWRVaW50MTYoKTtcbiAgICAgICAgICAgIGJsb2NrLm5hbWUgPSBmaWxlSGVscGVyLnJlYWRQYXNjYWxTdHJpbmcoJ2V2ZW5MZW5ndGgnKTtcbiAgICAgICAgICAgIHZhciBkYXRhTGVuZ3RoID0gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG4gICAgICAgICAgICBibG9jay5kYXRhID0gZmlsZUhlbHBlci5yZWFkVWludDhBcnJheShkYXRhTGVuZ3RoKTtcbiAgICAgICAgICAgIGlmKGRhdGFMZW5ndGggJSAyICE9PSAwKSBmaWxlSGVscGVyLnNraXAoMSk7ICAvLyBwYWRkZWQgdG8gZXZlbiBsZW5ndGhcbiAgICAgICAgICAgIC8vIFRPRE86IGRvIHNvbWV0aGluZyB3aXRoIHRoZSBkYXRhIChhdCBsZWFzdCB3aXRoIHNvbWUgb2YgaXQpXG4gICAgICAgICAgICBpbWFnZVJlc291cmNlcy5wdXNoKGJsb2NrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpbWFnZVJlc291cmNlcztcbn07XG5cbmV4cG9ydHMuY29tcG9zZSA9IGZ1bmN0aW9uKGZpbGVIZWxwZXIsIHBzZCkge1xuICAgIHZhciBwc2QgPSBwc2QgfHwge307XG5cbiAgICBpZihwc2QuaW1hZ2VSZXNvdXJjZXMgPT09IHVuZGVmaW5lZCkgeyAvLyBObyBpbWFnZSByZXNvdXJjZXNcbiAgICAgICAgZmlsZUhlbHBlci5leHRlbmQoNCk7XG4gICAgICAgIGZpbGVIZWxwZXIud3JpdGVVaW50MzIoMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHNlY3Rpb25EYXRhID0gbmV3IEZpbGVIZWxwZXIoKTtcbiAgICAgICAgc2VjdGlvbkRhdGEuY3JlYXRlKDApO1xuXG4gICAgICAgIGZvcih2YXIgaT0wOyBpPHBzZC5pbWFnZVJlc291cmNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2VjdGlvbkRhdGEuZXh0ZW5kKDQpO1xuICAgICAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVTdHJpbmcoJzhCSU0nKTtcblxuICAgICAgICAgICAgc2VjdGlvbkRhdGEuZXh0ZW5kKDIpO1xuICAgICAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYocHNkLmltYWdlUmVzb3VyY2VzW2ldLmlkKTtcblxuICAgICAgICAgICAgaWYocHNkLmltYWdlUmVzb3VyY2VzW2ldLm5hbWUgPT09IHVuZGVmaW5lZCB8fCBwc2QuaW1hZ2VSZXNvdXJjZXNbaV0ubmFtZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBzZWN0aW9uRGF0YS5leHRlbmQoMik7XG4gICAgICAgICAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVTdHJpbmcoJ1xcMFxcMCcpOyAvLyBFbXB0eSBuYW1lIGlzIHR3byB6ZXJvc1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZUxlbmd0aCA9IE1hdGguY2VpbChwc2QuaW1hZ2VSZXNvdXJjZXNbaV0ubmFtZS5sZW5ndGgvMi4wKSAqIDIgKyAxOyAvLyBtdWx0aXBsZSBvZiB0d28gKyAxIEJ5dGUgbGVuZ3RoIGRhdGFcbiAgICAgICAgICAgICAgICBzZWN0aW9uRGF0YS5leHRlbmQobmFtZUxlbmd0aCk7IC8vXG4gICAgICAgICAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVQYXNjYWxTdHJpbmcocHNkLmltYWdlUmVzb3VyY2VzW2ldLm5hbWUsICdldmVuTGVuZ3RoJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlY3Rpb25EYXRhLmV4dGVuZCg0KTtcbiAgICAgICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKHBzZC5pbWFnZVJlc291cmNlc1tpXS5kYXRhLmxlbmd0aCk7XG5cbiAgICAgICAgICAgIHNlY3Rpb25EYXRhLmV4dGVuZChwc2QuaW1hZ2VSZXNvdXJjZXNbaV0uZGF0YS5sZW5ndGgpO1xuICAgICAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50OEFycmF5KHBzZC5pbWFnZVJlc291cmNlc1tpXS5kYXRhKTtcblxuICAgICAgICAgICAgaWYocHNkLmltYWdlUmVzb3VyY2VzW2ldLmRhdGEubGVuZ3RoICUgMiAhPT0gMCkgeyAgLy8gcGFkIHRvIGV2ZW4gbGVuZ3RoXG4gICAgICAgICAgICAgICAgc2VjdGlvbkRhdGEuZXh0ZW5kKDEpO1xuICAgICAgICAgICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDgoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmaWxlSGVscGVyLmV4dGVuZCg0KTtcbiAgICAgICAgZmlsZUhlbHBlci53cml0ZVVpbnQzMihzZWN0aW9uRGF0YS5hcnJheUJ1ZmZlci5ieXRlTGVuZ3RoKTsgLy8gc2VjdGlvbiBsZW5ndGhcbiAgICAgICAgZmlsZUhlbHBlci5leHRlbmQoc2VjdGlvbkRhdGEuYXJyYXlCdWZmZXIuYnl0ZUxlbmd0aCk7XG4gICAgICAgIGZpbGVIZWxwZXIud3JpdGVVaW50OEFycmF5KG5ldyBVaW50OEFycmF5KHNlY3Rpb25EYXRhLmFycmF5QnVmZmVyKSk7ICAgLy8gc2VjdGlvbiBkYXRhXG4gICAgfVxufTtcbiIsInZhciBsYXllckluZm8gPSByZXF1aXJlKCcuL2xheWVySW5mby5qcycpO1xudmFyIGNoYW5uZWxJbWFnZURhdGEgPSByZXF1aXJlKCcuL2NoYW5uZWxJbWFnZURhdGEuanMnKTtcbnZhciBnbG9iYWxMYXllck1hc2tJbmZvID0gcmVxdWlyZSgnLi9nbG9iYWxMYXllck1hc2tJbmZvLmpzJyk7XG5cbi8vIFRPRE86IGFkZCB0eXBlIGF0dHJpYnV0ZSB0byBsYXllcnMgKGZvciBmb2xkZXJzKSBhbiBuZXN0IHRoZW1cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbihmaWxlSGVscGVyKSB7XG4gICAgdmFyIGxheWVyQW5kTWFza0luZm9ybWF0aW9uID0ge307XG4gICAgdmFyIHNlY3Rpb25MZW5ndGggPSBmaWxlSGVscGVyLnJlYWRVaW50MzIoKTtcbiAgICB2YXIgc3RhcnRQb3NpdGlvbiA9IGZpbGVIZWxwZXIucG9pbnRlcjtcblxuICAgIGxheWVyQW5kTWFza0luZm9ybWF0aW9uLmxheWVycyA9IGxheWVySW5mby5wYXJzZShmaWxlSGVscGVyKTtcbiAgICBjaGFubmVsSW1hZ2VEYXRhLnBhcnNlKGZpbGVIZWxwZXIsIGxheWVyQW5kTWFza0luZm9ybWF0aW9uLmxheWVycyk7XG4gICAgbGF5ZXJBbmRNYXNrSW5mb3JtYXRpb24uZ2xvYmFsTGF5ZXJNYXNrSW5mbyA9IGdsb2JhbExheWVyTWFza0luZm8ucGFyc2UoZmlsZUhlbHBlcik7XG4gICAgZmlsZUhlbHBlci5za2lwKHNlY3Rpb25MZW5ndGggLSAoZmlsZUhlbHBlci5wb2ludGVyIC0gc3RhcnRQb3NpdGlvbikpO1xuICAgIC8vIFRPRE86IGNoZWNrIGlmIHNraXBwaW5nIGlzIHRoZSBiZXN0IGlkZWEgaGVyZVxuXG4gICAgcmV0dXJuIGxheWVyQW5kTWFza0luZm9ybWF0aW9uO1xufTtcblxuZXhwb3J0cy5jb21wb3NlID0gZnVuY3Rpb24oZmlsZUhlbHBlciwgcHNkKSB7XG4gICAgdmFyIHBzZCA9IHBzZCB8fCB7fTtcbiAgICB2YXIgbGF5ZXJJbmZvQnVmZmVyID0gbGF5ZXJJbmZvLmNvbXBvc2UoZmlsZUhlbHBlciwgcHNkKTtcbiAgICB2YXIgY2hhbm5lbEltYWdlRGF0YUJ1ZmZlciA9IGNoYW5uZWxJbWFnZURhdGEuY29tcG9zZShmaWxlSGVscGVyLCBwc2QpO1xuICAgIHZhciBnbG9iYWxMYXllck1hc2tJbmZvQnVmZmVyID0gZ2xvYmFsTGF5ZXJNYXNrSW5mby5jb21wb3NlKGZpbGVIZWxwZXIsIHBzZCk7XG4gICAgdmFyIHNlY3Rpb25MZW5ndGggPSBsYXllckluZm9CdWZmZXIuYnl0ZUxlbmd0aCArIGNoYW5uZWxJbWFnZURhdGFCdWZmZXIuYnl0ZUxlbmd0aCArIGdsb2JhbExheWVyTWFza0luZm9CdWZmZXIuYnl0ZUxlbmd0aDtcblxuICAgIGZpbGVIZWxwZXIuZXh0ZW5kKDQpO1xuICAgIGZpbGVIZWxwZXIud3JpdGVVaW50MzIoc2VjdGlvbkxlbmd0aCk7IC8vIHNlY3Rpb24gbGVuZ3RoXG4gICAgZmlsZUhlbHBlci5leHRlbmQoc2VjdGlvbkxlbmd0aCk7XG4gICAgZmlsZUhlbHBlci53cml0ZVVpbnQ4QXJyYXkobmV3IFVpbnQ4QXJyYXkobGF5ZXJJbmZvQnVmZmVyKSk7IC8vIHNlY3Rpb24gZGF0YVxuICAgIGZpbGVIZWxwZXIud3JpdGVVaW50OEFycmF5KG5ldyBVaW50OEFycmF5KGNoYW5uZWxJbWFnZURhdGFCdWZmZXIpKTsgLy8gc2VjdGlvbiBkYXRhXG4gICAgZmlsZUhlbHBlci53cml0ZVVpbnQ4QXJyYXkobmV3IFVpbnQ4QXJyYXkoZ2xvYmFsTGF5ZXJNYXNrSW5mb0J1ZmZlcikpOyAvLyBzZWN0aW9uIGRhdGFcbn07XG4iLCJ2YXIgbGF5ZXJSZWNvcmQgPSByZXF1aXJlKCcuL2xheWVyUmVjb3JkLmpzJyk7XG52YXIgRmlsZUhlbHBlciA9IHJlcXVpcmUoJy4vRmlsZUhlbHBlci5qcycpO1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24oZmlsZUhlbHBlcikge1xuICAgIHZhciBsYXllcnMgPSBbXTtcbiAgICBmaWxlSGVscGVyLnNraXAoNCk7IC8vIHNlY3Rpb24gbGVuZ3RoXG4gICAgdmFyIGxheWVyQ291bnQgPSBmaWxlSGVscGVyLnJlYWRJbnQxNigpO1xuICAgIGlmKGxheWVyQ291bnQgPCAwKSB7XG4gICAgICAgIGxheWVyQ291bnQgPSBNYXRoLmFicyhsYXllckNvdW50KTtcbiAgICAgICAgLy8gVE9ETzogSWYgbGF5ZXIgY291bnQgaXMgbmVnYXRpdmUgPT4gZmlyc3QgYWxwaGEgY2hhbm5lbCBjb250YWluc1xuICAgICAgICAvLyB0aGUgdHJhbnNwYXJlbmN5IGRhdGEgZm9yIHRoZSBtZXJnZWQgcmVzdWx0LlxuICAgIH1cbiAgICBmb3IodmFyIGk9MDsgaTxsYXllckNvdW50OyBpKyspIHtcbiAgICAgICAgbGF5ZXJzLnB1c2gobGF5ZXJSZWNvcmQucGFyc2UoZmlsZUhlbHBlcikpO1xuICAgIH1cblxuICAgIHJldHVybiBsYXllcnM7XG59O1xuXG5leHBvcnRzLmNvbXBvc2UgPSBmdW5jdGlvbihmaWxlSGVscGVyLCBwc2QpIHtcbiAgICB2YXIgcHNkID0gcHNkIHx8IHt9O1xuICAgIHZhciBzZWN0aW9uRGF0YSA9IG5ldyBGaWxlSGVscGVyKCk7XG4gICAgc2VjdGlvbkRhdGEuY3JlYXRlKDQpO1xuXG4gICAgaWYocHNkLmxheWVycyAhPT0gdW5kZWZpbmVkICYmIHBzZC5sYXllcnNbMF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZWN0aW9uRGF0YS5za2lwKDQpOyAvLyBTZWN0aW9uIGxlbmd0aCB0ZW1wb3JhcnkgemVybyB1bnRpbCB3ZSBrbm93IGl0XG4gICAgICAgIHNlY3Rpb25EYXRhLmV4dGVuZCgyKTtcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MTYocHNkLmxheWVycy5sZW5ndGgpO1xuXG4gICAgICAgIGZvcih2YXIgaT0wOyBpPHBzZC5sYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBsYXllckRhdGEgPSBuZXcgVWludDhBcnJheShsYXllclJlY29yZC5jb21wb3NlKHBzZC5sYXllcnNbaV0pKTtcblxuICAgICAgICAgICAgc2VjdGlvbkRhdGEuZXh0ZW5kKGxheWVyRGF0YS5sZW5ndGgpO1xuICAgICAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50OEFycmF5KGxheWVyRGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2VjdGlvbkxlbmd0aCA9IHNlY3Rpb25EYXRhLmFycmF5QnVmZmVyLmJ5dGVMZW5ndGg7IC8vIFRPRE86IHJvdW5kIHRvIG11bHRpcGxlIG9mIHR3b1xuICAgICAgICBzZWN0aW9uRGF0YS5yZXZlcnQoc2VjdGlvbkxlbmd0aCk7XG4gICAgICAgIGZvcih2YXIgaT0wOyBpPHBzZC5sYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGZvcih2YXIgaj0wOyBqPHBzZC5sYXllcnNbaV0uY2hhbm5lbHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBzZWN0aW9uTGVuZ3RoICs9IHBzZC5sYXllcnNbaV0uY2hhbm5lbHNbal0uZGF0YS5sZW5ndGggKyAyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKHNlY3Rpb25MZW5ndGgpO1xuICAgIH1cblxuICAgIHJldHVybiBzZWN0aW9uRGF0YS5hcnJheUJ1ZmZlcjtcbn07XG4iLCJ2YXIgRmlsZUhlbHBlciA9IHJlcXVpcmUoJy4vRmlsZUhlbHBlci5qcycpO1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24oZmlsZUhlbHBlcikge1xuICAgIHZhciBtYXNrRGF0YSA9IHt9O1xuICAgIHZhciBzZWN0aW9uTGVuZ3RoID0gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG5cbiAgICBpZihzZWN0aW9uTGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIG1hc2tEYXRhLnRvcCA9IGZpbGVIZWxwZXIucmVhZFVpbnQzMigpO1xuICAgICAgICBtYXNrRGF0YS5sZWZ0ID0gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG4gICAgICAgIG1hc2tEYXRhLmJvdHRvbSA9IGZpbGVIZWxwZXIucmVhZFVpbnQzMigpO1xuICAgICAgICBtYXNrRGF0YS5yaWdodCA9IGZpbGVIZWxwZXIucmVhZFVpbnQzMigpO1xuICAgICAgICBtYXNrRGF0YS53aWR0aCA9IG1hc2tEYXRhLnJpZ2h0IC0gbWFza0RhdGEubGVmdDtcbiAgICAgICAgbWFza0RhdGEuaGVpZ2h0ID0gbWFza0RhdGEuYm90dG9tIC0gbWFza0RhdGEudG9wO1xuICAgICAgICBtYXNrRGF0YS5kZWZhdWx0Q29sb3IgPSBmaWxlSGVscGVyLnJlYWRVaW50OCgpO1xuICAgICAgICBtYXNrRGF0YS5mbGFncyA9IGZpbGVIZWxwZXIucmVhZDhCaXRzKCk7XG4gICAgICAgIG1hc2tEYXRhLmZsYWdzID0gbWFza0RhdGEuZmxhZ3Muc2xpY2UoMCwgNSk7IC8vIE9ubHkgdGhlIGZpcnN0IGZpdmUgYml0cyBhcmUgZmxhZ3NcbiAgICAgICAgaWYobWFza0RhdGEuZmxhZ3NbNF0gPT09IDEpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IG1hc2sgcGFyYW1ldGVyc1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRkFUQUwgRVJST1I6IE1hc2sgUGFyc2luZyBub3QgZnVsbHkgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZihzZWN0aW9uTGVuZ3RoID09PSAyMCkge1xuICAgICAgICAgICAgZmlsZUhlbHBlci5za2lwKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVE9ETzogU3BlYyBzYXlzIHRoZSBzYW1lIGRhdGEgaXMgcmVwZWF0ZWQgbm93P1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRkFUQUwgRVJST1I6IE1hc2sgUGFyc2luZyBub3QgZnVsbHkgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXNrRGF0YTtcbn07XG5cbmV4cG9ydHMuY29tcG9zZSA9IGZ1bmN0aW9uKHJlY29yZCkge1xuICAgIHZhciBzZWN0aW9uRGF0YSA9IG5ldyBGaWxlSGVscGVyKCk7XG5cbiAgICBpZihyZWNvcmQubWFza0RhdGEgPT09IHVuZGVmaW5lZCB8fCByZWNvcmQubWFza0RhdGEudG9wID09PSB1bmRlZmluZWQpIHsgLy8gbm8gbWFza1xuICAgICAgICBzZWN0aW9uRGF0YS5jcmVhdGUoNCk7XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKDApOyAvLyBTZWN0aW9uIGxlbmd0aFxuICAgIH0gZWxzZSB7XG4gICAgICAgIHNlY3Rpb25EYXRhLmNyZWF0ZSgyNCk7XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKDIwKTsgLy8gU2VjdGlvbiBsZW5ndGhcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MzIocmVjb3JkLm1hc2tEYXRhLnRvcCk7XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKHJlY29yZC5tYXNrRGF0YS5sZWZ0KTtcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MzIocmVjb3JkLm1hc2tEYXRhLmJvdHRvbSk7XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKHJlY29yZC5tYXNrRGF0YS5yaWdodCk7XG4gICAgICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDgocmVjb3JkLm1hc2tEYXRhLmRlZmF1bHRDb2xvciB8fCAyNTUpO1xuICAgICAgICByZWNvcmQubWFza0RhdGEuZmxhZ3MgPSByZWNvcmQubWFza0RhdGEuZmxhZ3MgfHwgWzAsIDAsIDAsIDAsIDBdO1xuICAgICAgICByZWNvcmQubWFza0RhdGEuZmxhZ3MucHVzaCgwLCAwLCAwKTsgLy8gRmlsbCB3aXRoIHplcm9zIHRvIGdldCA4IGJpdHNcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGU4Qml0cyhyZWNvcmQubWFza0RhdGEuZmxhZ3MpO1xuICAgICAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQxNigwKTsgLy8gUGFkZGluZ1xuICAgICAgICAvLyBUT0RPOiBtYXNrIHBhcmFtZXRlcnNcbiAgICB9XG5cbiAgICByZXR1cm4gc2VjdGlvbkRhdGEuYXJyYXlCdWZmZXI7XG59O1xuIiwidmFyIGJsZW5kTW9kZXMgPSByZXF1aXJlKCcuL2JsZW5kTW9kZXMuanMnKTtcbnZhciBsYXllck1hc2tEYXRhID0gcmVxdWlyZSgnLi9sYXllck1hc2tEYXRhLmpzJyk7XG52YXIgYmxlbmRpbmdSYW5nZXMgPSByZXF1aXJlKCcuL2JsZW5kaW5nUmFuZ2VzLmpzJyk7XG52YXIgYWRkaXRpb25hbExheWVySW5mbyA9IHJlcXVpcmUoJy4vYWRkaXRpb25hbExheWVySW5mby5qcycpO1xudmFyIGltYWdlSGVscGVyID0gcmVxdWlyZSgnLi9pbWFnZUhlbHBlci5qcycpO1xudmFyIEZpbGVIZWxwZXIgPSByZXF1aXJlKCcuL0ZpbGVIZWxwZXIuanMnKTtcblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uKGZpbGVIZWxwZXIpIHtcbiAgICB2YXIgcmVjb3JkID0ge307XG5cbiAgICByZWNvcmQudG9wID0gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG4gICAgcmVjb3JkLmxlZnQgPSBmaWxlSGVscGVyLnJlYWRVaW50MzIoKTtcbiAgICByZWNvcmQuYm90dG9tID0gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG4gICAgcmVjb3JkLnJpZ2h0ID0gZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG4gICAgcmVjb3JkLndpZHRoID0gcmVjb3JkLnJpZ2h0IC0gcmVjb3JkLmxlZnQ7XG4gICAgcmVjb3JkLmhlaWdodCA9IHJlY29yZC5ib3R0b20gLSByZWNvcmQudG9wO1xuICAgIHZhciBjaGFubmVsQ291bnQgPSBmaWxlSGVscGVyLnJlYWRVaW50MTYoKTtcbiAgICByZWNvcmQuY2hhbm5lbEluZm8gPSBbXTtcbiAgICBmb3IodmFyIGk9MDsgaTxjaGFubmVsQ291bnQ7IGkrKykge1xuICAgICAgICByZWNvcmQuY2hhbm5lbEluZm8ucHVzaCh7XG4gICAgICAgICAgICBpZDogZmlsZUhlbHBlci5yZWFkSW50MTYoKSxcbiAgICAgICAgICAgIGRhdGFMZW5ndGg6IGZpbGVIZWxwZXIucmVhZFVpbnQzMigpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBmaWxlSGVscGVyLnNraXAoNCk7IC8vIGJsZW5kIG1vZGUgc2lnbmF0dXJlXG4gICAgcmVjb3JkLmJsZW5kTW9kZSA9IGJsZW5kTW9kZXNbZmlsZUhlbHBlci5yZWFkU3RyaW5nKDQpXTtcbiAgICByZWNvcmQub3BhY2l0eSA9IGZpbGVIZWxwZXIucmVhZFVpbnQ4KCk7XG4gICAgcmVjb3JkLmNsaXBwaW5nID0gZmlsZUhlbHBlci5yZWFkVWludDgoKTtcbiAgICByZWNvcmQuZmxhZ3MgPSBmaWxlSGVscGVyLnJlYWQ4Qml0cygpO1xuICAgIHJlY29yZC5mbGFncyA9IHJlY29yZC5mbGFncy5zbGljZSgwLCA1KTsgLy8gT25seSB0aGUgZmlyc3QgZml2ZSBiaXRzIGFyZSBmbGFnc1xuICAgIGZpbGVIZWxwZXIuc2tpcCgxKTsgLy8gRmlsbGVyXG5cbiAgICB2YXIgZXh0cmFEYXRhRW5kID0gZmlsZUhlbHBlci5wb2ludGVyICsgZmlsZUhlbHBlci5yZWFkVWludDMyKCk7XG4gICAgcmVjb3JkLm1hc2tEYXRhID0gbGF5ZXJNYXNrRGF0YS5wYXJzZShmaWxlSGVscGVyKTtcbiAgICByZWNvcmQuYmxlbmRpbmdSYW5nZXMgPSBibGVuZGluZ1Jhbmdlcy5wYXJzZShmaWxlSGVscGVyKTtcbiAgICByZWNvcmQubmFtZSA9IGZpbGVIZWxwZXIucmVhZFBhc2NhbFN0cmluZygnbXVsdGlwbGVPZkZvdXJCeXRlcycpO1xuICAgIHJlY29yZC5hZGRpdGlvbmFsTGF5ZXJJbmZvID0gW107XG4gICAgd2hpbGUoZmlsZUhlbHBlci5wb2ludGVyIDwgZXh0cmFEYXRhRW5kKSB7XG4gICAgICAgIHZhciBpdGVtID0gYWRkaXRpb25hbExheWVySW5mby5wYXJzZShmaWxlSGVscGVyKTtcbiAgICAgICAgcmVjb3JkLmFkZGl0aW9uYWxMYXllckluZm8ucHVzaChpdGVtKTtcbiAgICB9XG5cbiAgICByZWNvcmQudG9CYXNlNjQgPSBpbWFnZUhlbHBlci50b0Jhc2U2NDtcbiAgICByZWNvcmQudG9QbmcgPSBpbWFnZUhlbHBlci50b1BuZztcblxuICAgIHJldHVybiByZWNvcmQ7XG59O1xuXG5leHBvcnRzLmNvbXBvc2UgPSBmdW5jdGlvbihyZWNvcmQpIHtcbiAgICB2YXIgcmVjb3JkID0gcmVjb3JkIHx8IHt9O1xuICAgIHZhciBzZWN0aW9uRGF0YSA9IG5ldyBGaWxlSGVscGVyKCk7XG5cbiAgICBzZWN0aW9uRGF0YS5jcmVhdGUoMzQgKyA2KnJlY29yZC5jaGFubmVscy5sZW5ndGgpO1xuICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKHJlY29yZC50b3ApO1xuICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDMyKHJlY29yZC5sZWZ0KTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQzMihyZWNvcmQuYm90dG9tKTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQzMihyZWNvcmQucmlnaHQpO1xuICAgIHNlY3Rpb25EYXRhLndyaXRlVWludDE2KHJlY29yZC5jaGFubmVscy5sZW5ndGgpO1xuICAgIGZvcih2YXIgaT0wOyBpPHJlY29yZC5jaGFubmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQxNihyZWNvcmQuY2hhbm5lbHNbaV0uaWQpOyAvLyBDaGFubmVsSURcbiAgICAgICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MzIocmVjb3JkLmNoYW5uZWxzW2ldLmRhdGEubGVuZ3RoICsgMik7IC8vIENoYW5uZWwgbGVuZ3RoXG4gICAgfVxuICAgIHNlY3Rpb25EYXRhLndyaXRlU3RyaW5nKCc4QklNJyk7XG4gICAgdmFyIGJsZW5kTW9kZUtleSA9IE9iamVjdC5rZXlzKGJsZW5kTW9kZXMpLmZpbHRlcihmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgcmV0dXJuIGJsZW5kTW9kZXNba2V5XSA9PT0gcmVjb3JkLmJsZW5kTW9kZTtcbiAgICB9KVswXTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVN0cmluZyhibGVuZE1vZGVLZXkgfHwgJ25vcm0nKTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQ4KHJlY29yZC5vcGFjaXR5IHx8IDI1NSk7XG4gICAgc2VjdGlvbkRhdGEud3JpdGVVaW50OChyZWNvcmQuY2xpcHBpbmcgfHwgMCk7XG4gICAgcmVjb3JkLmZsYWdzID0gcmVjb3JkLmZsYWdzIHx8IFswLCAwLCAwLCAwLCAwXTtcbiAgICByZWNvcmQuZmxhZ3MucHVzaCgwLCAwLCAwKTsgLy8gRmlsbCB3aXRoIHplcm9zIHRvIGdldCA4IGJpdHNcbiAgICBzZWN0aW9uRGF0YS53cml0ZThCaXRzKHJlY29yZC5mbGFncyk7XG4gICAgc2VjdGlvbkRhdGEud3JpdGVVaW50OCgwKTsgLy8gRmlsbGVyXG4gICAgdmFyIGxheWVyTWFza0RhdGFTZWN0aW9uID0gbGF5ZXJNYXNrRGF0YS5jb21wb3NlKHJlY29yZCk7XG4gICAgdmFyIGJsZW5kaW5nUmFuZ2VzU2VjdGlvbiA9IGJsZW5kaW5nUmFuZ2VzLmNvbXBvc2UocmVjb3JkKTtcbiAgICB2YXIgYWRkaXRpb25hbExheWVySW5mb1NlY3Rpb24gPSBhZGRpdGlvbmFsTGF5ZXJJbmZvLmNvbXBvc2UocmVjb3JkKTtcbiAgICB2YXIgbmFtZUxlbmd0aCA9IE1hdGguY2VpbCgocmVjb3JkLm5hbWUubGVuZ3RoKzEpLzQuMCkgKiA0OyAvLyBtdWx0aXBsZSBvZiBmb3VyICgrMSB0byBjb3VudCB0aGUgbGVuZ3RoIGJ5dGUpXG4gICAgdmFyIGV4dHJhRGF0YUxlbmd0aCA9IGxheWVyTWFza0RhdGFTZWN0aW9uLmJ5dGVMZW5ndGggKyBibGVuZGluZ1Jhbmdlc1NlY3Rpb24uYnl0ZUxlbmd0aDtcbiAgICBleHRyYURhdGFMZW5ndGggKz0gbmFtZUxlbmd0aCArIGFkZGl0aW9uYWxMYXllckluZm9TZWN0aW9uLmJ5dGVMZW5ndGg7XG4gICAgc2VjdGlvbkRhdGEud3JpdGVVaW50MzIoZXh0cmFEYXRhTGVuZ3RoKTtcbiAgICBzZWN0aW9uRGF0YS5leHRlbmQoZXh0cmFEYXRhTGVuZ3RoKTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQ4QXJyYXkobmV3IFVpbnQ4QXJyYXkobGF5ZXJNYXNrRGF0YVNlY3Rpb24pKTtcbiAgICBzZWN0aW9uRGF0YS53cml0ZVVpbnQ4QXJyYXkobmV3IFVpbnQ4QXJyYXkoYmxlbmRpbmdSYW5nZXNTZWN0aW9uKSk7XG4gICAgc2VjdGlvbkRhdGEud3JpdGVQYXNjYWxTdHJpbmcocmVjb3JkLm5hbWUsICdtdWx0aXBsZU9mRm91ckJ5dGVzJyk7XG4gICAgc2VjdGlvbkRhdGEud3JpdGVVaW50OEFycmF5KG5ldyBVaW50OEFycmF5KGFkZGl0aW9uYWxMYXllckluZm9TZWN0aW9uKSk7XG5cbiAgICByZXR1cm4gc2VjdGlvbkRhdGEuYXJyYXlCdWZmZXI7XG59O1xuIiwidmFyIEZpbGVIZWxwZXIgPSByZXF1aXJlKCcuL0ZpbGVIZWxwZXIuanMnKTtcbnZhciBoZWFkZXIgPSByZXF1aXJlKCcuL2hlYWRlci5qcycpO1xudmFyIGNvbG9yTW9kZURhdGEgPSByZXF1aXJlKCcuL2NvbG9yTW9kZURhdGEuanMnKTtcbnZhciBpbWFnZVJlc291cmNlcyA9IHJlcXVpcmUoJy4vaW1hZ2VSZXNvdXJjZXMuanMnKTtcbnZhciBsYXllckFuZE1hc2tJbmZvID0gcmVxdWlyZSgnLi9sYXllckFuZE1hc2tJbmZvLmpzJyk7XG52YXIgaW1hZ2VIZWxwZXIgPSByZXF1aXJlKCcuL2ltYWdlSGVscGVyLmpzJyk7XG52YXIgaW1hZ2VEYXRhID0gcmVxdWlyZSgnLi9pbWFnZURhdGEuanMnKTtcblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uKGFycmF5QnVmZmVyKSB7XG4gICAgdmFyIHBzZCA9IHt9O1xuICAgIHZhciBmaWxlSGVscGVyID0gbmV3IEZpbGVIZWxwZXIoKTtcblxuICAgIGZpbGVIZWxwZXIub3BlbihhcnJheUJ1ZmZlcik7XG4gICAgdmFyIGhlYWRlckRhdGEgPSBoZWFkZXIucGFyc2UoZmlsZUhlbHBlcik7XG5cbiAgICBpZihoZWFkZXJEYXRhLmRlcHRoICE9PSA4IHx8IGhlYWRlckRhdGEuY29sb3Jtb2RlICE9PSAnUkdCJykge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFUlJPUjogT25seSA4IEJpdCBSR0IgUFNEcyBhcmUgc3VwcG9ydGVkISEnKTtcbiAgICB9IGVsc2UgaWYoaGVhZGVyRGF0YS52YWxpZCkge1xuICAgICAgICBwc2QuY2hhbm5lbHMgPSBoZWFkZXJEYXRhLmNoYW5uZWxzO1xuICAgICAgICBwc2QuaGVpZ2h0ID0gaGVhZGVyRGF0YS5oZWlnaHQ7XG4gICAgICAgIHBzZC53aWR0aCA9IGhlYWRlckRhdGEud2lkdGg7XG4gICAgICAgIHBzZC5kZXB0aCA9IGhlYWRlckRhdGEuZGVwdGg7XG4gICAgICAgIHBzZC5jb2xvcm1vZGUgPSBoZWFkZXJEYXRhLmNvbG9ybW9kZTtcbiAgICAgICAgcHNkLmNvbG9yTW9kZURhdGEgPSBjb2xvck1vZGVEYXRhLnBhcnNlKGZpbGVIZWxwZXIpO1xuICAgICAgICBwc2QuaW1hZ2VSZXNvdXJjZXMgPSBpbWFnZVJlc291cmNlcy5wYXJzZShmaWxlSGVscGVyKTtcbiAgICAgICAgdmFyIGxtaSA9IGxheWVyQW5kTWFza0luZm8ucGFyc2UoZmlsZUhlbHBlcik7XG4gICAgICAgIHBzZC5sYXllcnMgPSBsbWkubGF5ZXJzO1xuICAgICAgICBwc2QuZ2xvYmFsTGF5ZXJNYXNrSW5mbyA9IGxtaS5nbG9iYWxMYXllck1hc2tJbmZvO1xuICAgICAgICBwc2QuaW1hZ2VEYXRhID0gaW1hZ2VEYXRhLnBhcnNlKGZpbGVIZWxwZXIsIHBzZC53aWR0aCwgcHNkLmhlaWdodCwgcHNkLmNoYW5uZWxzKTtcbiAgICAgICAgcHNkLnRvQmFzZTY0ID0gaW1hZ2VIZWxwZXIudG9CYXNlNjQuYmluZCh7d2lkdGg6IHBzZC53aWR0aCwgaGVpZ2h0OiBwc2QuaGVpZ2h0LCBjaGFubmVsczogW1xuICAgICAgICAgICAge2lkOiAwLCBkYXRhOiBwc2QuaW1hZ2VEYXRhWzBdfSxcbiAgICAgICAgICAgIHtpZDogMSwgZGF0YTogcHNkLmltYWdlRGF0YVsxXX0sXG4gICAgICAgICAgICB7aWQ6IDIsIGRhdGE6IHBzZC5pbWFnZURhdGFbMl19LFxuICAgICAgICAgICAge2lkOi0xLCBkYXRhOiBwc2QuaW1hZ2VEYXRhWzNdfSxcbiAgICAgICAgXX0pO1xuICAgICAgICBwc2QudG9QbmcgPSBpbWFnZUhlbHBlci50b1BuZy5iaW5kKHt3aWR0aDogcHNkLndpZHRoLCBoZWlnaHQ6IHBzZC5oZWlnaHQsIHRvQmFzZTY0OiBwc2QudG9CYXNlNjR9KTtcblxuICAgICAgICByZXR1cm4gcHNkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VSUk9SOiBUaGUgcHJvdmlkZWQgZmlsZSBpcyBub3QgYSB2YWxpZCBQaG90b3Nob3AgZmlsZSEnKTtcbiAgICB9XG5cbiAgICByZXR1cm47XG59O1xuXG5leHBvcnRzLmNvbXBvc2UgPSBmdW5jdGlvbihwc2QsIG9wdGlvbnMpIHtcbiAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnMgfHwge291dHB1dDogJ2FycmF5QnVmZmVyJ307XG4gICAgdmFyIGZpbGVIZWxwZXIgPSBuZXcgRmlsZUhlbHBlcigpO1xuXG4gICAgZmlsZUhlbHBlci5jcmVhdGUoMCk7XG4gICAgaGVhZGVyLmNvbXBvc2UoZmlsZUhlbHBlciwgcHNkKTtcbiAgICBjb2xvck1vZGVEYXRhLmNvbXBvc2UoZmlsZUhlbHBlcik7XG4gICAgaW1hZ2VSZXNvdXJjZXMuY29tcG9zZShmaWxlSGVscGVyLCBwc2QpO1xuICAgIGxheWVyQW5kTWFza0luZm8uY29tcG9zZShmaWxlSGVscGVyLCBwc2QpO1xuICAgIGltYWdlRGF0YS5jb21wb3NlKGZpbGVIZWxwZXIsIHBzZCk7XG5cbiAgICBpZihvcHRpb25zLm91dHB1dCA9PT0gJ2Jsb2InKSB7XG4gICAgICAgIHJldHVybiBuZXcgQmxvYihbZmlsZUhlbHBlci5hcnJheUJ1ZmZlcl0sIHt0eXBlOiAnaW1hZ2Uvdm5kLmFkb2JlLnBob3Rvc2hvcCd9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmlsZUhlbHBlci5hcnJheUJ1ZmZlcjtcbiAgICB9XG59XG4iLCIvLyBQYWNrQml0cyBydW4tbGVuZ3RoIGRlY29kaW5nXG5leHBvcnRzLmRlY29kZSA9IGZ1bmN0aW9uKGVuY29kZWRBcnJheSkge1xuICAgIHZhciBkZWNvZGVkQXJyYXkgPSBbXTtcbiAgICB2YXIgaT0wO1xuXG4gICAgd2hpbGUgKGkgPCBlbmNvZGVkQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIHZhciBuID0gZW5jb2RlZEFycmF5W2ldO1xuICAgICAgICBpZihlbmNvZGVkQXJyYXlbaV0gPiAtMSkge1xuICAgICAgICAgICAgZm9yKHZhciBqPTA7IGo8bisxOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgZGVjb2RlZEFycmF5LnB1c2goZW5jb2RlZEFycmF5W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChlbmNvZGVkQXJyYXlbaV0gPiAtMTI4KSB7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBmb3IodmFyIGo9MDsgajwxLW47IGorKykge1xuICAgICAgICAgICAgICAgIGRlY29kZWRBcnJheS5wdXNoKGVuY29kZWRBcnJheVtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIHJldHVybiBVaW50OEFycmF5LmZyb20oZGVjb2RlZEFycmF5KTtcbn07XG4iXX0=
