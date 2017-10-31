var c = function(d){console.log(d)};
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var containerWidth = document.getElementById('canvas_shell').clientWidth;
var containerHeight = document.getElementById('canvas_shell').clientHeight;

ctx.canvas.width = containerWidth;
ctx.canvas.height = containerHeight;
ctx.canvas.border = 1;

var colors = ['#ff0000','#000000','#80bfff','blue'];
var speed = 1;

var update = function(){
   x += speed;
   y += speed;
}

function drawSquare(){
   ctx.fillStyle = colors[3];
   ctx.rect(0, 0, 400, 200);
   ctx.fill();
}

function drawCircle(x,y,r,color){
   ctx.fillStyle = color;
   ctx.beginPath();
   ctx.arc(x,y,r,0,2*Math.PI);
   ctx.stroke();   
   ctx.fill();
   attackers.push({'posx': x, 'posy': y});
}

var attackers = [];
   
var flag = {};

var flagrunners = [{}];

var animationLive = true;

function randomCirclesTL(xmax, xmin, ymax, ymin, color){
//   if(attackers.length < 10){
      for(var i = 0; i <= 9; i++){
   
         var rf = function (){return Math.round(Math.random() * 2 + 5)};
         var x, y, r;
   
         var xf = function (xmax,xmin,r){
            var vxf = Math.floor(Math.random() * (xmax - xmin)+(xmin));
            if(xmin < (vxf - r) && (vxf + r) < xmax){
               return vxf + speed;
            } else {
               xf(xmax,xmin,r);
            }
         };
         
         var yf = function (ymax,ymin,r){
            var vyf = Math.round(Math.random() * (ymax - ymin + 1)+(ymin));
            if(ymin < (vyf - r) && (vyf + r) < ymax){
               return vyf + speed;
            } else {
               yf(ymax,ymin,r);
            }
         };
         
         function varCheck(){ 
            r = rf();
            x = xf(xmax,xmin,r);
            y = yf(ymax,ymin,r);
         }
         
         varCheck(); 
         
            var borderTop = y > 0;
            var borderBottom = y < containerHeight;
            var borderLeft = x > 0;
            var borderRight = x < containerWidth;
            
         drawCircle(x,y,r,colors[2])
      }
/*   } else {
      rf = function (max,min){return Math.round(Math.random() * 2 + 5)};
      r = rf(max,min);
      attackers.forEach(function(element, index, array){
         drawCircle(attackers[index].posx + 1, attackers[index].posy +1,r,colors[2]);
      });
   }*/
}

function randomCirclesBR(xmax, xmin,ymax,ymin,color){
   for(var i = 0; i <= 100; i++){
      var x = Math.round(Math.random() * (max-min + 1)+min);
      var y = Math.round(Math.random() * (max-min + 1)+min);
      var r = Math.round(Math.random() * 2 + 5);
      drawCircle(x,y,r,color);
   }
}




canvas.addEventListener('click',function(){randomCirclesTL(200,0,colors[2])},true);

drawSquare();

var step = function() {

   // update();
   ctx.clearRect(0,0,containerWidth,containerHeight);
   randomCirclesTL(containerWidth,0,containerHeight,0,colors[2]);
   
   if(animationLive){ window.requestAnimationFrame(step);}

};

step();

/*
randomCirclesTL(200,0,colors[2]);
randomCirclesBR(400,200,colors[1]);
*/