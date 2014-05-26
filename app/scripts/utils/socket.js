define(function(require) {

    'use strict';

    var socket = io.connect('http://localhost:1337');

    return socket;

});
