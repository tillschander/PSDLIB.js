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
