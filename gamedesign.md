
     ,-----.,--.                  ,--. ,---.   ,--.,------.  ,------.
    '  .--./|  | ,---. ,--.,--. ,-|  || o   \  |  ||  .-.  \ |  .---'
    |  |    |  || .-. ||  ||  |' .-. |`..'  |  |  ||  |  \  :|  `--, 
    '  '--'\|  |' '-' ''  ''  '\ `-' | .'  /   |  ||  '--'  /|  `---.
     `-----'`--' `---'  `----'  `---'  `--'    `--'`-------' `------'
    ----------------------------------------------------------------- 


The Design.

The server will keep track of all dot movements and attempt to keep in sync with the 2 clients connected for each game.

Each client will have a loop running at 1 frame every 17 milliseconds.
The server will do the same.

Latency will be measured continually between the client and the server.

When a dot is created in the 1st clients browser:

    1: The initiating client will send the new dot coordinates to the server.
    2: Wait the current latency time measurement after the coordinates have been sent to the server before placing the dot on the game canvas.
    
Upon receiving the new dot coordinates, the server will:

    1: Send the new dot coordinates along with a time stamp to the 2nd client.
    2: Update the server dot state with the new coordinates and details.
    
The 2nd client (upon receiving the new dot coordinates) will:

    1: Measure the latency from the data received and use it as a mutiplier for the dot to "catch up" with the server game state.
    
The server and the clients will keep track of the game loops and determin if they are "in sync".
They can do this by keeping an array with all of the dot coordinates with time stamps attached to them.


## Running the server

1) Open `server.js` and start the app by clicking on the "Run" button in the top menu.

2) Alternatively you can launch the app from the Terminal:

    $ node server.js

Once the server is running, open the project in the shape of 'https://projectname-username.c9users.io/'. 