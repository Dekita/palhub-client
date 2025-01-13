
### TODO: 
- determine if single uploaded pak file should be placed in logic mods
- make free user experience even more streamlined
- variable install location when installing downloaded mod
- ensure 'zCustomGameConfigs' is used for relevant games
- add support for games listed in zCustomGameConfigs? 
- cleanup of files because omg they are a mess atm..


### v0.7.20
Added 'Supported Games' list to 'About' page.
Added 'Change Background Visibility' setting.
Added 'Show Archived Files' toggle for mod details popup.
Changed selected background image to be game specific.
Changed file 'download' button to open nexus mods file page for non-premium users.
Changed 'servers' tab to only display for games that have known community servers.
Changed 'Open Nexus Mods Links' to be enabled by default. 
Improved various text elements, descriptions, faq's, etc. 
Altered main body scrollbar to always show for element position consistency.
Fixed issue with certain 7z archive structures (causing mods to install to wrong location)
Fixed issue with all archive structures (where folders arent included in archive as entries)
Fixed issue with ue4ss installation error on palworld servers (incorrect patch file path)
Dramatically reduced overall installer & application size (~25%). <3
- unpacked app size change: 434MB -> 326MB (24.88% reduction)
- installer size change: 125MB -> 98MB (21.6% reduction)

### v0.6.90
Unlocked 'servers' tab for listing modified steam servers (beta feature).
Added app mods for steam palworld (for auto join dedicated server).
Added app mods for steam palserver (for listing modified servers within PalHUB Client App).
Added 'Setup Help' page to detail application setup for new users.
Fixed issue causing 'Launch Palworld' button to not work correctly. 
Various small code improvements + FAQ enhancements

### v0.6.80
Added support for 7z archive types.
Added ability to install mod from previously downloaded zip/rar/7z file.
Added 'unmanage game' button to easily remove a specific game from being managed by palhub client. 
Added support for nexus mods deep links (nxm links when using 'Download with manager' option on nexus).
Fixed issue with updater text showing [object Object] (will only show correct text after this update).
Fixed confusing visual issue where 'add new games to palhub' also showed a 'feature coming soon' text. 
Fixed issue causing lua mods that are only packaged/zipped within their own mod folder, rather than a Mods, Win64, or Binaries root folder, to be incorrectly installed. 
App now sets the cache directory to use the appdata folder by default (recommended to configure to a not appdata folder, but users kept putting their game path in there. hopefully this will help make it more clear.)
Added multiple FAQs.


### v0.6.13
Fixed issue where api key was being saved within application activity log. 

### v0.6.10
Initial Release of application on Nexus Mods.
