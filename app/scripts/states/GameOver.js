define(function(require) {

    'use strict';

    var retina = require('utils/retina');
    var CONSTANT = require('utils/constants');

    var Text = require('entities/Text');

    var GameOver = function(game) {
        this.game = game;
    };

    GameOver.prototype = {

        create: function() {

            // add sounds
            var clickSound = this.game.add.audio('sound-menu');
            var music = this.game.add.audio('music-gameover');

            // add labels
            var gameOverText = new Text(this.game, this.game.world.centerX, this.game.world.centerY - 100, 'Game Over');
            var scoreLabelText = new Text(this.game, this.game.world.centerX, this.game.world.centerY - 15, 'Score');
            var scoreText = new Text(this.game, this.game.world.centerX, this.game.world.centerY + 15, window.localStorage.score);
            var retryText = new Text(this.game, this.game.world.centerX, this.game.world.centerY + 100, 'Retry?', true);

            music.play();

            this.music = music;
            this.clickSound = clickSound;

            // make label clickable
            retryText.onTouch(this.nextState, this);

        },

        /**
         * Return to the Select Ship state
         * @return {this}
         */
        nextState: function() {
            this.clickSound.play();
            this.music.stop();
            this.game.state.start(CONSTANT.STATE.SELECT_SHIP);
            return this;
        }

    };

    return GameOver;

});
