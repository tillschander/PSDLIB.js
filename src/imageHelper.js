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
