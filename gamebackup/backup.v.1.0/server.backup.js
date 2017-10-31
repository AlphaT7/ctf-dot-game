// https://gist.github.com/crtr0/2896891 --> Socket.IO Rooms Example
// io.emit --> broadcast to everyone
// socket.emit --> broadcast to just the sender

/*
// sending to sender-client only
socket.emit('message', "this is a test");

// sending to all clients, include sender
io.emit('message', "this is a test");

// sending to all clients except sender
socket.broadcast.emit('message', "this is a test");

// sending to all clients in 'game' room(channel) except sender
socket.broadcast.to('game').emit('message', 'nice game');

// sending to all clients in 'game' room(channel), include sender
io.in('game').emit('message', 'cool game');

// sending to sender client, only if they are in 'game' room(channel)
socket.to('game').emit('message', 'enjoy the game');

// sending to all clients in namespace 'myNamespace', include sender
io.of('myNamespace').emit('message', 'gg');

// sending to individual socketid
socket.broadcast.to(socketid).emit('message', 'for your eyes only');
*/

var express = require('express');
var PORT = process.env.PORT || 3000;
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var users = {};
var games = {};

function isEven(n) { return n % 2 == 0; }

function gameOver(playerarray){
  return false;
}

function gameroomcleanup(data, socket){
  if(data.oldgamename != undefined){
    games[data.oldgamename].gameover = true;
    delete games[data.oldgamename][socket.id];
    socket.broadcast.to(data.oldgamename).emit('message', 'Your opponent has left the game.');
    socket.leave(data.oldgamename);
  }
}

app.use(express.static('public'));

app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/public' + '/index.html');
});

io.on('connection', (socket) => {
  console.log('client connected');
  
  //socket.id;
  //socket.adapter.rooms;
  //var rooms = io.sockets.adapter.rooms;

// Check if each room is full
// If it isn't, then broadcast the updated object of opengames to the new player
  if(Object.keys(games).length !== 0){
    var opengames = {};
    for(var gamename in games){
      //var obj2 = JSON.parse(JSON.stringify(obj1));
      if(games[gamename].playercount < 2){
        opengames[gamename] = JSON.parse(JSON.stringify(games[gamename]));
      }
    }
    
    socket.emit('addgamefirstload', opengames);
  }

/*
  games = {
    'gameroom-name': {
      gameover: false,
      socket.id: [], // player1 moves
      socket.id: [], // player2 moves
      usedmoves: [],
      player1: 'player1 name',
      player2: 'player2 name',
      playerturn: 1-9,
      playercount: '1-2'
    }
  }
*/

  socket.on('createuser', function(data){
    var name = data;
    if(users.hasOwnProperty(name)){
      socket.emit('message','This user name is already in use.');
    } else {
      users[name] = socket.id;
      socket.emit('create_user', name);
    }
  });


  socket.on('creategame', function(data){
    if(games.hasOwnProperty(data.gamename)){
      socket.emit('message', 'This name is already in use.')
    } else {
      gameroomcleanup(data, socket);
      io.emit('removegame',data.oldgamename);
      socket.join(data.gamename, function() {
        games[data.gamename] = {'playercount': 1, 'playerturn': 1, [socket.id]: [], 'player1': data.username, 'usedmoves': [], 'gameover': false};
        socket.emit('joingame',data.gamename);
        socket.broadcast.emit('addgame', data.gamename);
      });
    }
  });
  
  socket.on('joingame', function(data) {
    
    if(games[data.gamename].playercount < 2){
        gameroomcleanup(data, socket);
        socket.join(data.gamename, function() {
          games[data.gamename][socket.id] = [];
          games[data.gamename].player2 = data.username;
          games[data.gamename].playercount ++;
          socket.emit('message', 'You have joined the ' + data.gamename + ' game room.');
          io.emit('removegame',data.gamename);
          socket.emit('joingame',data.gamename);
          setTimeout(function(){socket.broadcast.to(data.gamename).emit('opponentname', data.username)},375);
          io.in(data.gamename).emit('playerturn', 1);
      });      
    } else {
      socket.emit('message', 'This game room is full.');
    }
    
  });
  
  socket.on('serveropponentname', function(data){
    socket.broadcast.to(data.gamename).emit('opponentname2', data.username);
  });

  socket.on('error', function(err) {
    console.log(err);
  });

  socket.on('disconnect', function() {
    
    for (var user in users){
      if (users[user] == socket.id){
        delete users[user];
        break;
      }
    }
    
    for (var gamename in games){
      if(socket.adapter.rooms.hasOwnProperty(gamename) != true){
        // if it doesn't exist, then delete it from the games object and update the gameslist select/options
        delete games[gamename];
        io.emit('removegame',gamename);
      }
      
      for (var gameproperty in games[gamename]){
        if (gameproperty.toString() == socket.id.toString()){
          socket.broadcast.to(gamename).emit('message', 'Your opponent has left the game. Game Over.');
          break;
        }
      }
    }
    console.log('client disconnected')
  });

});

setInterval(() => io.emit('time', new Date().toTimeString().slice(0, -11)), 1000);

server.listen(PORT);