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
