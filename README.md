<p align="center">
  <img src="https://github.com/MykelMatar/Dogbot/blob/Discord.js14/src/dependencies/images/Dogbot_512_Full.png" width="50%">
</p>

  ### Dogbot is your Discord gaming companion. Track your favorite minecraft servers, get your Valorant stats, enlist fellow gamers for your event, and more! View the [Commands](#all-commands) section below to check whether a command if working or not, or view the [Wiki](https://github.com/MykelMatar/Dogbot/wiki) more information about the commands. 
[Click to add Dogbot to your server](https://discord.com/api/oauth2/authorize?client_id=848283770041532425&permissions=8&scope=bot%20applications.commands)
<p align="left">
  <img src="https://github.com/MykelMatar/Dogbot/blob/Discord.js14/src/dependencies/images/magic8.png" width="25%"></img>
</p>


## List of Features: 
  * Tracks the status of a Minecraft server (can add up to 10 servers to track)
  * Retrieves Valorant Account Stats from tracker.gg
  * Role selection menu and default roles
  * enlist users for an event or gamer sesh 
  * play TicTacToe against other users
  * get your discord server's stats

## Image Gallery
**Minecraft Commands**  
<img src="https://github.com/MykelMatar/Dogbot/blob/Discord.js14/src/dependencies/images/mc-server-status.png" width="25%"></img>
<img src="https://github.com/MykelMatar/Dogbot/blob/Discord.js14/src/dependencies/images/mc-list-servers.png" width="25%"></img>
<img src="https://github.com/MykelMatar/Dogbot/blob/Discord.js14/src/dependencies/images/mc-list-servers-status.png" width="28%"></img>  

**Enlist Commands**  
<img src="https://github.com/MykelMatar/Dogbot/blob/Discord.js14/src/dependencies/images/enlist-users.png" width="30%"></img>  
<img src="https://github.com/MykelMatar/Dogbot/blob/Discord.js14/src/dependencies/images/enlist-stats.png" width="20%"></img>
<img src="https://github.com/MykelMatar/Dogbot/blob/Discord.js14/src/dependencies/images/enlist-leaderboard.png" width="33%"></img>

**Other Commands**  
<img src="https://github.com/MykelMatar/Dogbot/blob/Discord.js14/src/dependencies/images/get-stats-valorant.png" width="50%"></img>   
<img src="https://github.com/MykelMatar/Dogbot/blob/Discord.js14/src/dependencies/images/server-stats.png" width="60%"></img>


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
| [/enlist-users](https://github.com/MykelMatar/Dogbot/wiki#enlist-users)         | Creates interaction to enlist other users for event/group           |   ✅   |
| [/enlist-stats](https://github.com/MykelMatar/Dogbot/wiki#enlist-stats)         | Shows how many times a user enlisted and rejected the Enlist prompt |   ✅   |
| [/enlist-leaderboard](https://github.com/MykelMatar/Dogbot/wiki#enlist-leaderboard) | Displays enlist rankings                 |   ✅   |
| [/enlist-set-role](https://github.com/MykelMatar/Dogbot/wiki#enlist-set-role)| Changes the role mentioned during to enlist (for automated enlisting)|   ✅ |
| [/enlist-clear-role](https://github.com/MykelMatar/Dogbot/wiki#enlist-clear-role) | Clears role used to mentioned during to enlist                |   ✅   |
| [/enlist-check-role](https://github.com/MykelMatar/Dogbot/wiki#enlist-check-role) | Checks role used to mentioned during to enlist                 |   ✅   |


### get-stats commands
| command             | description                              | Status |
|---------------------|------------------------------------------|:------:|
| [/get-stats-valorant](https://github.com/MykelMatar/Dogbot/wiki#get-stats-valorant) | Retrieves valorant stats from tracker.gg |   ✅   |
| [/server-stats](https://github.com/MykelMatar/Dogbot/wiki#server-stats)       | displays relevant server stats           |   ✅   |


### game commands
| command      | description                             | Status |
|--------------|-----------------------------------------|:------:|
| [/tictactoe](https://github.com/MykelMatar/Dogbot/wiki#tictactoe)   | Play tic tac toe against another user   |   ✅*  |
| [/magic8](https://github.com/MykelMatar/Dogbot/wiki#magic8)      | Predicts via a Magic 8 ball             |   ✅*  |

    *implemented but not thoroughly tested, typeracer cheat detection may be broken

### other commands
| command | description                                  | Status |
|:-------:|----------------------------------------------|:------:|
|  [/speak](https://github.com/MykelMatar/Dogbot/wiki#speak)   | send a message through Dogbot                |   ✅  |
| [/help](https://github.com/MykelMatar/Dogbot/wiki#elp)    | lists all commands and relevant information  |   ✅  |


