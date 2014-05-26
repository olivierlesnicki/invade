define(function(require) {

    'use strict';

    var retina = require('utils/retina');

    var SelectShip = function(game) {
        this.game = game;
    };

    SelectShip.prototype = {

        create: function() {

            // add sounds
            var clickSound = this.game.add.audio('sound-menu');
            var music = this.game.add.audio('music-menu');

            var buildYourSpaceshipText = this.game.add.sprite(this.game.width / 2, this.game.height / 2 - 104, 'text-build-your-spaceship');
            buildYourSpaceshipText.anchor.setTo(0.5, 1);

            // add continue button
            var continueText = this.game.add.sprite(this.game.width / 2, this.game.height / 2 + 144, 'text-continue');
            continueText.alpha = 0;
            continueText.anchor.setTo(0.5, 0);
            continueText.inputEnabled = true;
            continueText.events.onInputDown.add(this.save, this);

            this.ship = [];
            this.shipActiveBlocks = 0;

            var blocks = [];

            // render ship 
            // building grid
            for (var i = 0; i < 25; i++) {

                // set empty blocks
                this.ship[i] = 0;

                blocks[i] = this.game.add.sprite(this.game.width / 2 + 32 * (i % 5) - 64, this.game.height / 2 + Math.floor(i / 5) * 32 - 44, 'ship-block-empty');
                blocks[i].i = i;
                blocks[i].anchor.setTo(0.5, 0.5);

                blocks[i].inputEnabled = true;
                blocks[i].events.onInputDown.add(this.build, this);

            }

            retina.device(function() {
                buildYourSpaceshipText.scale.setTo(0.5, 0.5);
                continueText.scale.setTo(0.5, 0.5);
                for (var i = 0; i < 25; i++) {
                    blocks[i].scale.setTo(0.5, 0.5);
                }
            });

            music.play();

            this.clickSound = clickSound;
            this.music = music;

            // expose variables
            this.continueText = continueText;

        },

        /**
         * Toggle the clicked block, update
         * ship data and show the continue
         * button if the ship consists of at
         * least 1 block
         * @param  {Object} block
         */
        build: function(block)  {

            this.clickSound.play();

            if (this.ship[block.i]) {

                this.ship[block.i] = 0;
                block.loadTexture('ship-block-empty');

                this.shipActiveBlocks--;

                // reveal continue button
                if (this.shipActiveBlocks === 0) {
                    this.game.add.tween(this.continueText).to({
                        alpha: 0
                    }, 300, Phaser.Easing.Quadratic.Out, true);
                }

            } else {

                this.ship[block.i] = 1;
                block.loadTexture('ship-block-' + window.localStorage.team);

                this.shipActiveBlocks++;

                // hide continue button
                if (this.shipActiveBlocks === 1) {
                    this.game.add.tween(this.continueText).to({
                        alpha: 1
                    }, 300, Phaser.Easing.Quadratic.In, true);
                }

            }

        },

        /**
         * Save the current ship
         * design and progress
         * to next screen
         */
        save: function() {

            if (this.shipActiveBlocks) {

                this.music.stop();

                var savedShip = this.ship;
                savedShip.push(Math.sqrt(this.ship.length));
                savedShip.push(window.localStorage.team);

                // store the ship
                window.localStorage.ship = JSON.stringify(savedShip);

                // show battle screen
                this.game.state.start('battle');

            }

        }


    };

    return SelectShip;

});
