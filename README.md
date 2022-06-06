<img align="right" src="https://github.com/MykelMatar/Dogbot/blob/main/src/dependencies/images/Dogbot.png">

# [Dogbot 2.0](https://discord.com/api/oauth2/authorize?client_id=848283770041532425&permissions=8&scope=bot%20applications.commands) 
  ### Dogbot is your Discord gaming companion. Track your favorite minecraft servers, get your Valorant [stats](#get-stats-commands), [enlist](#enlist-user-commands) fellow gamers for your event, and more! View the [Commands](#all-commands) section for a comprehensive list of features and the working status of the commands.
#### All commands are /commands (currently not globally registered)
  
## List of Features:
  * Tracks the status of a Minecraft server (can add up to 10 servers to track)
  * Retrieves Valorant Account Stats from tracker.gg
  * Role selection menu and default roles
  * enlist users for an event or gamer sesh 
  * play TicTacToe against other users

## All Commands
#### Whether The command works or not can be determined by the Status symbol. More information about the state of the commands can be found below their respective tables
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


### enlist-user commands
| command               | description                                                         | Status |
|-----------------------|---------------------------------------------------------------------|:------:|
| /enlist-users         | Creates interaction to enlist other users for event/group           |   ✅    |
| /enlist-stats         | Shows how many times a user enlisted and rejected the Enlist prompt |   ✅    |
| /setrole-autoenlist   | Changes the role used to enlist (for automated enlisting)           |   ✅    |
| /clearrole-autoenlist | Clears role used to automate /enlist-users                          |   ✅    |

### role selection commands
| command              | description                                                                                    | Status |
|----------------------|------------------------------------------------------------------------------------------------|:------:|
| /role-selection-menu | Creates dropdown menu for users to select roles. Add up to 10 roles                            |   ❌    |
| /setrole-default     | Changes the role given to new users                                                            |   ❌    |
| /clearrole-default   | Removes default role given to new users                                                        |   ❌    |
| /set-welcome-channel | Sets the welcome channel of the server (for users to be granted the default role upon joining) |   ❌    |

    commands not implemented

### get-stats commands
| command             | description                              | Status |
|---------------------|------------------------------------------|:------:|
| /get-stats-valorant | Retrieves valorant stats from tracker.gg |   ✅    |

    implemented + more error codes added for clarity

### game commands
| command      | description                             | Status |
|--------------|-----------------------------------------|:------:|
| /tictactoe   | Play tic tac toe against another user   |   ✅*   |
| /typing-race | Start a typing race against other users |   ✅*   |
| /magic8      | Predicts via a Magic 8 ball             |   ✅*   |

    *implemented but not thoroughly tested, typeracer cheat detection may be broken

### creation commands
| command | description                    | Status |
|:-------:|--------------------------------|:------:|
|  /say   | send a message through Dogbot  |   ✅    |

    commands not implemented

### help commands
| command     | description                                   | Status |
|:------------|-----------------------------------------------|:------:|
| /elp        | lists all commands and relevant information   |   ✅    |

## TODO: 
  - [ ] server stats
  - [ ] ~~add 'hide' option to all commands~~ ***not necessary***
  - [ ] ~~Add moderation tools (/filter command to auto delete messages with certain words)~~ ***plenty of bots do this really well already***
  - [ ] ~~more game stats (apex, fortnite, csgo, destiny?)~~ ***doesnt work well with other games***
  - [x] Magic 8-ball
  - [x] type racer game
  - [x] log users who enlist/don't enlist and tally it up then do something fun with it
  - [x] fix /elp (paginate commands by category)
  - [X] delete user data when user leaves
  - [x] /say to send a message from dogbot
  - [x] Prevent collisions for /mc, /listmc, and /autoenlist
  - [x] tic-tac-toe command

