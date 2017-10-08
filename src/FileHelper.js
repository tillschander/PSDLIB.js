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
