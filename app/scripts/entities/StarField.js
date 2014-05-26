define(function(require) {

    'use strict';

    var constants = require('utils/constants');

    /**
     * Add a star field to the background
     * @param {Object} game
     * @return {this}
     */
    var StarField = function(game) {

        this.game = game;

        var STAR_PIXEL_SIZE = constants.SHIP_PIXEL_SIZE * .8;

        // draw star
        var texture = this.game.add.bitmapData(STAR_PIXEL_SIZE, STAR_PIXEL_SIZE);
        texture.context.fillStyle = '#ffffff';
        texture.context.fillRect(0, 0, STAR_PIXEL_SIZE, STAR_PIXEL_SIZE);

        // add star emitter
        var emitter = this.game.add.emitter(this.game.world.centerX, 0, 200);
        emitter.alpha = 0.8;
        emitter.width = this.game.world.width;
        emitter.makeParticles(texture);
        emitter.minParticleScale = 0.2;
        emitter.maxParticleScale = 0.7;
        emitter.setXSpeed(0, 0);
        emitter.setYSpeed(100, 200);
        emitter.minRotation = 0;
        emitter.maxRotation = 0;
        emitter.gravity = 0;
        emitter.start(false, 7000, 100, 0);

        this.emitter = emitter;

        return this;

    };

    return StarField;

});
