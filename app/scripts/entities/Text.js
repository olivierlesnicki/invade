define(function(require) {

    'use strict';

    var constants = require('utils/constants');

    /**
     * Add a star field to the background
     * @param {Object} game
     * @return {this}
     */
    var Text = function(game, x, y, text, isInputEnabled) {

        this.game = game;

        var text = this.game.add.text(x, y, text);
        text.anchor.setTo(0.5);
        text.font = 'Press Start 2P';
        text.fontSize = 20;
        text.fill = '#fff';
        text.inputEnabled = !! isInputEnabled;

        this.sprite = text;

        return this;

    };

    Text.prototype = {

        /**
         * Register click events
         * @param  {Function} callback
         * @param  {Object}   context
         * @return {this}
         */
        onTouch: function(callback, context) {
            this.sprite.events.onInputDown.add(callback, context);
            return this;
        },

        /**
         * Unsubscrive from click events
         * @param  {Function} callback
         * @param  {Object}   context
         * @return {this}
         */
        offTouch: function(callback, context) {
            this.sprite.events.onInputDown.remove(callback, context);
            return this;
        }

    };

    return Text;

});
