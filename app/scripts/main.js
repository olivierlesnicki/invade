define(function(require) {

    'use strict';

    // Load the states
    var BootState = require('states/Boot');
    var LoadState = require('states/Load');
    var SelectTeamState = require('states/SelectTeam');
    var SelectShipState = require('states/SelectShip');
    var BattleState = require('states/Battle');
    var GameOverState = require('states/GameOver');

    var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'game');

    // Add the states to the game
    game.state.add('boot', BootState);
    game.state.add('load', LoadState);
    game.state.add('selectTeam', SelectTeamState);
    game.state.add('selectShip', SelectShipState);
    game.state.add('battle', BattleState);
    game.state.add('gameover', GameOverState);

    game.state.start('boot');

});
