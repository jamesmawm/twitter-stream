#!/usr/bin/env node

require('dotenv').config();

var Express = require('express');
var Http = require('http');
var Twitter = require('twit');
var SocketIO = require('socket.io');

var app = Express();
app.use(Express.static(__dirname + '/public'));

// Routes
app.get('/', function(req, res, next){
  res.render('/public/index.html');
});

var server = Http.createServer(app);
server.listen(process.env.LISTEN_PORT, process.env.LISTEN_HOST);
console.log("Running on http://" + process.env.LISTEN_HOST + ":" + process.env.LISTEN_PORT);

var io  = SocketIO.listen(server);
io.set('log level', 0);

var twit = new Twitter({
    consumer_key:  process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

var track_list = process.env.TRACK_LIST.split(',').map(function (word) {
    return word.trim();
});
var stream = twit.stream('statuses/filter', { track: track_list });

io.sockets.on('connection', function(socket){
    console.log('io.sockets.on connection');

    socket.on('data', function(action,data){
        if(action==='*') {
            twit.updateStatus(data, function (err, data){

            });
        }
    });

    socket.on('getfilter', function() {
        socket.emit('pushfilter', track_list);
    });


    stream.on('tweet', function(tweet) {
        socket.emit('message', JSON.stringify(tweet));
    });

    stream.on('error', function(err){
        console.log("Err: " + err);
    });

    socket.on('disconnect', function() {
      console.log('Disconnect.');
  });
});
