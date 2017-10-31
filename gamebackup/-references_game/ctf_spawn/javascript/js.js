//https://ctf-spawn.firebaseapp.com/
   
   var canvas = document.getElementById("canvas");
   var ctx = canvas.getContext("2d");
   //var containerWidth = document.getElementById('canvas_shell').clientWidth;
   //var containerHeight = document.getElementById('canvas_shell').clientHeight;
   var containerWidth = 800;
   var containerHeight = 700;

   ctx.canvas.width = containerWidth;
   ctx.canvas.height = containerHeight;
   ctx.canvas.border = 1;

   var a = function(d) {
      alert(d);
   };
   var c = function(d) {
      console.log(d)
   };

   var colors = ['rgba(255, 0, 0, 0.5)', '#000000', '#80bfff', 'blue', '#ff0000', '#33cc33', 'rgba(204, 0, 153,.5)'];
   var attackers = [];
   var gamelive = false;
   var c1 = 0,
      c2 = 0,
      c3 = 0,
      c4 = 0,
      c5 = 0,
      c6 = 0;
   var flags = [{
      src: 'images/waving-flag-red.png',
      xpos: containerWidth / 2 - 8,
      ypos: 0
   }, {
      src: 'images/waving-flag-blue.png',
      xpos: containerWidth / 2 - 8,
      ypos: containerHeight - 16
   }];
   var flagrunners = [];
   var myuser;
   var opponent;
   var opponentflagrunners = [];
   var opponentattackers = [];

   drawFlags();

   Array.prototype.clone = function() {
	   return this.slice(0);
   };

   function drawFlags() {
      flags.forEach(function(element, index, array) {
         var img = new Image();
         img.src = flags[index].src;
         ctx.drawImage(img, flags[index].xpos, flags[index].ypos);
      });
   }

   function drawNewCircle(x, y, r, color, dottype) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();

      switch (dottype) {
         case attackers:
            attackers.push({
               'xpos': x,
               'ypos': y,
               'rad': r
            });
            break;
         case flagrunners:
            flagrunners.push({
               'xpos': x,
               'ypos': y,
               'rad': r,
               'c1': 0,
               'c2': 0,
               'c3': 0,
               'c4': 0,
               'c5': 0,
               'c6': 0
            });
      }

   }

   function drawCircle(x, y, r, color) {
      //console.log('x-'+x + 'y-'+y +'r-'+r + 'color-'+color);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
   }

   function moveAttackers(){
      if (attackers.length != 0) {
         attackers.forEach(function(element, index, array) {

            var dir = checkAttackersDir(array[index].xpos, array[index].ypos, element);

            array[index].xpos += dir[0];
            array[index].ypos += dir[1];

         });
      }      
   }

   function checkAttackersDir(x,y,thisCircle){
      
   }


   function moveFlagRunners() {
      if (flagrunners.length != 0) {
         flagrunners.forEach(function(element, index, array) {

            var dir = checkDir(array[index].xpos, array[index].ypos, element);

            array[index].xpos += dir[0];
            array[index].ypos += dir[1];

         });
      }
   }

   function checkDir(x, y, thisCircle) {
      var target = flags[0];
      var xvalue;
      var yvalue;

      switch (true) {
         case (target.xpos > x):
            xvalue = 1;
            break;
         case (target.xpos < x):
            xvalue = -1;
            break;
         case (target.xpos == x):
            xvalue = 0;
            break;
      }

      switch (true) {
         case (target.ypos > y):
            yvalue = 1;
            break;
         case (target.ypos < y):
            yvalue = -1;
            break;
         case (target.ypos == y):
            yvalue = 0;
            break;
      }

      attackers.forEach(function(element, index, array) {
         if (checkCollision(element, thisCircle, xvalue, yvalue)) {

            switch (false) {
               case checkCollision(element, thisCircle, 1, 1):
                  c(1);
                  c1++;
                  if (c1 > 5) {
                     c1 = 0;
                  }
                  else {
                     xvalue = 1;
                     yvalue = 1;
                     thisCircle.c1++;
                     break;
                  }

               case checkCollision(element, thisCircle, 1, 0):
                  c(2);
                  c2++;
                  if (c2 > 5) {
                     c2 = 0;
                  }
                  else {
                     xvalue = 1;
                     yvalue = 0;
                     thisCircle.c2++;
                     break;
                  }
                  //case checkCollision(element,thisCircle,0,1):
               case checkCollision(element, thisCircle, -1, 0):
                  c(3);
                  c3++;
                  if (c3 > 5) {
                     c3 = 0;
                  }
                  else {
                     xvalue = -1;
                     yvalue = 0;
                     thisCircle.c3++;
                     break;
                  }
               case checkCollision(element, thisCircle, -1, -1):
                  c(4);
                  c4++;
                  if (c4 > 5) {
                     c4 = 0;
                  }
                  else {
                     xvalue = -1;
                     yvalue = -1;
                     thisCircle.c4++;
                     break;
                  }
               case checkCollision(element, thisCircle, 0, 1):
                  //case checkCollision(element,thisCircle,-1,0):
                  c(5);
                  c5++;
                  if (c5 > 5) {
                     c5 = 0;
                  }
                  else {
                     xvalue = 0;
                     yvalue = 1;
                     thisCircle.c5++;
                     break;
                  }
               case checkCollision(element, thisCircle, 0, -1):
                  c(6);
                  c6++;
                  if (c6 > 5) {
                     c6 = 0;
                  }
                  else {
                     xvalue = 0;
                     yvalue = -1;
                     thisCircle.c6++;
                     break;
                  }
               default:
                  c('default option');
                  break;
            }

         }
      });

      return [xvalue, yvalue];

   }

   var checkCollision = function(circ1, circ2, xv, yv) {
      // Mathmatic Equation to Detect Colision
      // distance = sqrt( (y2 - y1)² + (x2 - x1)² ) 
      // if distance < r1 + r2, then INTERSECTION HAS OCCURED
      var calculation = function(circ1, circ2, xv, yv) {
         var distance = Math.sqrt(Math.pow((circ1.xpos - (circ2.xpos + xv)), 2) + Math.pow((circ1.ypos - (circ2.ypos + yv)), 2));
         var test = distance < circ1.rad + circ2.rad + 5;
         return test;
      }
      if (calculation(circ1, circ2, xv, yv)) {
         // if test == true, than colision has occured, need to change the path;
         //c("Collision Detected!!!")
         return true;

      }
      else {
         return false;
      }

   };

   canvas.oncontextmenu = function(e) {
      if (gamelive) {
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

         x -= canvas.offsetLeft;
         y -= canvas.offsetTop;
         //c(x+'-'+y);
         drawNewCircle(x, y, 7, colors[0], flagrunners);
         return false;
      }
   }

   canvas.onclick = function(e) {
      if (gamelive) {
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

         x -= canvas.offsetLeft;
         y -= canvas.offsetTop;

         drawNewCircle(x, y, 7, colors[3], attackers);
         transmitToOpponent(prepareAttackersForTransmit());
      }
   };

   function prepareAttackersForTransmit() {
      var str = attackers.map(function(el) {
         return(el.xpos+'-'+el.ypos+'-'+el.rad);
      });
      str = str.toString().replace(/,/g, '#');
      return str;
   }
   
   function prepareFlagRunnersForTransmit() {
      var str = flagrunners.map(function(el) {
         return el.xpos+'-'+el.ypos+'-'+el.rad;
      });
   }

   function transmitToOpponent(attackersStr){
      //console.log('transmit-data-'+attackersStr)
      firebase.database().ref('users/' + opponent).update({
         opponentattackers: attackersStr
      });
   }

   function receiveTransmit(){
      
   }

   var step = function() {

      ctx.clearRect(0, 0, containerWidth, containerHeight);
      
      attackers.forEach(function(element, index, array) {
         drawCircle(attackers[index].xpos, attackers[index].ypos, 7, colors[2]);
      });
      
      flagrunners.forEach(function(element, index, array) {
         drawCircle(array[index].xpos, array[index].ypos, 7, colors[0]);
      });
      

      moveFlagRunners(flagrunners);
      drawFlags();

      if (gamelive == true) {
         window.requestAnimationFrame(step);
      }
   };

   function initialize(user) {
      gamelive = true;
      document.getElementById('name').innerHTML = user.displayName;
      //document.getElementById('player_img').src = user.photoURL;
      document.getElementById('login').style.display = 'none';
      document.getElementById('chooseuid').style.display = 'block';
      step();
      myuser = user.uid;
      
      
         
   }
   
   function exit() {
      firebase.database().ref('users/' + userId).update({
         online: '0'
      });
   }