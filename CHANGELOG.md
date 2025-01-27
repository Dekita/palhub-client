
### TODO: 
- determine if any pak files edit the same asset? 
- make free user experience even more streamlined.
- variable install location when installing downloaded mod.
- ensure 'zCustomGameConfigs' is used for relevant games.
- add support for games listed in zCustomGameConfigs? 
- cleanup of files because omg they are a mess atm..
- add optional symlink/direct copy options for deploying mods.
- properly setup github actions 
- allow for auto updates to be enabled/disabled


### v0.?.?
- Fix for 7z archives crashing the application (due to checking their pak file for logic mods)
- Added BG images for some supported games. 
- Added orcs-must-die3 & deathtrap games. 
- Added option to disable auto updates.
- Set user counter to update each hour.


### v0.8.75
- Fix for manually installed mods not showing unless 'downloaded mods' have also been added. 
- Fix for certain zip archives with logic mod pak file installing to ~mods folder rather than LogicMods. 
- Fix for mod pages not properly updating after a mod is added/removed
- Fix for locally installed mods popup not closing on uninstall mod

### v0.8.69
- Fixed issue of cache directory being incorrectly named on first boot. 
- Fixed issue of app not redirecting to settings page on first boot. 

### v0.8.68
- Fixed issue of zip archives with logic mod pak file installing to ~mods folder rather than LogicMods. 
(caused by archives that doesnt specify any root folder and contain only pak/utac/ucos/other files)
- Fixed issue of 'install ue4ss' not displaying when setting up managed game that supports it. 
- Fixed issue of games that have been moved directory since added to app causing crash/error.
(any game that doesnt seem validis now automatically removed from the applications data cache)
- Fixed issue of cache being reset each app boot. (only affected latest few versions of app)
- Fixed issue of user nexus avatar not immediately updating after entering api key.
- Fixed issue of 'Discord RPC' not updating status. 
- Disabled Logs->Application/Game selection when no ue4ss available for game logs.

### v0.8.36
- REBRANDED APP FROM `PalHUB Client` to `UE Mod Hub` due to now supporting multiple unreal engine games. 
- Moved default cache location to the folder that app is installed to.  
- Fixed issue of app not creating default cache folder on install.
- Fixed issue with 'View on Nexus Mods' button in mod details popup for newly supported games. 
- Fixed issue with FF7 Remake + Rebirth not launching from app (wanted launched via steam).
- Fixed issue with 'save ue4ss config' button causing crash. 
- Added 'ff7' and 'mako' themes for final fantasy 7 users. 
- Added 'Discord RPC' for the application.

### v0.7.20
- Added 'Supported Games' list to 'About' page.
- Added 'Change Background Visibility' setting.
- Added 'Show Archived Files' toggle for mod details popup.
- Changed selected background image to be game specific.
- Changed file 'download' button to open nexus mods file page for non-premium users.
- Changed 'servers' tab to only display for games that have known community servers.
- Changed 'Open Nexus Mods Links' to be enabled by default. 
- Improved various text elements, descriptions, faq's, etc. 
- Altered main body scrollbar to always show for element position consistency.
- Fixed issue with certain 7z archive structures (causing mods to install to wrong location)
- Fixed issue with all archive structures (where folders arent included in archive as entries)
- Fixed issue with ue4ss installation error on palworld servers (incorrect patch file path)
- Dramatically reduced overall installer & application size (~25%). <3
  - unpacked app size change: 434MB -> 326MB (24.88% reduction)
  - installer size change: 125MB -> 98MB (21.6% reduction)

### v0.6.90
- Unlocked 'servers' tab for listing modified steam servers (beta feature).
- Added app mods for steam palworld (for auto join dedicated server).
- Added app mods for steam palserver (for listing modified servers within PalHUB Client App).
- Added 'Setup Help' page to detail application setup for new users.
- Fixed issue causing 'Launch Palworld' button to not work correctly. 
- Various small code improvements + FAQ enhancements

### v0.6.80
- Added support for 7z archive types.
- Added ability to install mod from previously downloaded zip/rar/7z file.
- Added 'unmanage game' button to easily remove a specific game from being managed by palhub client. 
- Added support for nexus mods deep links (nxm links when using 'Download with manager' option on nexus).
- Fixed issue with updater text showing [object Object] (will only show correct text after this update).
- Fixed confusing visual issue where 'add new games to palhub' also showed a 'feature coming soon' text. 
- Fixed issue causing lua mods that are only packaged/zipped within their own mod folder, rather than a Mods, Win64, or Binaries root folder, to be incorrectly installed. 
- App now sets the cache directory to use the appdata folder by default (recommended to configure to a not appdata folder, but users kept putting their game path in there. hopefully this will help make it more clear.)
- Added multiple FAQs.

### v0.6.13
- Fixed issue where api key was being saved within application activity log. 

### v0.6.10
- Initial Release of application on Nexus Mods.
