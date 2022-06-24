<img align="right" src="https://github.com/MykelMatar/Dogbot/blob/main/src/dependencies/images/Dogbot.png">

# ![Dogbot](https://github.com/MykelMatar/Dogbot/blob/main/src/dependencies/images/Dogbot_Title.png)  
  ### Dogbot is your Discord gaming companion. Track your favorite minecraft servers, get your Valorant stats, enlist fellow gamers for your event, and more! View the [Commands](#all-commands) section below to check whether a command if working or not, or view the [Wiki](https://github.com/MykelMatar/Dogbot/wiki) more information about the commands. 
[Click to add Dogbot to your server](https://discord.com/api/oauth2/authorize?client_id=848283770041532425&permissions=8&scope=bot%20applications.commands)
  
## List of Features:
  * Tracks the status of a Minecraft server (can add up to 10 servers to track)
  * Retrieves Valorant Account Stats from tracker.gg
  * Role selection menu and default roles
  * enlist users for an event or gamer sesh 
  * play TicTacToe against other users
  * get your discord server's stats

## All Commands
### Visit the [Wiki](https://github.com/MykelMatar/Dogbot/wiki) or click on a command name below for more detailed information
### [minecraft commands](https://github.com/MykelMatar/Dogbot/wiki#minecraft-server-tracking-commands)
| command                                                                                   | description                                              | Status |
|:------------------------------------------------------------------------------------------|:---------------------------------------------------------|:------:|
| [/mc-server-status](https://github.com/MykelMatar/Dogbot/wiki#mc-server-status)           | Gets status of selected minecraft server                 |   ✅    |
| [/mc-change-server](https://github.com/MykelMatar/Dogbot/wiki#mc-change-server)           | Changes Server that is being tracked by mc-server-status |   ✅    |
| [/mc-list-servers](https://github.com/MykelMatar/Dogbot/wiki#mc-list-servers)             | Lists registered mc servers                              |   ✅    |
| [/mc-add-server](https://github.com/MykelMatar/Dogbot/wiki#mc-add-server)                 | Adds a new IP to the server list                         |   ✅    |
| [/mc-change-server-ip](https://github.com/MykelMatar/Dogbot/wiki#mc-change-server-ip)     | Changes the IP of an existing server                     |   ✅    |
| [/mc-change-server-name](https://github.com/MykelMatar/Dogbot/wiki#mc-change-server-name) | Changes the name of an existing server                   |   ✅    |
| [/mc-delete-server](https://github.com/MykelMatar/Dogbot/wiki#mc-delete-server)           | Removes server from server list                          |   ✅    |

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
| /server-stats       | displays relevant server stats           |   ✅    |

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


### help commands
| command       | description                                 | Status |
|:--------------|---------------------------------------------|:------:|
| /elp          | lists all commands and relevant information |   ✅    |


