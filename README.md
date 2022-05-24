<img align="right" src="https://github.com/MykelMatar/Dogbot/blob/main/pfp/Dogbot.png">

# [Dogbot 2.0](https://discord.com/api/oauth2/authorize?client_id=848283770041532425&permissions=8&scope=bot%20applications.commands) 
  ### Dogbot is your Discord gaming companion. Track your favorite minecraft servers, [get stats](#get-stats-commands) from all your favorite games (not yet), [enlist](#enlist-user-commands) fellow gamers for your event, and more! View the [Commands](#all-commands) section for a comprehensive list of features and the working status of the commands.
#### All commands are /commands (currently not globally registered)
  
## List of Features:
  * Tracks the status of a Minecraft server (can add up to 10 servers to track)
  * Retrieves Valorant Account Stats from tracker.gg
  * Role selection menu and default roles
  * enlist users for an event or gamer sesh 
  * play TicTacToe against other users

## All Commands
#### Whether The command works or not can be determined by the Status symbol. More information about the state of the commands can be found below their respective tables
### creation commands
| command | description                    | Status |
|:-------:|--------------------------------|:------:|
|  /say   | send a message through Dogbot  |   ❌    |
commands not implemented

### help commands 
|   command   | description                                   | Status |
|:-----------:|-----------------------------------------------|:------:|
|    /elp     | lists all commands and relevant information   |   ❌    |
| /suggestion | allows users to make suggestions about Dogbot |   ❌    |
commands not implemented

### minecraft commands 
| command                | description                                              | Status |
|:-----------------------|:---------------------------------------------------------|:------:|
| /mc-server-status      | Gets status of selected minecraft server                 |   ✅    |
| /mc-change-server      | Changes Server that is being tracked by mc-server-status |   ✅    |
| /mc-list-servers       | Lists registered mc servers                              |   ✅    |
| /mc-add-server         | Adds a new IP to the server list                         |   ✅    |
| /mc-change-server-ip   | Changes the IP of an existing server                     |   ✅    |
| /mc-change-server-name | Changes the name of an existing server                   |   ✅    |
| /mc-delete-server      | Removes server from server list                          |   ✅    |

### role selection commands
| command              | description                                                                                    | Status |
|----------------------|------------------------------------------------------------------------------------------------|:------:|
| /role-selection-menu | creates dropdown menu for users to select roles. Add up to 10 roles                            |   ❌    |
| /setrole-default     | changes the role given to new users                                                            |   ❌    |
| /clearrole-default   | removes default role given to new users                                                        |   ❌    |
| /set-welcome-channel | sets the welcome channel of the server (for users to be granted the default role upon joining) |   ❌    |
commands not implemented

### enlist-user commands 
| command               | description                                               | Status |
|-----------------------|-----------------------------------------------------------|:------:|
| /enlist-users         | Creates interaction to enlist other users for event/group |   ❌    |
| /setrole-autoenlist   | changes the role used to enlist (for automated enlisting) |   ❌    |
| /clearrole-autoenlist | Clears role used to automate /enlist-users                |   ❌    |
commands not implemented

### get-stats commands
| command             | description                              | Status |
|---------------------|------------------------------------------|:------:|
| /get-stats-valorant | retrieves valorant stats from tracker.gg |   ❌    |
issue with tracker.gg website, direct link requests not currently working (no ETA)

### game commands
| command    | description                           | Status |
|------------|---------------------------------------|:------:|
| /tictactoe | Play tic tac toe against another user |   ❌    |
command not implemented

## TODO: 
  - [ ] add 'hide' option to all commands
  - [ ] log users who enlist/don't enlist and tally it up then do something fun with it
  - [ ] Add moderation tools (/filter command to auto delete messages with certain words)
  - [ ] Magic 8-ball
  - [ ] more game stats (apex, fortnite, csgo, destiny?)
  - [ ] server stats
  - [ ] type racer game
  - [x] fix /elp (paginate commands by category)
  - [X] delete user data when user leaves
  - [x] /say to send a message from dogbot
  - [x] Prevent collisions for /mc, /listmc, and /autoenlist
  - [x] tic-tac-toe command

