# [Dogbot 2.0](https://discord.com/api/oauth2/authorize?client_id=848283770041532425&permissions=8&scope=bot%20applications.commands) ![Dogbot PFP](https://github.com/MykelMatar/Dogbot/blob/main/pfp/Dogbot.png)
## About
  Dogbot is a Discord bot made with Discord.js 13. All commands are registered /commands (currently not globally registered)
  
## List of Features:
  * Tracks the status of a Minecraft server
  * Retrieves Valorant Account Stats from tracker.gg
  * Role selection menu and default roles
  * enlist users for an event or gamer sesh 

## All Commands: 
   ### help commands: 
   ``` js
    '/elp          - lists all commands and relevant information'
    '/suggestion   - allows users to make suggestions about Dogbot'
   ```
    
   ### minecraft commands: 
   ``` js
    '/mc-add-server          - Adds a new IP to the server list'
    '/mc-change-server-ip    - Changes the IP of an existing server'
    '/mc-change-server-name  - Changes the name of an existing server'
    '/mc-change-server       - Changes Server that is being tracked by mc-server-status'
    '/mc-delete-server       - Removes server from server list'
   ```
    
   ### role selection commands:
   ``` js
    '/role-selection-menu  - creates dropdown menu for users to select roles. Add up to 10 roles'
    '/clearrole-default    - removes default role given to new users'
    '/set-welcome-channel  - sets the welcome channel of the server (for users to be granted the default role upon joining)'
    '/setrole-default      - changes the role given to new users'
   ```
    
   ### enlist-user commands: 
   ``` js
    '/clearrole-autoenlist - Clears role used to automate /enlist-users'
    '/enlist-users         - Creates interaction to enlist other users for event/group'
    '/setrole-autoenlist   - changes the role used to enlist (for automated enlisting)'
   ```
    
   ### get-stats commands: 
   ``` js
    '/get-stats-valorant - retrieves valorant stats from tracker.gg'
   ```

## TODO: 
  - [ ] fix /elp
  - [ ] add 'hide' option to all commands
  - [ ] /say to send a message from dogbot
  - [ ] /createembed
  - [ ] Prevent collisions for /mc, /listmc, and /autoenlist
  - [ ] log users who enlist/dont enilst and tally it up then do something fun with it
  - [ ] Add moderation tools
  - [ ] tic tac toe command
  - [ ] Poll creation
  - [ ] Magic 8 ball
  - [ ] more game stats (apex, fortnite, csgo, destiny?)
  - [ ] server stats
  - [ ] custom commands

