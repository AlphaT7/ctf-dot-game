/* global main $ socket */
/* -- Right Content Menu Push -- */

$('#handlebar').click(function() {

   if (main.variables.setupflag == 0) {

      $('html, body').animate({
         left: (($('#setup_wrapper').width() * -1) + 80) + 'px'
      }, 200);

      main.variables.setupflag = 1;

   } else {
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
      if($('#gname_info').html() != ''){
         var r = confirm("Are you sure you wish to leave your existing game: " + main.variables.gameroom);
         if(r){
            socket.emit('creategame', {'gamename': $('#gamename').val(), 'oldgamename':main.variables.gameroom, 'username': main.variables.username});
            $('#gname_info').html('Game Name: ' + $('#gamename').val() + ' ');
            //playerturn = 1;
         }
      } else {
         socket.emit('creategame', {'gamename': $('#gamename').val(), 'username': main.variables.username});
         $('#gname_info').html('Game Name: ' + $('#gamename').val() + ' ');
         //playerturn = 1;         
      }
   }
});

$('#joingame_wrapper').submit(function(e) {
   e.preventDefault();
   if ($('#gamelist').val() != 'default' && main.variables.username != '') {
      if($('#gname_info').html() != ''){
      var r = confirm("Are you sure you wish to leave your existing game: " + main.variables.gameroom);
         if(r){
            socket.emit('joingame', {'gamename': $('#gamelist').val(), 'oldgamename':main.variables.gameroom, 'username': main.variables.username});
            $('#gamestatus').html('Game Status: <span class="neongreen_txt">Live</span>');
            //playerturn = 2;            
            main.variables.gamelive = 1;
         }
      } else {
         socket.emit('joingame', {'gamename': $('#gamelist').val(), 'username': main.variables.username});
         $('#gamestatus').html('Game Status: <span class="neongreen_txt">Live</span>');
         //playerturn = 2;
         main.variables.gamelive = 1;
      }
   }
});