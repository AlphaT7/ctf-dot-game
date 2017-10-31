/* global $ socket gameroom ctf Image hamsters*/

var ctf_colors = {
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
}; // end of ctf_colors object

var ctf_const = {
   canvas: document.getElementById("myCanvas"),
   ctx: document.getElementById("myCanvas").getContext("2d"),
   goals: [{
      x: 200,
      y: 10
   }, {
      x: 200,
      y: 370
   }]
}; // end of ctf_const object

var ctf_var = {
   totaldots: 0,
   sprites: {},
   flags: [{
      src: 'img/waving-flag-red.png',
      x: ctf_const.goals[0].x,
      y: ctf_const.goals[0].y
   }, {
      src: 'img/waving-flag-blue.png',
      x: ctf_const.goals[1].x,
      y: ctf_const.goals[1].y
   }],
   attackers: [],
   flagrunners: [],
   eattackers: [],
   eflagrunners: [],
   goalboundries: [{
      x: 120,
      y: 0,
      w: 160,
      h: 80,
      c: ctf_colors.st_green
   }, {
      x: 120,
      y: 320,
      w: 160,
      h: 80,
      c: ctf_colors.st_blue

   }],
   dropboundry: {
      x: 0,
      y: 0,
      w: 400,
      h: 200
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
}; // end of ctf_var object

var ctf_methods = function() {

      this.isEven = function(n) {
         return n % 2 == 0;
      }

      this.message = function(text) {
         $('#message').html(text);
         setTimeout(function() {
            $('#message').html('');
         }, 3000);
      }

      this.drawFlags = function() {
         ctf_const.ctx.drawImage(ctf_var.sprites.playerflag,ctf_var.flags[1].x,ctf_var.flags[1].y)
         ctf_const.ctx.drawImage(ctf_var.sprites.enemyflag,ctf_var.flags[0].x,ctf_var.flags[0].y)
      }

      this.drawPlayerBoundry = function() {
         ctf_const.ctx.save();
         ctf_const.ctx.translate(0, 0);
         ctf_const.ctx.beginPath();
         ctf_const.ctx.rect(ctf_var.dropboundry.x, ctf_var.dropboundry.y, ctf_var.dropboundry.w, ctf_var.dropboundry.h);

         // check if we hover it, fill red, if not make it transparent
         ctf_const.ctx.fillStyle = ctf_const.ctx.isPointInPath(ctf_var.mouse.x, ctf_var.mouse.y) ? ctf_colors.st_red : ctf_colors.clear;
         ctf_const.ctx.fill();
         ctf_const.ctx.restore();
      }

      this.drawGoalBoundries = function() {

         ctf_var.goalboundries.forEach(function(element, index, array) {

            ctf_const.ctx.shadowColor = ctf_colors.shadow;
            ctf_const.ctx.shadowBlur = 20;

            if (index == 0) {
               ctf_const.ctx.shadowOffsetY = 2;
               ctf_const.ctx.shadowOffsetX = 2;

            }
            else {
               ctf_const.ctx.shadowOffsetY = -2;
               ctf_const.ctx.shadowOffsetX = -2;
            }

            ctf_const.ctx.fillStyle = element.c;
            ctf_const.ctx.fillRect(element.x, element.y, element.w, element.h);

            if (ctf_var.attackers.length > 0 && index == 0) {
               for (let i = 0; i < ctf_var.attackers.length; i++) {
                  var test = RectCircleColliding(ctf_var.attackers[i], element) == true;
                  if (test) {
                     ctf_const.ctx.strokeStyle = ctf_colors.red;
                     ctf_const.ctx.strokeRect(element.x, element.y, element.w, element.h);
                     ctf_var.attackers.splice(i, 1);
                     ctf_var.totaldots--;
                     $('#attackercount').html('Attackers: ' + ctf_var.attackers.length);
                  }
               }
            }

            if (ctf_var.eattackers.length > 0 && index == 0) {
               for (let i = 0; i < ctf_var.eattackers.length; i++) {
                  var test = RectCircleColliding(ctf_var.eattackers[i], element) == true;
                  if (test) {
                     ctf_const.ctx.strokeStyle = ctf_colors.red;
                     ctf_const.ctx.strokeRect(element.x, element.y, element.w, element.h);
                     ctf_var.eattackers.splice(i, 1);
                  }
               }
            }

            if (ctf_var.attackers.length > 0 && index == 1) {
               for (let i = 0; i < ctf_var.attackers.length; i++) {
                  var test = RectCircleColliding(ctf_var.attackers[i], element) == true;

                  if (test) {
                     ctf_const.ctx.strokeStyle = ctf_colors.red;
                     ctf_const.ctx.strokeRect(element.x, element.y, element.w, element.h);
                     ctf_var.attackers.splice(i, 1);
                     ctf_var.totaldots--;
                     $('#attackercount').html('Attackers: ' + ctf_var.attackers.length);
                  }
               }
            }

            if (ctf_var.eattackers.length > 0 && index == 1) {
               for (let i = 0; i < ctf_var.eattackers.length; i++) {
                  var test = RectCircleColliding(ctf_var.eattackers[i], element) == true;

                  if (test) {
                     ctf_const.ctx.strokeStyle = ctf_colors.red;
                     ctf_const.ctx.strokeRect(element.x, element.y, element.w, element.h);
                     ctf_var.eattackers.splice(i, 1);
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

      }

      this.drawNewCircle = function(x, y, r, color, dottype) {
         ctf_const.ctx.fillStyle = color;
         ctf_const.ctx.beginPath();
         ctf_const.ctx.arc(x, y, r, 0, 2 * Math.PI);
         ctf_const.ctx.stroke();
         ctf_const.ctx.fill();

         switch (dottype) {
            case 'attackers':
               ctf_var.attackers.push({
                  'x': x,
                  'y': y,
                  'rad': r
               });
               break;
            case 'flagrunners':
               ctf_var.flagrunners.push({
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

         socket.emit('circle', circle, ctf_var.gameroom);
      }

      this.drawNewEnemyCircle = function(x, y, r, dottype) {
         switch (dottype) { // have to off-set x & y to make it a mirror image from the opponents viewpoint...
            case 'attackers':
               ctf_var.eattackers.push({
                  'x': (400 - x),
                  'y': (400 - y),
                  'rad': r
               });
               var color = ctf_colors.red;
               break;
            case 'flagrunners':
               ctf_var.eflagrunners.push({
                  'x': (400 - x),
                  'y': (400 - y),
                  'rad': r
               });
               var color = ctf_colors.orange;
               break;
         }

         ctf_const.ctx.fillStyle = color;
         ctf_const.ctx.beginPath();
         ctf_const.ctx.arc((400 - x), (400 - y), r, 0, 2 * Math.PI);
         ctf_const.ctx.stroke();
         ctf_const.ctx.fill();
      }

      this.drawCircle = function(x, y, r, color) {
         ctf_const.ctx.fillStyle = color;
         ctf_const.ctx.beginPath();
         ctf_const.ctx.arc(x, y, r, 0, 2 * Math.PI);
         ctf_const.ctx.fill();
      }

      this.drawLine = function(x1, y1, x2, y2) {
         ctf_const.ctx.beginPath();
         ctf_const.ctx.moveTo(x1, y1);
         ctf_const.ctx.lineTo(x2, y2);
         ctf_const.ctx.stroke();
      }

      this.moveFlagRunners = function() {

         if (ctf_var.flagrunners.length != 0) {
            ctf_var.flagrunners.forEach(function(element, index, array) {

               var x = element.x,
                  y = element.y,
                  moveFlag = false,
                  velX = 0,
                  velY = 0,
                  thrust = 3;

               var targetaquired = x == ctf_var.flags[0].x && y == ctf_var.flags[0].y;
               var targetoffset = x - 7 == ctf_var.flags[0].x && y - 7 == ctf_var.flags[0].y;

               if (targetaquired || targetoffset) {
                  var target = {
                     x: ctf_const.goals[1].x,
                     y: ctf_const.goals[1].y,
                  }
                  element.rad = 12;
                  moveFlag = true;

               }
               else {
                  var target = {
                     x: ctf_var.flags[0].x,
                     y: ctf_var.flags[0].y
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
                  ctf_var.flags[0].x = element.x - 7;
                  ctf_var.flags[0].y = element.y - 7;
               }

            });
         }
      }

      this.moveEFlagRunners = function() {

         if (ctf_var.eflagrunners.length != 0) {
            ctf_var.eflagrunners.forEach(function(element, index, array) {

               var x = element.x,
                  y = element.y,
                  moveFlag = false,
                  velX = 0,
                  velY = 0,
                  thrust = 3;

               var targetaquired = x == ctf_var.flags[1].x && y == ctf_var.flags[1].y;
               var targetoffset = x - 7 == ctf_var.flags[1].x && y - 7 == ctf_var.flags[1].y;

               if (targetaquired || targetoffset) {
                  var target = {
                     x: ctf_const.goals[0].x,
                     y: ctf_const.goals[0].y,
                  }
                  element.rad = 12;
                  moveFlag = true;

               }
               else {
                  var target = {
                     x: ctf_var.flags[1].x,
                     y: ctf_var.flags[1].y
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
                  ctf_var.flags[1].x = element.x - 7;
                  ctf_var.flags[1].y = element.y - 7;
               }

            });
         }

      }

      this.moveAttackers = function() {

         var targetarray = [];
         targetarray[0] = '';
         targetarray[1] = '';

         if (ctf_var.attackers.length != 0 && ctf_var.eattackers.concat(ctf_var.eflagrunners).length != 0) {
            //ctf_var.attackers.forEach(function(element, index, array) {
            for (let index = 0; index < ctf_var.attackers.length; index ++){
               let element = ctf_var.attackers[index];

               // first check if there's any collisions between attackers and eattackers 
               if (ctf_var.eattackers.length > 0) {
                  targetarray[0] = nearestTarget(element, ctf_var.eattackers);
                  if (checkCollision(element, targetarray[0].target) == true) {
                     ctf_var.attackers.splice(index, 1);
                     ctf_var.eattackers.splice(targetarray[0].index, 1);
                     ctf_var.totaldots--;
                     $('#attackercount').html('Attackers: ' + ctf_var.attackers.length);
                     continue;
                  }
               }
               
               // if the above do not collide, check for collisions between attackers and eflagrunners
               if (ctf_var.eflagrunners.length > 0) {
                  targetarray[1] = nearestTarget(element, ctf_var.eflagrunners);
                  if (checkCollision(element, targetarray[1].target) == true) {
                     ctf_var.eflagrunners.splice(targetarray[1].index, 1);
                     ctf_var.attackers.splice(index, 1);
                     ctf_var.totaldots--;
                     $('#attackercount').html('Attackers: ' + ctf_var.attackers.length);
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
                  var t = nearestTarget(element, [targetarray[0].target, targetarray[1].target]);
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
      }

      this.moveEAttackers = function() {

         var targetarray = [];
         targetarray[0] = '';
         targetarray[1] = '';

         if (ctf_var.eattackers.length != 0 && ctf_var.attackers.concat(ctf_var.flagrunners).length != 0) {
            //ctf_var.eattackers.forEach(function(element, index, array) {
            for (let index = 0; index < ctf_var.eattackers.length; index ++){
               let element = ctf_var.eattackers[index];

               if (ctf_var.attackers.length > 0) {
                  targetarray[0] = nearestTarget(element, ctf_var.attackers);
                  if (checkCollision(element, targetarray[0].target) == true) {
                     ctf_var.attackers.splice(targetarray[0].index, 1);
                     ctf_var.eattackers.splice(index, 1);
                     ctf_var.totaldots--;
                     $('#attackercount').html('Attackers: ' + ctf_var.attackers.length);
                     continue;
                  }
               }

               if (ctf_var.flagrunners.length > 0) {
                  targetarray[1] = nearestTarget(element, ctf_var.flagrunners);
                  if (checkCollision(element, targetarray[1].target) == true) {
                     ctf_var.flagrunners.splice(targetarray[1].index, 1);
                     ctf_var.eattackers.splice(index, 1);
                     ctf_var.totaldots--;
                     $('#attackercount').html('Attackers: ' + ctf_var.attackers.length);
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
                  var t = nearestTarget(element, [targetarray[0].target, targetarray[1].target]);
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
      }

      this.nearestTarget = function(element, arr) {

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
      }

      this.checkCollision = function(circ1, circ2) {

         // Mathmatic Equation to Detect Colision
         // distance = sqrt( (y2 - y1)² + (x2 - x1)² ) 
         // if distance < r1 + r2, then INTERSECTION HAS OCCURED

         var distance = Math.sqrt(Math.pow(((circ2.x) - circ1.x), 2) + Math.pow(((circ2.y) - circ1.y), 2));
         if (distance <= 50) {
            drawLine(circ1.x, circ1.y, circ2.x, circ2.y)
         }
         var test = distance < circ1.rad + circ2.rad;
         return test;
      }

      this.load = function () {
         var s = ctf_var.sprites;
         s.playerflag = new Image();
         s.playerflag.src = ctf_var.flags[1].src;
         
         s.enemyflag = new Image();
         s.enemyflag.src = ctf_var.flags[0].src;
         
        hamsters.init({
          maxThreads: 1,
          cache: false,
          debug: false,
          persistence: true
        });
         
      }

      this.step = function() {
         
         if (ctf_var.flagrunners.length != 0) {
            ctf_methods().moveFlagRunners()
         }
         if (ctf_var.attackers.length != 0) {
            ctf_methods().moveAttackers()
         }
         if (ctf_var.eflagrunners.length != 0) {
            ctf_methods().moveEFlagRunners()
         }
         if (ctf_var.eattackers.length != 0) {
            ctf_methods().moveEAttackers()
         }
         
         ctf_const.ctx.clearRect(0, 0, 400, 400);
         ctf_methods().drawPlayerBoundry();

         ctf_const.ctx.save();
         ctf_const.ctx.translate(0, 0);
         drawGoalBoundries();

         ctf_var.attackers.forEach(function(element, index, array) {
            drawCircle(ctf_var.attackers[index].x, ctf_var.attackers[index].y, 7, ctf_colors.blue);
            //hamsters.run(object, function, function, integer, boolean, string, boolean, string);
            
         });
         ctf_var.eattackers.forEach(function(element, index, array) {
            drawCircle(ctf_var.eattackers[index].x, ctf_var.eattackers[index].y, 7, ctf_colors.red);
         });
         ctf_var.flagrunners.forEach(function(element, index, array) {
            drawCircle(ctf_var.flagrunners[index].x, ctf_var.flagrunners[index].y, element.rad, ctf_colors.green);
         });
         ctf_var.eflagrunners.forEach(function(element, index, array) {
            drawCircle(ctf_var.eflagrunners[index].x, ctf_var.eflagrunners[index].y, element.rad, ctf_colors.orange);
         });

         drawFlags();
         ctf_const.ctx.restore();

         
      }

      return this;

   }; // end of methods object

// Canvas onclick, rightclick, and mouseover events....      

ctf_const.canvas.oncontextmenu = function(e) {
   e.preventDefault();
   if (ctf_var.gamelive == 1) {
      if (ctf_var.totaldots < 10) {
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

         x -= ctf_const.canvas.offsetLeft;
         y -= ctf_const.canvas.offsetTop;

         // check and disallow circle creation if within drop boundry area...               
         ctf_const.ctx.rect(ctf_var.dropboundry.x, ctf_var.dropboundry.y, ctf_var.dropboundry.w, ctf_var.dropboundry.h);
         if (ctf_const.ctx.isPointInPath(ctf_var.mouse.x, ctf_var.mouse.y) == false) {
            ctf_methods().drawNewCircle(x, y, 7, ctf_colors.blue, 'flagrunners');
            $('#flagrunnercount').html('Flagrunners: ' + ctf_var.flagrunners.length);
            ctf_var.totaldots++;
         }
      }
      else {
         ctf_methods().message('You have reached your dot limit of 10!');
      }
   }
   else {
      ctf_methods().message("You have not setup your game yet.")
   }
};

ctf_const.canvas.addEventListener('click', function(e) {
   if (ctf_var.gamelive == 1) {
      if (ctf_var.totaldots < 10) {
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
         x -= ctf_const.canvas.offsetLeft;
         y -= ctf_const.canvas.offsetTop;

         // check and disallow circle creation if within drop boundry area...
         ctf_const.ctx.rect(ctf_var.dropboundry.x, ctf_var.dropboundry.y, ctf_var.dropboundry.w, ctf_var.dropboundry.h);
         if (ctf_const.ctx.isPointInPath(ctf_var.mouse.x, ctf_var.mouse.y) == false) {
            ctf_methods().drawNewCircle(x, y, 7, ctf_colors.blue, 'attackers');
            $('#attackercount').html('Attackers: ' + ctf_var.attackers.length);
            ctf_var.totaldots++;
         }
      }
      else {
         ctf_methods().message('You have reached your dot limit of 10!');
      }
   }
   else {
      ctf_methods().message("You have not setup your game yet.")
   }
});

ctf_const.canvas.onmousemove = function(e) { //captures the mouse coordinates within the canvas...

   var rect = this.getBoundingClientRect();
   ctf_var.mouse.x = e.clientX - rect.left;
   ctf_var.mouse.y = e.clientY - rect.top;

};

ctf_const.canvas.onmouseout = function(e) { //sets the y value outside of the border coordinates so it will not stay red...
   ctf_var.mouse.y = 201;
};

ctf_methods().load(); // pre-loads images and initializes hamsters.js web workers

setInterval(() => ctf_methods().step(), 30);