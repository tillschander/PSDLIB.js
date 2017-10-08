# PSDLIB.js
A library for parsing and composing Photoshop Documents with JavaScript.

## Installation
The code in the src directory can be used with node.js as is. Just include it in your project.
```javascript
require('src/psdlib.js')
```

To use the library in a browser all you have to do is include the file from the dist folder.
```html
<script src="dist/psdlib.min.js"></script>
```
Make sure that the path is correct in either case.

## Usage
Parsing is very simple:
```javascript
var psd = PSDLIB.parse(arrayBuffer);

console.log(psd.width);
body.appendChild(psd.layers[i].toPng());
```
The object returned after parsing is very similar to the native structure of PSDs which are described in [Adobes specification](http://www.adobe.com/devnet-apps/photoshop/fileformatashtml/).
Unsupported data is returned as Uint8Arrays so you can still use it.

Composing is almost as simple as parsing:
```javascript
var psd = {
    channels: 3,
    height: 10,
    width: 10,
    depth: 8, // optional
    colormode: "RGB", // optional
    imageResources: [ // optional
        {id: 1034, data: new Uint8Array([1])},
    ],
    layers: [ // optional
        {
            top: 0,
            left: 0,
            bottom: 10,
            right: 10,
            channels: [
                {id:-2, data: new Uint8Array(36).fill(255)}, // optional
                {id:-1, data: new Uint8Array(100).fill(255)}, // optional
                {id: 0, data: new Uint8Array(100).fill(255)},
                {id: 1, data: new Uint8Array(100).fill(100)},
                {id: 2, data: new Uint8Array(100).fill(0)}
            ],
            blendMode: "normal", // optional, see blendModes.js for all possible values
            opacity: 255, // optional
            clipping: 0, // optional
            flags: [0, 0, 0, 0, 0], // optional
            maskData: { // optional if no channel with id -2 or -3 is present
                top: 4,
                left: 4,
                bottom: 10,
                right: 10,
                defaultColor: 255, // optional
                flags: [0, 0, 0, 0, 0] // optional
            },
            blendingRanges: [ // optional
                [0, 0, 255, 255], [0, 0, 255, 255], [0, 0, 255, 255], [0, 0, 255, 255], [0, 0, 255, 255],
                [0, 0, 255, 255], [0, 0, 255, 255], [0, 0, 255, 255], [0, 0, 255, 255], [0, 0, 255, 255]
            ],
            name: "Layer 0",
            additionalLayerInfo: [ // optional
                {key: "luni", data: "Läyer 0"},
                {key: "lyid", data: 0}
            ]
        }
    ],
    imageData: [ // optional
        new Uint8Array(100).fill(255),
        new Uint8Array(100).fill(100),
        new Uint8Array(100).fill(0)
    ]
};
// compose() returns an arrayBuffer if no second parameter is present
var blob = PSDLIB.compose(psd, {output: 'blob'});
```
To see all options you can set have a look at examples/browser-compose.html or the object you get by parsing a PSD.
Warning: The library expects you to give sensible inputs when composing PSDs. It does not check for illogical combinations like an 8 Bit Bitmap.

## Examples
The examples folder contains some working examples for both node.js and the browser.

## Limitations
Currently only 8 Bit RGB Documents are supported.
Most of the Image Resources and some of the additional layer information are only returned as Uint8Arrays. So if you need data from theses sections you will have to parse it yourself.
Take a look into `src/additionalLayerInfoTypes.js` to see which Additional Layer Info Sections get parsed.
PNG export of layers and the final image is currently only possible in browsers. To export PNGs in node.js you have to use an additional library like [pngjs](https://www.npmjs.com/package/pngjs/). Editing existing files can be tricky. Be wary that you might have to edit the image resources of that file after you've made changes to it's structure.

## Building
If you have made contributions to the sourcecode in `src/` you might want to build it (you might also want to share those contributions so others can enjoy them aswell). Building is only required for the browser version of this library as the source is valid JavaScript that runs as is in node.js. [Browserify](http://browserify.org/) is used to build the library for browsers. So make sure to install it and other dependencies by running the following in your terminal:
```
npm install
```
After that all you need is one command to build the library:
```
npm run build
```
Alternatively you can run the following command to build automatically after each change:
```
npm run watch
```

## Tests
This library uses [Mocha](https://mochajs.org) as its test framework.
So before running the tests make sure you have Mocha installed by running the following in the directory of the library:
```
npm install
```
After that all you have to do is enter the following command:
```
npm run test
```

## Author
Till Schander

## Licence
This library is released under the [MIT Licence](http://www.opensource.org/licenses/MIT).
