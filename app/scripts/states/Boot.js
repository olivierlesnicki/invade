define(function(require) {

    'use strict';

    var retina = require('utils/retina');

    var Boot = function(game) {

        var that = this;

        //  The Google WebFont Loader will look for this object, so create it before loading the script.
        window.WebFontConfig = {

            //  'active' means all requested fonts have finished loading
            //  We set a 1 second delay before calling 'createText'.
            //  For some reason if we don't the browser cannot render the text the first time it's created.
            active: function() {
                that.game.time.events.add(Phaser.Timer.SECOND, function() {
                    that.textLoaded = true;
                    that.nextState();
                }, that);
            },

            //  The Google Fonts we want to load (specify as many as you like in the array)
            google: {
                families: ['Press Start 2P']
            }

        };


        this.game = game;

    };

    Boot.prototype = {

        preload: function() {
            this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        },

        create: function() {

            // Set game background
            this.game.stage.backgroundColor = '#222';
            this.game.physics.startSystem(Phaser.Physics.ARCADE);

            this.assetsLoaded = true;
            this.nextState();

        },

        nextState: function() {
            if (this.textLoaded && this.assetsLoaded) {
                // render loading screen
                this.game.state.start('load');
            }
        }

    };

    return Boot;

});
