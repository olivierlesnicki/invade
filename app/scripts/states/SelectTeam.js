define(function(require) {

    'use strict';

    var constants = require('utils/constants');

    var SelectTeam = function(game) {
        this.game = game;
    };

    SelectTeam.prototype = {

        create: function() {

            var selectTeamText = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 10, "Select\nTeam");
            selectTeamText.anchor.setTo(0.5, 1);
            selectTeamText.font = 'Press Start 2P';
            selectTeamText.fontSize = 20;
            selectTeamText.fill = '#fff';
            selectTeamText.lineSpacing = 10;
            selectTeamText.align = 'center';

            var redText = this.game.add.text(this.game.world.centerX - 50, this.game.world.centerY + 20, "FEU");
            redText.anchor.setTo(0.5, 0);
            redText.font = 'Press Start 2P';
            redText.fontSize = 20;
            redText.fill = constants.RED_COLOR_HEX;
            redText.lineSpacing = 10;
            redText.align = 'center';

            var blueText = this.game.add.text(this.game.world.centerX + 50, this.game.world.centerY + 20, "EAU");
            blueText.anchor.setTo(0.5, 0);
            blueText.font = 'Press Start 2P';
            blueText.fontSize = 20;
            blueText.fill = constants.BLUE_COLOR_HEX;
            blueText.lineSpacing = 10;
            blueText.align = 'center';

            redText.inputEnabled = true;
            redText.events.onInputDown.add(this.selectRed, this);

            blueText.inputEnabled = true;
            blueText.events.onInputDown.add(this.selectBlue, this);

        },

        selectRed: function() {
            window.localStorage.team = 'red';
            this.game.state.start('selectShip');
        },

        selectBlue: function() {
            window.localStorage.team = 'blue';
            this.game.state.start('selectShip');
        }


    };

    return SelectTeam;

});
