var fs = require('fs');
var PSDLIB = require('../src/psdlib.js');

fs.readFile('../test/test.psd', function(err, file) {
    var buffer = new Uint8Array(file).buffer;
    var psd = PSDLIB.parse(buffer);

    console.log(psd);
});
