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
