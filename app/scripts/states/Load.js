define(function(require) {

    'use strict';

    var retina = require('utils/retina');

    var Load = function(game) {
        this.game = game;
    };

    Load.prototype = {

        /**
         * Display the loading screen
         * and load all game assets
         */
        preload: function() {

            var loadingText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, "Loading");
            loadingText.anchor.setTo(0.5);
            loadingText.font = 'Press Start 2P';
            loadingText.fontSize = 20;
            loadingText.fill = '#fff';

            // Load all game assets
            this.game.load.image('text-fire', retina.asset('assets/text-fire.png'));
            this.game.load.image('text-continue', retina.asset('assets/text-continue.png'));
            this.game.load.image('text-build-your-spaceship', retina.asset('assets/text-build-your-spaceship.png'));
            this.game.load.image('ship-block-empty', retina.asset('assets/ship-block-empty.png'));
            this.game.load.image('ship-block-blue', retina.asset('assets/ship-block-blue.png'));
            this.game.load.image('ship-block-red', retina.asset('assets/ship-block-red.png'));
            this.game.load.image('battle-star', retina.asset('assets/battle-star.png'));

            this.game.load.audio('music-battle', 'assets/music-battle.mp3');
            this.game.load.audio('music-gameover', 'assets/music-gameover.mp3');
            this.game.load.audio('music-menu', 'assets/music-menu.mp3');

            this.game.load.audio('sound-menu', 'assets/sound-menu.wav');
            this.game.load.audio('sound-explosion', 'assets/sound-explosion.mp3');
            this.game.load.audio('sound-laser', 'assets/sound-laser.mp3');

        },

        /**
         * Identify if the player
         * has already played the
         * game and launch the
         * appropriate state
         */
        create: function() {

            if (!window.localStorage.team) {
                this.game.state.start('selectTeam');
                return;
            }

            if (!window.localStorage.ship) {
                this.game.state.start('selectShip');
                return;
            }

            this.game.state.start('battle');

        }

    };

    return Load;

});
