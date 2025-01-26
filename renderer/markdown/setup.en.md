![alt text](/img/palworld/bg3.webp)

---
#### Application Cache Directory
![alt text](/img/app-setup-help/app-cache-dir.png)

The application cache directory should point to an empty folder on your computer. This is where mod files will be downloaded and stored, before they are installed to the game directory.

DO NOT SET THIS TO BE THE PATH TO YOUR GAME!!

---
#### Nexus Mods API Key
![alt text](/img/app-setup-help/nexus-api-key.png)

Enter your unique API Key for {{app.brandname}} from Nexus Mods. You should NOT use a Personal API Key for {{app.brandname}}, or the API Key for any other Nexus Mods supported mod manager application as this may cause issues when downloading mods. 

![alt text](/img/app-setup-help/nexus-palhub-api.png)

NOTICE: This app is currently being rebranded from `PalHUB Client` to `UE Mod Hub` due to the app now supporting multiple unreal engine games, such as Palworld, Final Fantasy Remake+Rebirth, Black Myth Wukong, etc. Nexus mods has not yet updated the application information on the api keys page.. This should be done soon. 

---
#### Open Nexus Mods Links
![alt text](/img/app-setup-help/nexus-deep-links.png)

Once enabled, the application MUST be restarted for the changes to take effect. After restart, the application will respond whenever you click 'Mod Manager Download' on any specific mod page on Nexus Mods. 

![alt text](/img/app-setup-help/nexus-modman-download.png) 

This will initiate a download of the specific mod file that you have clicked, and is the only way for non-premium Nexus Mods users to download mods when using {{app.brandname}}. 

![alt text](/img/app-setup-help/nexus-freeuser-download.png) 

NOTE: Only one application can actively listen for 'Mod Manager Download' buttons from nexus mods. If you currenly use Vortex or any other mod manager software that uses this feature, enabling it for this application may disable it for others (closing this application and opening your other app; Vortex for example, should restore functionality). 

---
#### Manage Games
![alt text](/img/app-setup-help/manage-games.png) 

This is where you add a specific game to be managed by {{app.brandname}}. On first launch you should click to add new game, this will open a popup window for you to enter the installation path of your desired game. 

![alt text](/img/app-setup-help/setup-new-game.png) 

Once you enter a valid path to a supported game; Palworld, FF7R, etc. You will be able to download and install UE4SS to that games directory, should the game require it. (UE4SS is optional for some games)

![alt text](/img/app-setup-help/setup-new-game-found.png) 

After UE4SS is installed you are all setup and ready to begin using {{app.brandname}} to manage the mods for your selected game. UE4SS Config options can dramatically affect how the system interacts with your game, because of this you should NOT alter the UE4SS Config options unless you FULLY understand the changes you are making!! {{app.brandname}} will apply the most common and stable configuration for supported games to ensure a smooth experience for everyday users.

![alt text](/img/app-setup-help/ue4ss-installation.png) 

---
Last updated: Jan 11th, 2025.
