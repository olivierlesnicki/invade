define(function(require) {

    'use strict';

    var retina = {};

    retina.asset = function(assetName) {

        if (window.devicePixelRatio && window.devicePixelRatio > 1) {
            assetName = assetName.replace('.png', '@2x.png');
        }

        return assetName;

    };

    retina.device = function(callback) {

        if (window.devicePixelRatio && window.devicePixelRatio > 1) {
            callback();
        }

    };

    return retina;

});
