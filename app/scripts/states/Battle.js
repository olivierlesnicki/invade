define(function(require) {

    'use strict';

    var retina = require('utils/retina');
    var constants = require('utils/constants');
    var ShipEntity = require('entities/Ship');
    var StarField = require('entities/StarField');
    var socket = io.connect('http://localhost:1337');

    var Battle = function(game) {
        this.game = game;
    };

    Battle.prototype = {

        create: function() {

            var that = this;
            var shipArray = JSON.parse(window.localStorage.ship);
            var music = this.game.add.audio('music-battle');

            music.play();

            this.starField = new StarField(this.game);
            this.player = this.spawnPlayer(shipArray);
            this.fire = this.createFire();
            this.music = music;

            this.scout();

            socket.on('opponent', this.onOpponent.bind(this));
            socket.on('engage', this.onEngage.bind(this));
            socket.on('win', this.onWin.bind(this));
            socket.on('loose', this.onLoose.bind(this));

            window.localStorage.score = 0;

            this.game.input.onDown.add(this.shoot, this);

        },

        /**
         * Search for an opponent
         * on start or after a win
         */
        scout: function() {
            var shipArray = JSON.parse(window.localStorage.ship);
            socket.emit('scout', {
                ship: shipArray
            });
        },

        onOpponent: function(opponent) {
            this.opponent = this.spawnOpponent(opponent.ship);
            this.start();
        },

        onEngage: function() {
            this.engage();
        },

        onWin: function() {
            this.win();
        },

        onLoose: function(data) {
            window.localStorage.score = data.score;
            this.loose();
        },

        /**
         * Create a label that
         * notifies player
         * when to engage
         * @return {Object}
         */
        createFire: function() {

            var fire = this.game.add.text(this.game.world.centerX, this.game.world.centerY, "FIRE!");

            fire.anchor.setTo(0.5, 0.5);
            fire.scale.setTo(0.8, 0.8);
            fire.font = 'Press Start 2P';
            fire.fontSize = 20;
            fire.fill = '#fff';
            fire.alpha = 0;

            return fire;

        },

        /**
         * Render the player
         * and add him to the battle
         * @param  {Array} shipArray
         * @return {Object}
         */
        spawnPlayer: function(shipArray) {

            // create new player
            var player = new ShipEntity(this.game, shipArray, this.game.world.centerX, this.game.height);

            // animate player spawning
            player
                .tween()
                .to({
                    y: 0.8 * this.game.height
                }, 1000, Phaser.Easing.Quadratic.Out, true);

            return player;

        },

        /**
         * Render the opponent
         * and add him to the battle
         * @param  {Array} shipArray
         * @return {Object}
         */
        spawnOpponent: function(shipArray) {

            // create new opponent
            var opponent = new ShipEntity(this.game, shipArray, this.game.world.centerX, 0, true);

            // animate opponent spawning
            opponent
                .tween()
                .to({
                    y: 0.2 * this.game.height
                }, 1000, Phaser.Easing.Quadratic.Out, true);

            return opponent;

        },

        start: function() {
            this.started = true;
        },

        engage: function()  {

            this.engaged = true;

            // show the FIRE! callout

            this.game.add
                .tween(this.fire)
                .to({
                    alpha: 1
                }, 100, Phaser.Easing.Linear.None, true);

            this.game.add
                .tween(this.fire.scale)
                .to({
                    x: 1,
                    y: 1
                }, 100, Phaser.Easing.Linear.None, true);

        },

        /**
         * Register player fire
         * @return {this}
         */
        shoot: function() {

            if (!this.started) {

                socket.emit('abandon');

            } else {

                if (this.engaged) {

                    // hide the FIRE! callout

                    this.game.add
                        .tween(this.fire)
                        .to({
                            alpha: 0
                        }, 300, Phaser.Easing.Linear.None, true);

                    this.game.add
                        .tween(this.fire.scale)
                        .to({
                            x: 0.8,
                            y: 0.8
                        }, 300, Phaser.Easing.Linear.None, true);

                }

                socket.emit('shoot');

            }

            return this;

        },

        win: function() {

            this.started = false;
            this.engaged = false;

            // hide the FIRE! callout

            this.game.add
                .tween(this.fire)
                .to({
                    alpha: 0
                }, 300, Phaser.Easing.Linear.None, true);

            this.game.add
                .tween(this.fire.scale)
                .to({
                    x: 0.8,
                    y: 0.8
                }, 300, Phaser.Easing.Linear.None, true);

            this.player.shoot();
            this.opponent.explode();

            this.scout();

        },

        loose: function() {

            this.game.input.onDown.remove(this.shoot, this);

            if (this.opponent) {
                this.opponent.shoot();
            }

            this.music.stop();
            this.player.explode();

            this.game.time.events.add(1200, this.nextState, this);

        },

        nextState: function()  {

            socket.removeAllListeners();

            this.game.state.start('gameover');

        }

    };

    return Battle;

});
