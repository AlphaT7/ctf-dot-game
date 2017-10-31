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

/*
    users = {
        username: socket.id,
        username: socket.id
    }
    
    games = {
        'gameroom-name': {
            stepcounter: 0,
            gamestate: [],
            goals: [],
            flags: [],
            goalboundries: [],
            gamelive: false,
            dots1: [],
            dots2: [],
            socket.id:
                playername: 'player1 name',
                host: 'true'
            socket.id:
                playername: 'player2 name',
                host: 'false'
            playercount: '1-2'
        }
    }
*/

app.use(express.static('public'));

app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/public' + '/index.html');
});

io.on('connection', (socket) => {
    console.log('client connected');

    var methods = {

        moveFlagRunners1: function(gamename) {
    
            var gd = games[gamename].dots1;
            var g = games[gamename];
    
            for (var dot in gd) {
                if (gd[dot].dottype == 'flagrunner' && gd[dot].live == true) {
    
                    var x = gd[dot].x,
                        y = gd[dot].y,
                        moveFlag = false,
                        velX = 0,
                        velY = 0,
                        thrust = 1;
    
                    var targetaquired = x == g.flags[0].x && y == g.flags[0].y;
                    var targetoffset = x - 7 == g.flags[0].x && y - 7 == g.flags[0].y;
    
                    if (targetaquired || targetoffset) {
                        var target = {
                            x: g.goals[1].x,
                            y: g.goals[1].y,
                        }
                        gd[dot].r = 12;
                        moveFlag = true;
    
                    }
                    else {
                        var target = {
                            x: g.flags[0].x,
                            y: g.flags[0].y
                        }
                    }
    
                    var tx = target.x - x,
                        ty = target.y - y,
                        dist = Math.sqrt(tx * tx + ty * ty);
                    //  rad = Math.atan2(ty,tx),
                    //  angle = rad/Math.PI * 180;
    
                    velX = (tx / dist) * thrust;
                    velY = (ty / dist) * thrust;
    
                    var testX = target.x - (gd[dot].x + velX);
                    var testY = target.y - (gd[dot].y + velY);
    
                    // some math to ensure no 'bouncing' once the circle reaches the target...     
                    if (testX / velX > 1) {
                        gd[dot].x += velX;
                    }
                    else if (testX / velX < 1) {
                        gd[dot].x = target.x;
                    }
    
                    // some math to ensure no 'bouncing' once the circle reaches the target...     
                    if (testY / velY > 1) {
                        gd[dot].y += velY;
                    }
                    else if (testY / velY < 1) {
                        gd[dot].y = target.y;
                    }
                    // if the 'moveFlag' variable has been set to 'true', then move the flag position equal to the circle position
                    // this must be done ***after*** the circle position has been updated
                    if (moveFlag) {
                        g.flags[0].x = gd[dot].x - 7;
                        g.flags[0].y = gd[dot].y - 7;
                    }
                }
            }
        },
        /*
            moveFlagRunners2: function() {
    
                var mved = main.variables.edots;
                var mv = main.variables;
    
                for (var dot in mved) {
                    if (mved[dot].dottype == 'flagrunner' && mved[dot].live == true) {
    
                        var x = mved[dot].x,
                            y = mved[dot].y,
                            moveFlag = false,
                            velX = 0,
                            velY = 0,
                            thrust = 3;
    
                        var targetaquired = x == mv.flags[1].x && y == mv.flags[1].y;
                        var targetoffset = x - 7 == mv.flags[1].x && y - 7 == mv.flags[1].y;
    
                        if (targetaquired || targetoffset) {
                            var target = {
                                x: mv.goals[0].x,
                                y: mv.goals[0].y,
                            }
                            mved[dot].r = 12;
                            moveFlag = true;
    
                        }
                        else {
                            var target = {
                                x: mv.flags[1].x,
                                y: mv.flags[1].y
                            }
                        }
    
                        var tx = target.x - x,
                            ty = target.y - y,
                            dist = Math.sqrt(tx * tx + ty * ty);
                        //  rad = Math.atan2(ty,tx),
                        //  angle = rad/Math.PI * 180;
    
                        velX = (tx / dist) * thrust;
                        velY = (ty / dist) * thrust;
    
                        var testX = target.x - (mved[dot].x + velX);
                        var testY = target.y - (mved[dot].y + velY);
    
                        // some math to ensure no 'bouncing' once the circle reaches the target...     
                        if (testX / velX > 1) {
                            mved[dot].x += velX;
                        }
                        else if (testX / velX < 1) {
                            mved[dot].x = target.x;
                        }
    
                        // some math to ensure no 'bouncing' once the circle reaches the target...     
                        if (testY / velY > 1) {
                            mved[dot].y += velY;
                        }
                        else if (testY / velY < 1) {
                            mved[dot].y = target.y;
                        }
                        // if the 'moveFlag' variable has been set to 'true', then move the flag position equal to the circle position
                        // this must be done ***after*** the circle position has been updated
                        if (moveFlag) {
                            mv.flags[1].x = mved[dot].x - 7;
                            mv.flags[1].y = mved[dot].y - 7;
                        }
    
                    }
                }
            },
    
            moveAttackers1: function() {
    
                var mm = main.methods;
                var mvd = main.variables.dots;
                var mved = main.variables.edots;
    
                var targetarray = [];
                var attackers = [];
    
                for (var dot in mvd) {
                    if (mvd[dot].dottype == 'attacker' && mvd[dot].live == true) {
                        attackers.push(mvd[dot]);
                    }
                }
    
                for (var dot in mved) {
                    if (mved[dot].live == true) {
                        targetarray.push(mved[dot]);
                    }
                }
    
                if (targetarray.length > 0) {
                    for (var i = 0; i < attackers.length; i++) {
                        var element = attackers[i];
                        var t = mm.nearestTarget(element, targetarray);
                        move(element, t.target);
                    }
                }
    
                function move(element, t) {
                    var x = element.x,
                        y = element.y,
                        velX = 0,
                        velY = 0,
                        thrust = 2;
    
                    var tx = t.x - x,
                        ty = t.y - y,
                        dist = Math.sqrt(tx * tx + ty * ty);
    
                    velX = (tx / dist) * thrust;
                    velY = (ty / dist) * thrust;
    
                    element.x += velX;
                    element.y += velY;
                }
            },
    
            moveAttackers2: function() {
    
                var mm = main.methods;
                var mvd = main.variables.dots;
                var mved = main.variables.edots;
    
                var targetarray = [];
                var eattackers = [];
    
                for (var dot in mved) {
                    if (mved[dot].dottype == 'attacker' && mved[dot].live == true) {
                        eattackers.push(mved[dot]);
                    }
                }
    
                for (var dot in mvd) {
                    if (mvd[dot].live == true) {
                        targetarray.push(mvd[dot]);
                    }
                }
    
                if (targetarray.length > 0) {
                    for (var i = 0; i < eattackers.length; i++) {
                        var element = eattackers[i];
                        var t = mm.nearestTarget(element, targetarray);
                        move(element, t.target);
                    }
                }
    
                function move(element, t) {
                    var x = element.x,
                        y = element.y,
                        velX = 0,
                        velY = 0,
                        thrust = 2;
    
                    var tx = t.x - x,
                        ty = t.y - y,
                        dist = Math.sqrt(tx * tx + ty * ty);
    
                    velX = (tx / dist) * thrust;
                    velY = (ty / dist) * thrust;
    
                    element.x += velX;
                    element.y += velY;
                }
            },
        */
        nearestTarget: function(element, arr) {
    
            var distance = [];
            for (var i = 0; i < arr.length; i++) {
                distance.push(Math.sqrt(Math.pow((element.x - (arr[i].x)), 2) + Math.pow((element.y - (arr[i].y)), 2)));
            }
    
            var arraymin = Math.min.apply(Math, distance);
            var target = arr[distance.indexOf(arraymin)];
            var data = {
                target: target,
                index: distance.indexOf(arraymin)
            };
            return data;
        },
        /*
                    checkCollision: function(circ1, circ2) {
    
                        // Mathmatic Equation to Detect Colision
                        // distance = sqrt( (y2 - y1)² + (x2 - x1)² ) 
                        // if distance < r1 + r2, then INTERSECTION HAS OCCURED
    
                        var distance = Math.sqrt(Math.pow(((circ2.x) - circ1.x), 2) + Math.pow(((circ2.y) - circ1.y), 2));
                        if (distance <= 50) {
                            main.methods.drawLine(circ1.x, circ1.y, circ2.x, circ2.y)
                        }
                        var test = distance < circ1.rad + circ2.rad;
                        return test;
                    },
        */
        
        gameOver: function (playerarray) {
            return false;
        },
        
        gameroomcleanup: function (data, socket) {
            if (data.oldgamename != undefined) {
                //games[data.oldgamename].gameover = true;
                delete games[data.oldgamename][socket.id];
                socket.broadcast.to(data.oldgamename).emit('message', 'Your opponent has left the game.');
                socket.leave(data.oldgamename);
            }
        },
        
        init: function(gamename) {
    
            var g = games[gamename];
            var m = methods;
    
            // set flag coordinates
            g.flags[0].x = g.goals[0].x;
            g.flags[0].y = g.goals[0].y;
            g.flags[1].x = g.goals[1].x;
            g.flags[1].y = g.goals[1].y;
    
            // set goal boundry coordinates and main.variables.colors
    
            g.goalboundries[0].x = 120;
            g.goalboundries[0].y = 0;
            g.goalboundries[0].w = 160;
            g.goalboundries[0].h = 80;
    
            g.goalboundries[1].x = 120;
            g.goalboundries[1].y = 320;
            g.goalboundries[1].w = 160;
            g.goalboundries[1].h = 80;
    
        },
    
        step: function(gamename) {
    
            var m = methods;
    
            for (var gamename in games) {
                if (games[gamename].gamelive == true) {
    
                    var g = games[gamename].gamestate;
    
                    //m.moveAttackers1(gamename);
                    m.moveFlagRunners1(gamename);
                    //m.moveAttackers2(gamename);
                    //m.moveFlagRunners2(gamename);
    
                    g[g.length] = {
                        stepcounter: games[gamename].stepcounter,
                        timestamp: new Date(),
                        dots1: JSON.parse(JSON.stringify(games[gamename].dots1)),
                        dots2: JSON.parse(JSON.stringify(games[gamename].dots2)),
                        flags: JSON.parse(JSON.stringify(games[gamename].flags)),
                    };
    
                    // keep the main.gamestate array at a length of 200
                    // this way the array doesn't expand into infinity
                    if (g.length > 200) { g.splice(0, 1); }

                    if (games[gamename].stepinterval >= 600) {
                        io.in(gamename).emit('gamestatus', g[g.length-1]);
                        //socket.broadcast.to(gamename).emit('gamestatus', g[g.length-1]);
                        //io.in('game').emit('message', 'cool game');
                        games[gamename].stepinterval = 0;
                    }
    
                    if (games[gamename].gamelive == true) {
                        games[gamename].stepcounter++;
                        games[gamename].stepinterval++;
                    }
                }
            }
    
            setTimeout(function(gamename) {
                setImmediate(function(gamename) { m.step(gamename) });
            }, 16.67);
        }
    };

    var c = (d) => { console.log(d) },
        ct = (d) => { console.log(JSON.stringify(d)) },
        gameroom = '';
        
    // MEASURE NETWORK LATENCY BETWEEN THE CLIENT AND THE SERVER
    socket.on('client2server', function() {
        socket.emit('server2client');
    });

    // USER FUNCTIONS...

    //socket.id;
    //socket.adapter.rooms;
    //var rooms = io.sockets.adapter.rooms;

    // Check if each room is full
    // If it isn't, then broadcast the updated object of opengames to the new player
    if (Object.keys(games).length !== 0) {
        var opengames = {};
        for (var gamename in games) {
            //var obj2 = JSON.parse(JSON.stringify(obj1));
            if (games[gamename].playercount < 2) {
                opengames[gamename] = JSON.parse(JSON.stringify(games[gamename]));
            }
        }

        socket.emit('addgamefirstload', opengames);
    }

    socket.on('createuser', function(data) {
        var name = data;
        if (users.hasOwnProperty(name)) {
            socket.emit('message', 'This user name is already in use.');
        }
        else {
            users[name] = socket.id;
            socket.emit('create_user', name);
        }
    });

    socket.on('creategame', function(data) {
        if (games.hasOwnProperty(data.gamename)) {
            socket.emit('message', 'This name is already in use.')
        }
        else {
            methods.gameroomcleanup(data, socket);
            io.emit('removegame', data.oldgamename);
            socket.join(data.gamename, function() {
                games[data.gamename] = {
                    'stepinterval': 0,
                    'stepcounter': 0,
                    'gamestate': [],
                    'goals': data.goals,
                    'flags': data.flags,
                    'goalboundries': data.goalboundries,
                    'dropboundry': data.dropboundry,
                    'gamelive': false,
                    'dots1': {
                        d1: {
                            x: '',
                            y: '',
                            r: '',
                            n: 1,
                            dottype: '',
                            live: false
                        },
                        d2: {
                            x: '',
                            y: '',
                            r: '',
                            n: 2,
                            dottype: '',
                            live: false
                        },
                        d3: {
                            x: '',
                            y: '',
                            r: '',
                            n: 3,
                            dottype: '',
                            live: false
                        },
                        d4: {
                            x: '',
                            y: '',
                            r: '',
                            n: 4,
                            dottype: '',
                            live: false
                        },
                        d5: {
                            x: '',
                            y: '',
                            r: '',
                            n: 5,
                            dottype: '',
                            live: false
                        },
                        d6: {
                            x: '',
                            y: '',
                            r: '',
                            n: 6,
                            dottype: '',
                            live: false
                        },
                        d7: {
                            x: '',
                            y: '',
                            r: '',
                            n: 7,
                            dottype: '',
                            live: false
                        },
                        d8: {
                            x: '',
                            y: '',
                            r: '',
                            n: 8,
                            dottype: '',
                            live: false
                        },
                        d9: {
                            x: '',
                            y: '',
                            r: '',
                            n: 9,
                            dottype: '',
                            live: false
                        },
                        d10: {
                            x: '',
                            y: '',
                            r: '',
                            n: 10,
                            dottype: '',
                            live: false
                        }
                    },
                    'dots2': {
                        d1: {
                            x: '',
                            y: '',
                            r: '',
                            n: 1,
                            dottype: '',
                            live: false
                        },
                        d2: {
                            x: '',
                            y: '',
                            r: '',
                            n: 2,
                            dottype: '',
                            live: false
                        },
                        d3: {
                            x: '',
                            y: '',
                            r: '',
                            n: 3,
                            dottype: '',
                            live: false
                        },
                        d4: {
                            x: '',
                            y: '',
                            r: '',
                            n: 4,
                            dottype: '',
                            live: false
                        },
                        d5: {
                            x: '',
                            y: '',
                            r: '',
                            n: 5,
                            dottype: '',
                            live: false
                        },
                        d6: {
                            x: '',
                            y: '',
                            r: '',
                            n: 6,
                            dottype: '',
                            live: false
                        },
                        d7: {
                            x: '',
                            y: '',
                            r: '',
                            n: 7,
                            dottype: '',
                            live: false
                        },
                        d8: {
                            x: '',
                            y: '',
                            r: '',
                            n: 8,
                            dottype: '',
                            live: false
                        },
                        d9: {
                            x: '',
                            y: '',
                            r: '',
                            n: 9,
                            dottype: '',
                            live: false
                        },
                        d10: {
                            x: '',
                            y: '',
                            r: '',
                            n: 10,
                            dottype: '',
                            live: false
                        }
                    },
                    [socket.id]: {
                        'playername': data.username,
                        'host': true
                    },
                    'playercount': 1
                };
                socket.emit('joingame', data.gamename);
                socket.broadcast.emit('addgame', data.gamename);
            });
        }
    });

    /*
        users = {
            username: socket.id,
            username: socket.id
        }
        
        games = {
            'gameroom-name': {
                stepcounter: 0,
                gamestate: [],
                goals: [],
                flags: [],
                goalboundries: [],
                gamelive: false,
                dots1: [],
                dots2: [],
                socket.id:
                    playername: 'player1 name',
                    host: 'true'
                socket.id:
                    playername: 'player2 name',
                    host: 'false'
                playercount: '1-2'
            }
        }
    */

    socket.on('joingame', function(data) {

        if (games[data.gamename].playercount < 2) {
            methods.gameroomcleanup(data, socket);
            socket.join(data.gamename, function() {
                games[data.gamename][socket.id] = { 'playername': data.username, 'host': false }
                games[data.gamename].gamelive = true;
                games[data.gamename].playercount++;
                io.emit('removegame', data.gamename);
                socket.emit('joingame', data.gamename);
                setTimeout(function() { socket.broadcast.to(data.gamename).emit('opponentname', data.username) }, 375);
            });
        }
        else {
            socket.emit('message', 'This game room is full.');
        }

    });

    socket.on('serveropponentname', function(data) {
        socket.broadcast.to(data.gamename).emit('opponentname2', data.username);
        methods.step();
    });

    socket.on('error', function(err) {
        console.log(err);
    });

    socket.on('disconnect', function() {

        for (var user in users) {
            if (users[user] == socket.id) {
                delete users[user];
                break;
            }
        }

        for (var gamename in games) {
            if (socket.adapter.rooms.hasOwnProperty(gamename) != true) {
                // if it doesn't exist, then delete it from the games object and update the gameslist select/options
                delete games[gamename];
                io.emit('removegame', gamename);
            }

            for (var gameproperty in games[gamename]) {
                if (gameproperty.toString() == socket.id.toString()) {
                    socket.broadcast.to(gamename).emit('message', 'Your opponent has left the game. Game Over.');
                    break;
                }
            }
        }
        console.log('client disconnected')
    });

    // GAME FUNCTIONS...

    socket.on('circle', function(data, gameroom, host) {
        // if host, store to dots1
        // else store to dots2
        if (host == true) {
            for (var dot in games[gameroom].dots1) {
                if (games[gameroom].dots1[dot].n === data.n) {
                    games[gameroom].dots1[dot].x = data.x;
                    games[gameroom].dots1[dot].y = data.y;
                    games[gameroom].dots1[dot].r = data.r;
                    games[gameroom].dots1[dot].dottype = data.dottype;
                    games[gameroom].dots1[dot].live = data.live;
                }
            }
            socket.broadcast.to(gameroom).emit('circle', data);
        } else {
            for (var dot in games[gameroom].dots2) {
                if (games[gameroom].dots1[dot].n === data.n) {
                    games[gameroom].dots1[dot].x = data.x;
                    games[gameroom].dots1[dot].y = data.y;
                    games[gameroom].dots1[dot].r = data.r;
                    games[gameroom].dots1[dot].dottype = data.dottype;
                    games[gameroom].dots1[dot].live = data.live;
                }
            }
            socket.broadcast.to(gameroom).emit('circle', data);
        }
    });

});

server.listen(PORT);