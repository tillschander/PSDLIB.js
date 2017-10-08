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
