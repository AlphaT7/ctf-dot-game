            var a = function(d){alert(d);},
      		   c = function(d){console.log(d);},
               canvas = document.getElementById("myCanvas"),
               ctx = canvas.getContext("2d"),
               colors = ['rgba(255, 0, 0, 0.5)','#000000','#80bfff','blue','#ff0000'],
               attackers = [],
               gamelive = 0,
               c1=0, c2=0, c3=0, c4=0, c5=0, c6=0,
               flags = [
                  {
                     src : 'img/waving-flag-red.png',
                     x : 192,
                     y : 0
                  },
                  {
                     src : 'img/waving-flag-blue.png',
                     x : 192,
                     y : 384
                  }
               ],
               flagrunners = [];
            
            ctx.canvas.width = 400;
            ctx.canvas.height = 400;
            
            drawFlags();
            
            function drawFlags(){
               flags.forEach(function(element,index,array){
                  var img = new Image();   
                  img.src = flags[index].src;
                  ctx.drawImage(img,flags[index].x,flags[index].y);
               });
            }
            
            function drawNewCircle(x,y,r,color,dottype){
               ctx.fillStyle = color;
               ctx.beginPath();
               ctx.arc(x,y,r,0,2*Math.PI);
               ctx.stroke();   
               ctx.fill();
                
               switch(dottype){
                  case attackers:
                     attackers.push({'x': x, 'y': y, 'rad': r});
                     break;
                  case flagrunners:
                     flagrunners.push({'x': x, 'y': y, 'rad': r});
                     break;
               }
            }
            
            function drawCircle(x,y,r,color){
               ctx.fillStyle = color;
               ctx.beginPath();
               ctx.arc(x,y,r,0,2*Math.PI);
               ctx.stroke();   
               ctx.fill();
            }
            
            function drawLine(x1,y1,x2,y2){
               ctx.beginPath();
               ctx.moveTo(x1,y1);
               ctx.lineTo(x2,y2);
               ctx.stroke();
            }

            function moveFlagRunners(){
               if(flagrunners.length != 0){
                  flagrunners.forEach(function(element,index,array){

                     var x = element.x,
                     y = element.y,
                     targetX = flags[0].x,
                     targetY = flags[0].y,
                     velX = 0,
                     velY = 0,
                     thrust = 1.5;

                     var tx = targetX - x,
                     ty = targetY - y,
                     dist = Math.sqrt(tx*tx+ty*ty);
//                     rad = Math.atan2(ty,tx),
//                     angle = rad/Math.PI * 180;
                
                     velX = (tx/dist)*thrust;
                     velY = (ty/dist)*thrust;
                     
                     if(dist > 1){
                        element.x += velX;
                        element.y += velY;
                     }
                     
                     if (attackers.length > 0){ // if attackers != 0...
                        for(var i = 0; i < attackers.length; i ++){
                           if (checkCollision(attackers[i], element/*, (velX),(velY)*/) == true){ // if collision occurs, delete both objects from their associative arrays...
                              flagrunners.splice(index, 1);
                              attackers.splice(i,1);
                           }
                        }
                     }

                  });
               }
            }

            function moveAttackers(){

               if(attackers.length != 0 && flagrunners.length != 0){
                  attackers.forEach(function(element,index,array){
                     var distance = [];
                     for (var i = 0; i < flagrunners.length; i ++){
                        distance.push(  Math.sqrt( Math.pow((element.x - (flagrunners[i].x)),2) + Math.pow((element.y - (flagrunners[i].y)),2) ) );
                     }
             
                     var arraymin = Math.min.apply(Math, distance);
                     var target = flagrunners[distance.indexOf(arraymin)];
                     
                     var x = element.x,
                     y = element.y,
                     targetX = target.x,
                     targetY = target.y,
                     velX = 0,
                     velY = 0,
                     thrust = 1;

                     var tx = targetX - x,
                     ty = targetY - y,
                     dist = Math.sqrt(tx*tx+ty*ty);

                     velX = (tx/dist)*thrust;
                     velY = (ty/dist)*thrust;

                     if(dist > 1){
                        element.x += velX;
                        element.y += velY;
                     }

                  });
               }               
            }

            // Mathmatic Equation to Detect Colision
            // distance = sqrt( (y2 - y1)² + (x2 - x1)² ) 
            // if distance < r1 + r2, then INTERSECTION HAS OCCURED
            var checkCollision = function(circ1,circ2/*,xv,yv*/){
               var distance = Math.sqrt( Math.pow(((circ2.x/*+xv*/) - circ1.x),2) + Math.pow(((circ2.y/*+yv*/) - circ1.y),2) );
               if(distance <= 50){ drawLine(circ1.x,circ1.y,circ2.x,circ2.y) }
               var test = distance < circ1.rad + circ2.rad;
c(test);
               return test;
            }

            canvas.oncontextmenu = function(e){
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
               
               drawNewCircle(x,y,7,colors[0],flagrunners);
               return false;  
               
            }

            canvas.addEventListener('click',function(e){

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
               
               drawNewCircle(x,y,7,colors[3],attackers);

            });
            
            var step = function() {

               ctx.clearRect(0,0,400,400);
               attackers.forEach(function(element,index,array){
                  drawCircle(attackers[index].x, attackers[index].y,7,colors[2]);
               });
               flagrunners.forEach(function(element,index,array){
                  drawCircle(flagrunners[index].x, flagrunners[index].y,7,colors[0]);
               });
          
               if(flagrunners.length != 0){ moveFlagRunners() }
               if(attackers.length != 0){ moveAttackers() }
               drawFlags();
               /*
               if(gamelive == 0){
                  window.requestAnimationFrame(step);
               }
               */
            };
            
            setInterval(() => window.requestAnimationFrame(step),50);
            
            //step();