var assert = require('assert');
var fs = require('fs');
var PSDLIB = require('../src/psdlib.js');



/*
############################################################
Parsing
############################################################
*/
var file = fs.readFileSync('./test/test.psd');
var arrayBuffer = new Uint8Array(file).buffer;
var parsedPsd = PSDLIB.parse(arrayBuffer);

describe('parsing', function() {
    describe('fileHeader', function() {
        it('should have four channels', function() {
            assert.equal(4, parsedPsd.channels);
        });

        it('should have dimensions of 454x340', function() {
            assert.equal(300, parsedPsd.width);
            assert.equal(200, parsedPsd.height);
        });

        it('should have a depth of 8 bit', function() {
            assert.equal(8, parsedPsd.depth);
        });

        it('should have a RGB colormode', function() {
            assert.equal('RGB', parsedPsd.colormode);
        });
    });

    describe('colorModeData', function() {
        it('should be an empty array', function() {
            assert.ok(parsedPsd.colorModeData.length === 0);
        });
    });

    describe('imageResources', function() {
        it('should return the correct binary data', function() {
            assert.deepEqual([0,72,0,0,0,1,0,2,0,72,0,0,0,1,0,2], parsedPsd.imageResources[2].data);
            assert.equal(1005, parsedPsd.imageResources[2].id);
            assert.equal('', parsedPsd.imageResources[2].name);
        });
    });

    describe('layers', function() {
        describe('layers[0]', function() {
            it('should have correct dimensions', function() {
                assert.equal(0, parsedPsd.layers[0].top);
                assert.equal(0, parsedPsd.layers[0].left);
                assert.equal(200, parsedPsd.layers[0].bottom);
                assert.equal(300, parsedPsd.layers[0].right);
                assert.equal(200, parsedPsd.layers[0].height);
                assert.equal(300, parsedPsd.layers[0].width);
            });

            it('should have four channels with correct length', function() {
                assert.equal(60000, parsedPsd.layers[0].channels[0].data.length);
                assert.equal(60000, parsedPsd.layers[0].channels[1].data.length);
                assert.equal(60000, parsedPsd.layers[0].channels[2].data.length);
                assert.equal(60000, parsedPsd.layers[0].channels[3].data.length);
            });

            it('should have full opacity', function() {
                assert.equal(255, parsedPsd.layers[0].opacity);
            });

            it('should have no clipping', function() {
                assert.equal(0, parsedPsd.layers[0].clipping);
            });

            it('should have correct flags set', function() {
                assert.deepEqual([0, 0, 0, 0, 1], parsedPsd.layers[0].flags);
            });

            it('should have correct blending ranges', function() {
                for(var i=0; i<10; i++) {
                    assert.deepEqual([0, 0, 255, 255], parsedPsd.layers[0].blendingRanges[i]);
                }
            });

            it('should have the name Layer 1', function() {
                assert.equal('Layer 1', parsedPsd.layers[0].name);
            });

            it('should log an error when exporting to png in node (see above)', function() {
                assert.equal(undefined, parsedPsd.layers[1].toPng());
            });
        });

        describe('layers[1]', function() {
            it('should have correct maskData', function() {
                assert.equal(0, parsedPsd.layers[1].maskData.top);
                assert.equal(0, parsedPsd.layers[1].maskData.left);
                assert.equal(200, parsedPsd.layers[1].maskData.bottom);
                assert.equal(300, parsedPsd.layers[1].maskData.right);
                assert.equal(200, parsedPsd.layers[1].maskData.height);
                assert.equal(300, parsedPsd.layers[1].maskData.width);
                assert.equal(255, parsedPsd.layers[1].maskData.defaultColor);
                assert.deepEqual([0, 0, 0, 0, 0], parsedPsd.layers[1].maskData.flags);
            });
        });

        describe('layers[3]', function() {
            it('should have correct additionalLayerInfo', function() {
                var info = parsedPsd.layers[3].additionalLayerInfo.find(function(element) {
                    return element.key == 'luni'
                });

                assert.equal('Läyer 3', info.data);
                assert.equal('Unicode layer name', info.name);
            });
        });
    });

    describe('globalLayerMaskInfo', function() {
        it('should be an empty object', function() {
            assert.equal(0, Object.keys(parsedPsd.globalLayerMaskInfo).length);
        });
    });

    describe('imageData', function() {
        it('should have four channels with correct length', function() {
            assert.equal(60000, parsedPsd.imageData[0].length);
            assert.equal(60000, parsedPsd.imageData[1].length);
            assert.equal(60000, parsedPsd.imageData[2].length);
            assert.equal(60000, parsedPsd.imageData[3].length);
        });
    });
});



