Add rooms object to the database.
implement draw functionality.
Show available rooms in the frontend, so that any palyer can play with any player around the globe.


Enhancements of Chess Game

More features:
Automatch feature with online users.
Once user is logged in, update the database with isOnline is true.
When get the users from the database who are online, fix a match random like creating a room joining them automatically and starting a game.
-> After getting the online users from the database, remove the current user from that list.

Friends list.
Make a friend.

online game.




Add room to the Database:
-> Add rooms of the database -> means schema for rooms.
-> Create a room on room:create event and save to the database
-> on room:join get the room from the database push the player into the room and update.
-> If both players left the room and then delete the room from the database.

-------------------------------------------------------------------------------
on game:move
Add the game state to the redux slice and on page refresh get the state again from the database and dispatch the action and update the state in redux slice.
-------------------------------------------------------------------------------

