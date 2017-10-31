/* global $ io Image */

window.onload = function() {

    var socket = io(),
        a = (d) => { alert(d) },
        c = (d) => { console.log(d) },
        ct = (d) => { console.log(JSON.stringify(d)) };

    // declare all the main variables and functions

    var main = {

        variables: {
            colors: {
                st_red: 'rgba(255, 37, 0, 0.25)' /*semi-transparent red*/ ,
                clear: 'rgba(255, 255, 255, 0)' /*transparent white*/ ,
                red: 'red',
                blue: '#3498DB',
                orange: '#F39C12',
                green: '#27AE60',
                st_blue: 'rgba(0, 120, 255, .25)',
                st_green: 'rgba(17, 222, 27, .25)',
                shadow: 'rgba(0,0,0,.75)',
                purple: 'rgba(151, 17, 222, .25)'
            }, // end of main.variables.colors object        
            canvas: document.getElementById("myCanvas"),
            ctx: document.getElementById("myCanvas").getContext("2d"),
            goals: [{
                x: 200,
                y: 10
            }, {
                x: 200,
                y: 370
            }],
            totaldots: 0,
            sprites: {},
            flags: [{
                src: 'img/waving-flag-red.png',
                x: '',
                y: ''
            }, {
                src: 'img/waving-flag-blue.png',
                x: '',
                y: ''
            }],
            attackers: [],
            flagrunners: [],
            eattackers: [],
            eflagrunners: [],
            goalboundries: [{
                x: '',
                y: '',
                w: '',
                h: '',
                c: ''
            }, {
                x: '',
                y: '',
                w: '',
                h: '',
                c: ''
            }],
            dropboundry: {
                x: '',
                y: '',
                w: '',
                h: ''
            },
            mouse: {
                x: '0',
                y: '201'
            },
            gamelive: 0,
            username: '', // index.html var
            gameroom: '', // index.html var
            el: document.getElementById('server-time'), // index.html var
            setupflag: 0 // userevents.js var

        },

        methods: {
            isEven: function(n) {
                return n % 2 == 0;
            },

            message: function(text) {
                $('#message').html(text);
                setTimeout(function() {
                    $('#message').html('');
                }, 3000);
            },

            drawFlags: function() {
                main.variables.ctx.drawImage(main.variables.sprites.playerflag, main.variables.flags[1].x, main.variables.flags[1].y);
                main.variables.ctx.drawImage(main.variables.sprites.enemyflag, main.variables.flags[0].x, main.variables.flags[0].y);
            },

            drawPlayerBoundry: function() {
                main.variables.ctx.save();
                main.variables.ctx.translate(0, 0);
                main.variables.ctx.beginPath();
                main.variables.ctx.rect(main.variables.dropboundry.x, main.variables.dropboundry.y, main.variables.dropboundry.w, main.variables.dropboundry.h);

                // check if we hover it, fill red, if not make it transparent
                main.variables.ctx.fillStyle = main.variables.ctx.isPointInPath(main.variables.mouse.x, main.variables.mouse.y) ? main.variables.colors.st_red : main.variables.colors.clear;
                main.variables.ctx.fill();
                main.variables.ctx.restore();
            },

            drawGoalBoundries: function() {

                main.variables.goalboundries.forEach(function(element, index, array) {

                    main.variables.ctx.shadowColor = main.variables.colors.shadow;
                    main.variables.ctx.shadowBlur = 20;

                    if (index == 0) {
                        main.variables.ctx.shadowOffsetY = 2;
                        main.variables.ctx.shadowOffsetX = 2;

                    }
                    else {
                        main.variables.ctx.shadowOffsetY = -2;
                        main.variables.ctx.shadowOffsetX = -2;
                    }

                    main.variables.ctx.fillStyle = element.c;
                    main.variables.ctx.fillRect(element.x, element.y, element.w, element.h);

                    if (main.variables.attackers.length > 0 && index == 0) {
                        for (let i = 0; i < main.variables.attackers.length; i++) {
                            var test = RectCircleColliding(main.variables.attackers[i], element) == true;
                            if (test) {
                                main.variables.ctx.strokeStyle = main.variables.colors.red;
                                main.variables.ctx.strokeRect(element.x, element.y, element.w, element.h);
                                main.variables.attackers.splice(i, 1);
                                main.variables.totaldots--;
                                $('#attackercount').html('Attackers: ' + main.variables.attackers.length);
                            }
                        }
                    }

                    if (main.variables.eattackers.length > 0 && index == 0) {
                        for (let i = 0; i < main.variables.eattackers.length; i++) {
                            var test = RectCircleColliding(main.variables.eattackers[i], element) == true;
                            if (test) {
                                main.variables.ctx.strokeStyle = main.variables.colors.red;
                                main.variables.ctx.strokeRect(element.x, element.y, element.w, element.h);
                                main.variables.eattackers.splice(i, 1);
                            }
                        }
                    }

                    if (main.variables.attackers.length > 0 && index == 1) {
                        for (let i = 0; i < main.variables.attackers.length; i++) {
                            var test = RectCircleColliding(main.variables.attackers[i], element) == true;

                            if (test) {
                                main.variables.ctx.strokeStyle = main.variables.colors.red;
                                main.variables.ctx.strokeRect(element.x, element.y, element.w, element.h);
                                main.variables.attackers.splice(i, 1);
                                main.variables.totaldots--;
                                $('#attackercount').html('Attackers: ' + main.variables.attackers.length);
                            }
                        }
                    }

                    if (main.variables.eattackers.length > 0 && index == 1) {
                        for (let i = 0; i < main.variables.eattackers.length; i++) {
                            var test = RectCircleColliding(main.variables.eattackers[i], element) == true;

                            if (test) {
                                main.variables.ctx.strokeStyle = main.variables.colors.red;
                                main.variables.ctx.strokeRect(element.x, element.y, element.w, element.h);
                                main.variables.eattackers.splice(i, 1);
                            }
                        }
                    }

                });

                function RectCircleColliding(circle, rect) {
                    // return true if the rectangle and circle are colliding
                    var distX = Math.abs(circle.x - rect.x - rect.w / 2);
                    var distY = Math.abs(circle.y - rect.y - rect.h / 2);

                    if (distX > (rect.w / 2 + circle.r)) {
                        return false;
                    }
                    if (distY > (rect.h / 2 + circle.r)) {
                        return false;
                    }
                    /*               
                              if (distX <= (rect.w/2)) { return true; } 
                              if (distY <= (rect.h/2)) { return true; }
                    */
                    if (distX <= (rect.w / 2) && distY <= (rect.h / 2)) {
                        return true;
                    }

                    var dx = distX - rect.w / 2;
                    var dy = distY - rect.h / 2;
                    return (dx * dx + dy * dy <= (circle.r * circle.r));
                }

            },

            drawNewCircle: function(x, y, r, color, dottype) {
                main.variables.ctx.fillStyle = color;
                main.variables.ctx.beginPath();
                main.variables.ctx.arc(x, y, r, 0, 2 * Math.PI);
                main.variables.ctx.stroke();
                main.variables.ctx.fill();

                switch (dottype) {
                    case 'attackers':
                        main.variables.attackers.push({
                            'x': x,
                            'y': y,
                            'rad': r
                        });
                        break;
                    case 'flagrunners':
                        main.variables.flagrunners.push({
                            'x': x,
                            'y': y,
                            'rad': r
                        });
                        break;
                }

                var circle = {
                    x: x,
                    y: y,
                    r: r,
                    dottype: dottype
                };

                socket.emit('circle', circle, main.variables.gameroom);
            },

            drawNewEnemyCircle: function(x, y, r, dottype) {
                switch (dottype) { // have to off-set x & y to make it a mirror image from the opponents viewpoint...
                    case 'attackers':
                        main.variables.eattackers.push({
                            'x': (400 - x),
                            'y': (400 - y),
                            'rad': r
                        });
                        var color = main.variables.colors.red;
                        break;
                    case 'flagrunners':
                        main.variables.eflagrunners.push({
                            'x': (400 - x),
                            'y': (400 - y),
                            'rad': r
                        });
                        var color = main.variables.colors.orange;
                        break;
                }

                main.variables.ctx.fillStyle = color;
                main.variables.ctx.beginPath();
                main.variables.ctx.arc((400 - x), (400 - y), r, 0, 2 * Math.PI);
                main.variables.ctx.stroke();
                main.variables.ctx.fill();
            },

            drawCircle: function(x, y, r, color) {
                main.variables.ctx.fillStyle = color;
                main.variables.ctx.beginPath();
                main.variables.ctx.arc(x, y, r, 0, 2 * Math.PI);
                main.variables.ctx.fill();
            },

            drawLine: function(x1, y1, x2, y2) {
                main.variables.ctx.beginPath();
                main.variables.ctx.moveTo(x1, y1);
                main.variables.ctx.lineTo(x2, y2);
                main.variables.ctx.stroke();
            },

            moveFlagRunners: function() {

                if (main.variables.flagrunners.length != 0) {
                    main.variables.flagrunners.forEach(function(element, index, array) {

                        var x = element.x,
                            y = element.y,
                            moveFlag = false,
                            velX = 0,
                            velY = 0,
                            thrust = 3;

                        var targetaquired = x == main.variables.flags[0].x && y == main.variables.flags[0].y;
                        var targetoffset = x - 7 == main.variables.flags[0].x && y - 7 == main.variables.flags[0].y;

                        if (targetaquired || targetoffset) {
                            var target = {
                                x: main.variables.goals[1].x,
                                y: main.variables.goals[1].y,
                            }
                            element.rad = 12;
                            moveFlag = true;

                        }
                        else {
                            var target = {
                                x: main.variables.flags[0].x,
                                y: main.variables.flags[0].y
                            }
                        }

                        var tx = target.x - x,
                            ty = target.y - y,
                            dist = Math.sqrt(tx * tx + ty * ty);
                        //                     rad = Math.atan2(ty,tx),
                        //                     angle = rad/Math.PI * 180;

                        velX = (tx / dist) * thrust;
                        velY = (ty / dist) * thrust;

                        var testX = target.x - (element.x + velX);
                        var testY = target.y - (element.y + velY);

                        // some math to ensure no 'bouncing' once the circle reaches the target...     
                        if (testX / velX > 1) {
                            element.x += velX;
                        }
                        else if (testX / velX < 1) {
                            element.x = target.x;
                        }

                        // some math to ensure no 'bouncing' once the circle reaches the target...     
                        if (testY / velY > 1) {
                            element.y += velY;
                        }
                        else if (testY / velY < 1) {
                            element.y = target.y;
                        }
                        // if the 'moveFlag' variable has been set to 'true', then move the flag position equal to the circle position
                        // this must be done ***after*** the circle position has been updated
                        if (moveFlag) {
                            main.variables.flags[0].x = element.x - 7;
                            main.variables.flags[0].y = element.y - 7;
                        }

                    });
                }
            },

            moveEFlagRunners: function() {

                if (main.variables.eflagrunners.length != 0) {
                    main.variables.eflagrunners.forEach(function(element, index, array) {

                        var x = element.x,
                            y = element.y,
                            moveFlag = false,
                            velX = 0,
                            velY = 0,
                            thrust = 3;

                        var targetaquired = x == main.variables.flags[1].x && y == main.variables.flags[1].y;
                        var targetoffset = x - 7 == main.variables.flags[1].x && y - 7 == main.variables.flags[1].y;

                        if (targetaquired || targetoffset) {
                            var target = {
                                x: main.variables.goals[0].x,
                                y: main.variables.goals[0].y,
                            }
                            element.rad = 12;
                            moveFlag = true;

                        }
                        else {
                            var target = {
                                x: main.variables.flags[1].x,
                                y: main.variables.flags[1].y
                            }
                        }

                        var tx = target.x - x,
                            ty = target.y - y,
                            dist = Math.sqrt(tx * tx + ty * ty);
                        //                     rad = Math.atan2(ty,tx),
                        //                     angle = rad/Math.PI * 180;

                        velX = (tx / dist) * thrust;
                        velY = (ty / dist) * thrust;

                        var testX = target.x - (element.x + velX);
                        var testY = target.y - (element.y + velY);

                        // some math to ensure no 'bouncing' once the circle reaches the target...     
                        if (testX / velX > 1) {
                            element.x += velX;
                        }
                        else if (testX / velX < 1) {
                            element.x = target.x;
                        }

                        // some math to ensure no 'bouncing' once the circle reaches the target...     
                        if (testY / velY > 1) {
                            element.y += velY;
                        }
                        else if (testY / velY < 1) {
                            element.y = target.y;
                        }
                        // if the 'moveFlag' variable has been set to 'true', then move the flag position equal to the circle position
                        if (moveFlag) {
                            main.variables.flags[1].x = element.x - 7;
                            main.variables.flags[1].y = element.y - 7;
                        }

                    });
                }

            },

            moveAttackers: function() {

                var targetarray = [];
                targetarray[0] = '';
                targetarray[1] = '';

                if (main.variables.attackers.length != 0 && main.variables.eattackers.concat(main.variables.eflagrunners).length != 0) {
                    //main.variables.attackers.forEach(function(element, index, array) {
                    for (let index = 0; index < main.variables.attackers.length; index++) {
                        let element = main.variables.attackers[index];

                        // first check if there's any collisions between attackers and eattackers 
                        if (main.variables.eattackers.length > 0) {
                            targetarray[0] = main.methods.nearestTarget(element, main.variables.eattackers);
                            if (main.methods.checkCollision(element, targetarray[0].target) == true) {
                                main.variables.attackers.splice(index, 1);
                                main.variables.eattackers.splice(targetarray[0].index, 1);
                                main.variables.totaldots--;
                                $('#attackercount').html('Attackers: ' + main.variables.attackers.length);
                                continue;
                            }
                        }

                        // if the above do not collide, check for collisions between attackers and eflagrunners
                        if (main.variables.eflagrunners.length > 0) {
                            targetarray[1] = main.methods.nearestTarget(element, main.variables.eflagrunners);
                            if (main.methods.checkCollision(element, targetarray[1].target) == true) {
                                main.variables.eflagrunners.splice(targetarray[1].index, 1);
                                main.variables.attackers.splice(index, 1);
                                main.variables.totaldots--;
                                $('#attackercount').html('Attackers: ' + main.variables.attackers.length);
                                continue;
                            }
                        }

                        // otherwise, find out which is nearest, eattackers or flag runners;
                        // then move the attacker to whichever one is closer;
                        var condition1 = targetarray[0] != '' && targetarray[1] == '';
                        var condition2 = targetarray[0] == '' && targetarray[1] != '';
                        var condition3 = targetarray[0] != '' && targetarray[1] != '';

                        if (condition1 == true) {
                            var t = targetarray[0].target;
                            move(element, t);
                        }
                        else if (condition2 == true) {
                            var t = targetarray[1].target;
                            move(element, t);
                        }
                        else if (condition3 == true) {
                            var t = main.methods.nearestTarget(element, [targetarray[0].target, targetarray[1].target]);
                            move(element, t.target);
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

                    }
                }
            },

            moveEAttackers: function() {

                var targetarray = [];
                targetarray[0] = '';
                targetarray[1] = '';

                if (main.variables.eattackers.length != 0 && main.variables.attackers.concat(main.variables.flagrunners).length != 0) {
                    for (let index = 0; index < main.variables.eattackers.length; index++) {
                        let element = main.variables.eattackers[index];

                        if (main.variables.attackers.length > 0) {
                            targetarray[0] = main.methods.nearestTarget(element, main.variables.attackers);
                            if (main.methods.checkCollision(element, targetarray[0].target) == true) {
                                main.variables.attackers.splice(targetarray[0].index, 1);
                                main.variables.eattackers.splice(index, 1);
                                main.variables.totaldots--;
                                $('#attackercount').html('Attackers: ' + main.variables.attackers.length);
                                continue;
                            }
                        }

                        if (main.variables.flagrunners.length > 0) {
                            targetarray[1] = main.methods.nearestTarget(element, main.variables.flagrunners);
                            if (main.methods.checkCollision(element, targetarray[1].target) == true) {
                                main.variables.flagrunners.splice(targetarray[1].index, 1);
                                main.variables.eattackers.splice(index, 1);
                                main.variables.totaldots--;
                                $('#flagrunnercount').html('Flagrunners: ' + main.variables.flagrunners.length);
                                continue;
                            }
                        }

                        var condition1 = targetarray[0] != '' && targetarray[1] == '';
                        var condition2 = targetarray[0] == '' && targetarray[1] != '';
                        var condition3 = targetarray[0] != '' && targetarray[1] != '';

                        if (condition1 == true) {
                            var t = targetarray[0].target;
                            move(element, t);
                        }
                        else if (condition2 == true) {
                            var t = targetarray[1].target;
                            move(element, t);
                        }
                        else if (condition3 == true) {
                            var t = main.methods.nearestTarget(element, [targetarray[0].target, targetarray[1].target]);
                            move(element, t.target);
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

                    }
                }
            },

            nearestTarget: function(element, arr) {

                var distance = [];
                for (let i = 0; i < arr.length; i++) {
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

            init: function() {

                var m = main.variables;

                m.sprites.playerflag = new Image();
                m.sprites.playerflag.src = main.variables.flags[1].src;

                m.sprites.enemyflag = new Image();
                m.sprites.enemyflag.src = main.variables.flags[0].src;

                // set flag coordinates
                m.flags[0].x = m.goals[0].x;
                m.flags[0].y = m.goals[0].y;
                m.flags[1].x = m.goals[1].x;
                m.flags[1].y = m.goals[1].y;

                // set goal boundry coordinates and main.variables.colors

                m.goalboundries[0].x = 120;
                m.goalboundries[0].y = 0;
                m.goalboundries[0].w = 160;
                m.goalboundries[0].h = 80;
                m.goalboundries[0].c = main.variables.colors.st_green;

                m.goalboundries[1].x = 120;
                m.goalboundries[1].y = 320;
                m.goalboundries[1].w = 160;
                m.goalboundries[1].h = 80;
                m.goalboundries[1].c = main.variables.colors.st_blue;

                // set drop boundry coordinates and main.variables.colors

                m.dropboundry.x = 0;
                m.dropboundry.y = 0;
                m.dropboundry.w = 400;
                m.dropboundry.h = 200;

            },

            step: function() {

                if (main.variables.flagrunners.length != 0) {
                    main.methods.moveFlagRunners()
                    //hamsters.run(ctf, ctf.main.methods.moveFlagRunners(), ctf.main.methods.test2(), 1, true);
                }
                if (main.variables.attackers.length != 0) {
                    main.methods.moveAttackers()
                    //hamsters.run(ctf, ctf.main.methods.moveAttackers(), ctf.main.methods.test2(), 1, true);
                }
                if (main.variables.eflagrunners.length != 0) {
                    main.methods.moveEFlagRunners()
                    //hamsters.run(ctf, ctf.main.methods.moveEFlagRunners(), ctf.main.methods.test2(), 1, true);
                }
                if (main.variables.eattackers.length != 0) {
                    main.methods.moveEAttackers()
                    //hamsters.run(ctf, ctf.main.methods.moveEAttackers(), ctf.main.methods.test2(), 1, true);
                }

                main.variables.ctx.clearRect(0, 0, 400, 400);
                main.methods.drawPlayerBoundry();

                main.variables.ctx.save();
                main.variables.ctx.translate(0, 0);
                main.methods.drawGoalBoundries();

                main.variables.attackers.forEach(function(element, index, array) {
                    main.methods.drawCircle(main.variables.attackers[index].x, main.variables.attackers[index].y, 7, main.variables.colors.blue);
                });
                main.variables.eattackers.forEach(function(element, index, array) {
                    main.methods.drawCircle(main.variables.eattackers[index].x, main.variables.eattackers[index].y, 7, main.variables.colors.red);
                });
                main.variables.flagrunners.forEach(function(element, index, array) {
                    main.methods.drawCircle(main.variables.flagrunners[index].x, main.variables.flagrunners[index].y, element.rad, main.variables.colors.green);
                });
                main.variables.eflagrunners.forEach(function(element, index, array) {
                    main.methods.drawCircle(main.variables.eflagrunners[index].x, main.variables.eflagrunners[index].y, element.rad, main.variables.colors.orange);
                });

                main.methods.drawFlags();
                main.variables.ctx.restore();
                window.requestAnimationFrame(main.methods.step);
            }

        }
    }

    // socket event functions

    var startTime;

    setInterval(function() {
        startTime = Date.now();
        socket.emit('client');
        console.log(startTime)
    }, 2000);

    socket.on('return', function() {
        let latency = Date.now() - startTime;
        console.log(Date.now())
        console.log(latency + '-latency');
    });

    socket.on('time', function(timeString) {
        main.variables.el.innerHTML = 'Server time: ' + timeString;
    });

    socket.on('create_user', function(data) {
        main.variables.username = $('#username').val();
        $('#createuser_wrapper').css('display', 'none');
        $('#uid_info').html('User Name: ' + main.variables.username);
    });

    socket.on('addgame', function(data) {
        $('#gamelist').html($('#gamelist').html() + '<option value="' + data + '">' + data + '</option>');
    });

    socket.on('addgamefirstload', function(data) {
        for (var key in data) {
            $('#gamelist').html($('#gamelist').html() + '<option value="' + key + '">' + key + '</option>');
        }
    });

    socket.on('removegame', function(data) {
        $('#gamelist option[value="' + data + '"]').remove();
    });

    socket.on('joingame', function(data) {
        main.variables.gameroom = data;
        $('#gname_info').html('Game Name: ' + main.variables.gameroom);
    });

    socket.on('message', function(data) {
        alert(data);
    });

    socket.on('opponentname', function(data) {
        $('#oname_info').html('Game Opponent: ' + data);
        socket.emit('serveropponentname', { 'gamename': main.variables.gameroom, 'username': main.variables.username });
        if (main.variables.setupflag == 1) {
            $('#handlebar').trigger('click');
        }
        $('#gamestatus').html('Game Status: <span class="neongreen_txt">Live</span>');
        main.variables.gamelive = 1;
    });

    socket.on('opponentname2', function(data) {
        $('#oname_info').html('Opponent Name: ' + data);
        if (main.variables.setupflag == 1) {
            $('#handlebar').trigger('click');
        }
        $('#gamestatus').html('Game Status: <span class="neongreen_txt">Live</span>');
    });

    socket.on('winstreak', function(data) {
        data.coordsarray.forEach(function(element, index, array) {
            if (main.methods.isEven(data.playerturn) == main.methods.isEven(main.variables.playerturn)) {
                document.getElementById(element).className += ' victoryanimation';
            }
            else {
                document.getElementById(element).className += ' loseranimation';
            }
        });
    });

    socket.on('circle', function(data) {
        main.methods.drawNewEnemyCircle(data.x, data.y, data.r, data.dottype);
    });

    // jquery event functions

    $(main.variables.canvas).contextmenu(function(e) {
        e.preventDefault();
        if (main.variables.gamelive == 1) {
            if (main.variables.totaldots < 10) {
                var x;
                var y;

                if (e.pageX || e.pageY) {
                    x = e.pageX;
                    y = e.pageY;
                }

                else {
                    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }

                x -= main.variables.canvas.offsetLeft;
                y -= main.variables.canvas.offsetTop;

                // check and disallow circle creation if within drop boundry area...               
                main.variables.ctx.rect(main.variables.dropboundry.x, main.variables.dropboundry.y, main.variables.dropboundry.w, main.variables.dropboundry.h);
                if (main.variables.ctx.isPointInPath(main.variables.mouse.x, main.variables.mouse.y) == false) {
                    main.methods.drawNewCircle(x, y, 7, main.variables.colors.blue, 'flagrunners');
                    $('#flagrunnercount').html('Flagrunners: ' + main.variables.flagrunners.length);
                    main.variables.totaldots++;
                }
            }
            else {
                main.methods.message('You have reached your dot limit of 10!');
            }
        }
        else {
            main.methods.message("You have not setup your game yet.")
        }
    });

    $(main.variables.canvas).click(function(e) {
        if (main.variables.gamelive == 1) {
            if (main.variables.totaldots < 10) {
                var x;
                var y;
                if (e.pageX || e.pageY) {
                    x = e.pageX;
                    y = e.pageY;
                }
                else {
                    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }
                x -= main.variables.canvas.offsetLeft;
                y -= main.variables.canvas.offsetTop;

                // check and disallow circle creation if within drop boundry area...
                main.variables.ctx.rect(main.variables.dropboundry.x, main.variables.dropboundry.y, main.variables.dropboundry.w, main.variables.dropboundry.h);
                if (main.variables.ctx.isPointInPath(main.variables.mouse.x, main.variables.mouse.y) == false) {
                    main.methods.drawNewCircle(x, y, 7, main.variables.colors.blue, 'attackers');
                    $('#attackercount').html('Attackers: ' + main.variables.attackers.length);
                    main.variables.totaldots++;
                }
            }
            else {
                main.methods.message('You have reached your dot limit of 10!');
            }
        }
        else {
            main.methods.message("You have not setup your game yet.")
        }
    });

    $(main.variables.canvas).mousemove(function(e) { //captures the mouse coordinates within the canvas...

        var rect = this.getBoundingClientRect();
        main.variables.mouse.x = e.clientX - rect.left;
        main.variables.mouse.y = e.clientY - rect.top;

    });

    $(main.variables.canvas).mouseout(function(e) { //sets the y value outside of the border coordinates so it will not stay red...
        main.variables.mouse.y = 201;
    });

    $('#handlebar').click(function() {

        if (main.variables.setupflag == 0) {

            $('html, body').animate({
                left: (($('#setup_wrapper').width() * -1) + 80) + 'px'
            }, 200);

            main.variables.setupflag = 1;

        }
        else {
            $('html, body').animate({
                left: "0"
            }, 200);

            main.variables.setupflag = 0;
        }

        setTimeout(function() {
            $('#handlebar i').toggleClass('glyphicon-chevron-right'),
                $('#handlebar').toggleClass('addneonblue')
        }, 200);

    });

    $('#createuser_wrapper').submit(function(e) {
        e.preventDefault();
        if ($('#username').val() != '') {
            socket.emit('createuser', $('#username').val());
        }
    });

    $('#creategame_wrapper').submit(function(e) {
        e.preventDefault();
        if ($('#gamename').val() != '' && main.variables.username != '') {
            if ($('#gname_info').html() != '') {
                var r = confirm("Are you sure you wish to leave your existing game: " + main.variables.gameroom);
                if (r) {
                    socket.emit('creategame', { 'gamename': $('#gamename').val(), 'oldgamename': main.variables.gameroom, 'username': main.variables.username });
                    $('#gname_info').html('Game Name: ' + $('#gamename').val() + ' ');
                    //playerturn = 1;
                }
            }
            else {
                socket.emit('creategame', { 'gamename': $('#gamename').val(), 'username': main.variables.username });
                $('#gname_info').html('Game Name: ' + $('#gamename').val() + ' ');
                //playerturn = 1;         
            }
        }
    });

    $('#joingame_wrapper').submit(function(e) {
        e.preventDefault();
        if ($('#gamelist').val() != 'default' && main.variables.username != '') {
            if ($('#gname_info').html() != '') {
                var r = confirm("Are you sure you wish to leave your existing game: " + main.variables.gameroom);
                if (r) {
                    socket.emit('joingame', { 'gamename': $('#gamelist').val(), 'oldgamename': main.variables.gameroom, 'username': main.variables.username });
                    $('#gamestatus').html('Game Status: <span class="neongreen_txt">Live</span>');
                    //playerturn = 2;            
                    main.variables.gamelive = 1;
                }
            }
            else {
                socket.emit('joingame', { 'gamename': $('#gamelist').val(), 'username': main.variables.username });
                $('#gamestatus').html('Game Status: <span class="neongreen_txt">Live</span>');
                //playerturn = 2;
                main.variables.gamelive = 1;
            }
        }
    });

    // initialize the setup and start the step cycle

    main.methods.init(); // pre-loads images and initializes hamsters.js web workers

    //setInterval(() => main.methods.step(), 30);
    window.requestAnimationFrame(main.methods.step);
};
