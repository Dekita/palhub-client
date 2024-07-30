
# PalHUB Client:

## Play:
- update/validate installed mods 
- load new modlist

## Mods: 
- add new mod button
- save current mods as list
- load new modlist

## Servers:
- list servers from api

## About:
- subcontract making the about page to gpt, obviously


# PalHUB API:
/ping endpoint to check #users
/servers endpoint to list all current servers
/list-server [POST] endpoint to add a server into the list, requires api key

# PalHUB Server: 
uses api key to send /list-server request to endpoint with mod information

# PalHUB MOD (client): 
automatically connect to the selected server once game loads

# PalHUB MOD (server): 
uses api key to send /list-server request to endpoint with mod information