/*
############################################################
Composing
############################################################
*/
var psd = {
    channels: 3,
    height: 10,
    width: 10,
    imageResources: [
        {id: 1034, data: new Uint8Array([1])},
    ],
    layers: [
        {
            top: 0,
            left: 0,
            bottom: 10,
            right: 10,
            channels: [
                {id: 0, data: new Uint8Array(100).fill(255)},
                {id: 1, data: new Uint8Array(100).fill(100)},
                {id: 2, data: new Uint8Array(100).fill(0)}
            ],
            name: "Layer 0",
            additionalLayerInfo: [
                {key: "luni", data: "Läyer 0"}
            ]
        }
    ]
};
var arrayBuffer = PSDLIB.compose(psd);
var composedPsd = PSDLIB.parse(arrayBuffer);

describe('composing', function() {
    describe('fileHeader', function() {
        it('should have three channels', function() {
            assert.equal(3, composedPsd.channels);
        });

        it('should have dimensions of 10x10', function() {
            assert.equal(10, composedPsd.width);
            assert.equal(10, composedPsd.height);
        });

        it('should have a depth of 8 bit', function() {
            assert.equal(8, composedPsd.depth);
        });

        it('should have a RGB colormode', function() {
            assert.equal('RGB', composedPsd.colormode);
        });
    });

    describe('colorModeData', function() {
        it('should be an empty array', function() {
            assert.ok(composedPsd.colorModeData.length === 0);
        });
    });

    describe('imageResources', function() {
        it('should return the correct binary data', function() {
            assert.deepEqual([1], composedPsd.imageResources[0].data);
            assert.equal(1034, composedPsd.imageResources[0].id);
            assert.equal('', composedPsd.imageResources[0].name);
        });
    });

    describe('layers', function() {
        describe('layers[0]', function() {
            it('should have correct dimensions', function() {
                assert.equal(0, composedPsd.layers[0].top);
                assert.equal(0, composedPsd.layers[0].left);
                assert.equal(10, composedPsd.layers[0].bottom);
                assert.equal(10, composedPsd.layers[0].right);
                assert.equal(10, composedPsd.layers[0].height);
                assert.equal(10, composedPsd.layers[0].width);
            });

            it('should have three channels with correct length', function() {
                assert.equal(100, composedPsd.layers[0].channels[0].data.length);
                assert.equal(100, composedPsd.layers[0].channels[1].data.length);
                assert.equal(100, composedPsd.layers[0].channels[2].data.length);
            });

            it('should have full opacity', function() {
                assert.equal(255, composedPsd.layers[0].opacity);
            });

            it('should have no clipping', function() {
                assert.equal(0, composedPsd.layers[0].clipping);
            });

            it('should have correct flags set', function() {
                assert.deepEqual([0, 0, 0, 0, 0], composedPsd.layers[0].flags);
            });

            it('should have correct blending ranges', function() {
                for(var i=0; i<8; i++) {
                    assert.deepEqual([0, 0, 255, 255], composedPsd.layers[0].blendingRanges[i]);
                }
            });

            it('should have the name Layer 0', function() {
                assert.equal('Layer 0', composedPsd.layers[0].name);
            });

            it('should have correct additionalLayerInfo', function() {
                assert.equal('luni', composedPsd.layers[0].additionalLayerInfo[0].key);
                assert.equal('Läyer 0', composedPsd.layers[0].additionalLayerInfo[0].data);
                assert.equal('Unicode layer name', composedPsd.layers[0].additionalLayerInfo[0].name);
            });
        });
    });

    describe('globalLayerMaskInfo', function() {
        it('should be an empty object', function() {
            assert.equal(0, Object.keys(composedPsd.globalLayerMaskInfo).length);
        });
    });
});
