
# PalHUB Client: 
- fix issue when fresh install, mods page is empty: 
https://cdn.discordapp.com/attachments/1260632122759315588/1271789769944203424/23.png?ex=66b89e05&is=66b74c85&hm=81e4b59c5445ebf80b910ca0a79e6ca9acf9c5e51d61383c64dcc28e4222f0de&

- fix vbs location using setExternalVBSLocation


# PalHUB Server: 
- uses api key to send /list-server request to endpoint with mod information

# PalHUB MOD (client): 
- automatically connect to the selected server once game loads

# PalHUB MOD (server): 
- uses api key to send /list-server request to endpoint with mod information

# PalHUB API:
- /ping endpoint to check #users
- /servers endpoint to list all current servers
- /list-server [POST] endpoint to add a server into the list, requires api key

