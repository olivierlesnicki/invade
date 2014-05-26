define(function(require) {

    'use strict';

    var constants = require('utils/constants');

    /**
     * [Ship description]
     * @param {[type]} game      [description]
     * @param {[type]} shipArray
     * @param {[type]} x         [description]
     * @param {[type]} y         [description]
     */
    var Ship = function(game, shipArray, x, y, isFlipped) {

        this.game = game; // keep a game reference

        this.explosionSound = this.game.add.audio('sound-explosion');
        this.laserSound = this.game.add.audio('sound-laser');

        this.isFlipped = !! this.isFlipped;

        if (shipArray) {
            this.shipArray = shipArray;
        } else {
            this.generate();
        }

        this.updateQueue = [];

        this.render(x, y);


    };

    Ship.prototype = {

        /**
         * Loop through each ship's pixel
         * and return the coordinates
         * @param  {Array}   shipArray
         * @param  {Function} callback
         * @param  {Object}   context
         * @return {this}
         */
        eachPixel: function(callback, context) {
            for (var x, y, i = 0; i < this.shipArray.length - 2; i++) {
                if (this.shipArray[i] === 1) {
                    x = (i % this.size);
                    y = Math.floor(i / this.size);
                    callback.call(context || this, x, y);
                }
            }
            return this;
        },

        generate: function() {

            var shipArray = [];

            var size = (2 * Math.round(Math.random() * 4) + 1);
            var midd = Math.floor(size / 2);

            for (var i = 0; i < size * size; i++) {

                var x = i % size;
                var y = Math.floor(i / size);

                if (x < midd) {
                    shipArray[i] = Math.random() > 0.5 ? 1 : 0;
                } else if (x === midd) {
                    shipArray[i] = Math.random() > 0.2 ? 1 : 0;
                } else if (x > midd) {

                    // apply axial symmetry
                    shipArray[i] = shipArray[i - 2 * (i - (midd + size * y))];

                }

            }

            shipArray.push(size);
            shipArray.push('green');

            this.shipArray = shipArray;

            return this;

        },

        /**
         * Create a new ship sprite
         * based on the existing shipArray
         * @param  {Number} x
         * @param  {Number} y
         * @return {this}
         */
        render: function(x, y) {

            this.size = this.shipArray[this.shipArray.length - 2];
            this.team = this.shipArray[this.shipArray.length - 1];

            // cache constants
            var SHIP_PIXEL_SIZE = constants.SHIP_PIXEL_SIZE;
            var bitmapSize = this.size * SHIP_PIXEL_SIZE;

            var bitmap = this.game.add.bitmapData(bitmapSize, bitmapSize);
            this.pixel = this.game.add.bitmapData(SHIP_PIXEL_SIZE, SHIP_PIXEL_SIZE);

            // pick correct
            // ship color
            switch (this.team) {

                case 'blue':
                    bitmap.context.fillStyle = this.pixel.context.fillStyle = constants.BLUE_COLOR_HEX;
                    break;

                case 'red':
                    bitmap.context.fillStyle = this.pixel.context.fillStyle = constants.RED_COLOR_HEX;
                    break;

                default:
                    bitmap.context.fillStyle = this.pixel.context.fillStyle = constants.GREEN_COLOR_HEX;
                    break;

            }

            this.pixel.context.fillRect(0, 0, SHIP_PIXEL_SIZE, SHIP_PIXEL_SIZE);

            // draw bitmap
            this.eachPixel(function(x, y) {
                bitmap.context.fillRect(x * SHIP_PIXEL_SIZE, y * SHIP_PIXEL_SIZE, SHIP_PIXEL_SIZE, SHIP_PIXEL_SIZE);
            });

            // render sprite
            this.sprite = this.game.add.sprite(x, y, bitmap);
            this.sprite.anchor.setTo(0.5, 0.5);

            if (this.isFlipped) {
                this.sprite.angle = 180;
            }

            return this;

        },

        /**
         * Unload the sprite
         * and animate explosion
         * @return {this}
         */
        explode: function() {

            // cache constants
            var SHIP_PIXEL_SIZE = constants.SHIP_PIXEL_SIZE;

            this.sprite.kill();

            // build explosion

            var explosion = this.game.add.group();
            var particleOffsetX = this.sprite.x - this.sprite.width / 2 + SHIP_PIXEL_SIZE / 2;
            var particleOffsetY = this.sprite.y - this.sprite.height / 2 + SHIP_PIXEL_SIZE / 2;
            var particleVelocityOffset = (this.size / 2) - 0.5;

            this.explosionSound.play();

            this.eachPixel(function(x, y) {

                var particle = explosion.create(x * SHIP_PIXEL_SIZE + particleOffsetX, y * SHIP_PIXEL_SIZE + particleOffsetY, this.pixel);
                particle.anchor.setTo(0.5, 0.5);
                particle.checkWorldBounds = true;

                this.game.physics.arcade.enable(particle);

                particle.body.angularVelocity = this.game.rnd.integerInRange(-720, 720);
                particle.body.velocity.x = -(x - particleVelocityOffset) * this.game.rnd.integerInRange(0, 200);
                particle.body.velocity.y = this.game.rnd.integerInRange(-200, 200);
                particle.body.acceleration.y = 200;
                particle.body.bounce.x = .8;
                particle.body.bounce.y = .8;

                particle.events.onOutOfBounds.add(this.killExplosionSprite, this);

                for (var i = 0; i < 4; i++) {

                    var poudre = explosion.create(x * SHIP_PIXEL_SIZE + particleOffsetX, y * SHIP_PIXEL_SIZE + particleOffsetY, this.pixel);
                    poudre.anchor.setTo(0.5, 0.5);
                    poudre.checkWorldBounds = true;

                    this.game.physics.arcade.enable(poudre);
                    poudre.scale.setTo(0.25);
                    poudre.body.angularVelocity = this.game.rnd.integerInRange(-720, 720);
                    poudre.body.velocity.x = this.game.rnd.integerInRange(-200, 200);
                    poudre.body.velocity.y = this.game.rnd.integerInRange(-200, 200);
                    poudre.body.acceleration.y = 200;
                    poudre.body.bounce.x = 1;
                    poudre.body.bounce.y = 1;

                    poudre.events.onOutOfBounds.add(this.killExplosionSprite, this);

                }

            }, this);

            this.explosion = explosion;

            return this;

        },

        update: function() {

            if (this.explosion) {
                this.game.physics.arcade.collide(this.explosion);
            }

        },

        tween: function() {
            return this.game.add.tween(this.sprite);
        },

        shoot: function() {

            this.laserSound.play();

            if (!this.startY) {
                this.startY = this.sprite.y;
            }

            // knockback
            this
                .tween()
                .to({
                    y: this.sprite.y + 10 * (this.isFlipped ? -1 : 1)
                }, 10, Phaser.Easing.Quadratic.Out, true)
                .to({
                    y: this.startY
                }, 500, Phaser.Easing.Quadratic.Out, true)

        },

        /**
         * Kill the sprite generated
         * by the explosion and remove
         * it from the group
         * @param  {Object} sprite
         * @return {this}
         */
        killExplosionSprite: function(sprite) {

            sprite.kill();
            this.explosion.remove(sprite);

            // if the explosion
            // is empty, completely
            // remove it
            if (!this.explosion.length) {
                this.explosion.destroy();
            }

            return this;

        },


        /**
         * Teardown the ship
         * @return {this}
         */
        kill: function() {

            this.sprite.kill();

            if (this.explosion) {
                this.explosion.destroy();
            }

            return this;

        }

    };

    return Ship;

});
