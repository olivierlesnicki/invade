var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var Backbone = require('backbone');

var Player = Backbone.Model.extend({});

var Players = Backbone.Collection.extend({

    /**
     * Return the player's opponent
     * @param  {Player} player
     * @return {Player}
     */
    opponentOf: function(player) {
        return this.find(function(opponent) {
            return player.id !== opponent.id;
        })
    }

});

var Room = Backbone.Model.extend({

    initialize: function() {

        var players = new Players;
        this.set('players', players);

        players.on('add', this.playerAdded, this);

    },

    /**
     * Notify each player of its
     * opponent and start countdown
     * to engagement
     * @return {this}
     */
    start: function() {

        var that = this;

        this.set('started', true);
        this.set('engaged', false);

        var delay = 3000;

        var players = this.get('players');

        var player = players.first();
        var opponent = players.last();

        // notify players
        // of opponents
        player.trigger('opponent', opponent);
        opponent.trigger('opponent', player);

        this.set('timeout', setTimeout(function() {
            that.engage();
        }, delay));

        return this;

    },

    /**
     * Notify each player
     * its time to engage
     * @return {this}
     */
    engage: function() {

        var date = new Date();
        var now = date.getTime();

        // only engage if the battle
        // has been started
        if (this.get('started')) {

            clearTimeout(this.get('timeout'));

            this.set('engagedTime', now);

            this.set('engaged', true);

            // notify each player to
            // engage its opponent
            var players = this.get('players');
            players.each(function(player) {
                player.trigger('engage');
            });

        }

        return this;

    },

    /**
     * Notify each player
     * of the battle outcome and
     * reset necessary variables
     * @return {this}
     */
    end: function() {

        var players;

        // only end if the battle
        // has been started
        if (this.get('started')) {

            clearTimeout(this.get('timeout'));

            this.set('started', false);
            this.set('engaged', false);

            this.removeAll();

        }

        return this;

    },

    shoot: function(player) {

        var date = new Date();
        var now = date.getTime();

        var players = this.get('players');

        // get the opponent
        var opponent = players.find(function(opponent) {
            return player.id !== opponent.id;
        });

        var started = this.get('started');
        var engaged = this.get('engaged');

        // creates an
        // automatic loss
        // if the battle
        // hasn't been
        // engaged
        if (started && !engaged) {

            // cancel engagement
            clearTimeout(this.get('timeout'));

            opponent.trigger('win');
            player.trigger('loose');

            this.end();

        }

        // otherwise the player
        // must be the first to be
        // shooting (since game
        // is not over already)
        if (started && engaged) {

            player.trigger('win');
            opponent.trigger('loose');

            this.end();

        }

        return this;

    },

    removeAll: function() {

        // remove all players
        // from the room
        var players = this.get('players');

        players.each(function(player) {

            player.unset('room');

            player.off('abandon', this.forfait);
            player.off('shoot', this.shoot);

        }, this);

        return this;

    },

    forfait: function(player) {

        player.trigger('loose');

        if (this.get('started')) {

            clearTimeout(this.get('timeout'));

            this.set('started', false);
            this.set('engaged', false);

        }

        // notify the opponent
        // of his win (to start scouting)
        var opponent = this.get('players').opponentOf(player);
        if (opponent) {
            opponent.trigger('win');
        }

        this.removeAll();

        return this;

    },

    /**
     * Check if enough players have
     * joined the room to start a battle
     * @param  {Player} player
     */
    playerAdded: function(player) {

        player.set('room', this);

        player.on('abandon', this.forfait, this);
        player.on('shoot', this.shoot, this);

        if (this.get('players').length === 2) {
            this.start();
        }

    }

});

var Rooms = Backbone.Collection.extend({

    model: Room,

    /**
     * Find a room, or create a new room
     * and make the player join it
     * @param  {Player} player
     * @return {this}
     */
    pair: function(player) {

        // Find a room that
        // has an opponent
        var room = this.find(function(room) {

            var opponent;
            var opponents = room.get('players');

            if (opponents.length === 1) {
                opponent = opponents.at(0);
                return opponent.get('team') !== player.get('team') && opponent.id !== player.id;
            } else {
                return false;
            }

        });

        // Otherwise find
        // and empty room
        if (!room) {
            room = this.find(function(room) {
                var opponents = room.get('players');
                return room.get('players').length === 0;
            });
        }

        // Otherwise create
        // a new room
        if (!room) {
            room = new Room();
            this.add(room);
        }

        // add player to the room
        room.get('players').add(player);

        return this;

    }


});

var rooms = new Rooms;

io.sockets.on('connection', function(socket) {

    var player = new Player({
        id: socket.id
    });
    player.set('score', 0);

    /**
     * Player is searching
     * for an opponent
     */
    socket.on('scout', function(data) {

        var ship = data.ship;

        player.set('ship', ship);
        player.set('team', ship[ship.length - 1]);

        if (!player.get('room')) {
            rooms.pair(player);
        }

    });

    /**
     * Player has disconnected
     * from the game
     */
    socket.on('disconnect', function() {
        console.log('disconnect')
        player.trigger('abandon', player);
    });

    /**
     * Player has killed himself
     * before finding an opponent
     */
    socket.on('abandon', function() {
        player.trigger('abandon', player);
    });

    /**
     * Player has pressed
     * screen to shoot
     */
    socket.on('shoot', function() {
        player.trigger('shoot', player);
    })

    /**
     * Notify the player of
     * his opponent
     */
    player.on('opponent', function(opponent) {
        socket.emit('opponent', {
            ship: opponent.get('ship')
        });
    });

    /**
     * Notify the player it is
     * time to shoot
     */
    player.on('engage', function() {
        socket.emit('engage');
    });

    /**
     * Notify the player
     * he won
     */
    player.on('win', function() {
        var score = player.get('score');
        score = score ? score + 1 : 0;
        player.set('score', score);
        socket.emit('win');
    });

    /**
     * Notify the player
     * he lost
     */
    player.on('loose', function() {
        socket.emit('loose', {
            score: player.get('score')
        });
    });

});

server.listen(1337);
