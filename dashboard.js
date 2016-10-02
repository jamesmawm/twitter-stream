#!/usr/bin/env node

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
var port = 8081;
server.listen(port);
console.log("Running on http://localhost:" + port);

var io  = SocketIO.listen(server);
io.set('log level', 0);

var twit = new Twitter({
    consumer_key:  'aaa',
    consumer_secret: 'bbb',
    access_token: 'ccc',
    access_token_secret: 'ddd',
});

var track_list = ['financial', 'markets', 'Singapore'];
var stream = twit.stream('statuses/filter', { track: track_list});

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
