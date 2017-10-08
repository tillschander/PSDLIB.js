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
