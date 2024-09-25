
## Application Roadmap


- change flow for new users. 
1. set app cache directory
2. set api keys for mod store providers (eg, nexus)
3. select game for which to manage mods
4. select modloaders to use for selected game 

- proper ue4ss version checking + updating
1. means of checking for currently installed ue4ss version
2. means of removing currently installed ue4ss version
3. means of checking for update to current ue4ss  



- improve logging system to allow for better errors in packaged application
- improve ui/ux when downloading mods/modlists
- prepare application to handle multiple games, eg: steam palworld, gamepass palworld, steam palworld server. 
  - alter the [settings] page to allow for configuration of individual games
  - allow easily switching between the selected game
  - allow for [servers] page to be hidden unless selected game allows servers
  - update 'backend' code to handle alternative games from nexus

??- create new 'home' page that allows for quickly selecting game to mod, or to load recently joined game servers??

- consolodate cache files
- store cache files in 'cache' directory (where mods are stored)??

-- automatic offline detection / popup notice


# ue4ss suggestion;
suggestion; refactor expected folder structure to that all possible mod folders are subfolders within a single folder. 

reason; it can currently be hard for users to figure out where each type of mod should be placed, and can feel overwhelming when they have to go from the Binaries/xx folders to Content/xx. 

solution; move the following folders;;
from: Binaries/Win64(or WinGDK)/Mods
to: Content/Mods/LUA

from: Content/Paks/~mods(or Mods/mods)
to: Content/Mods/PAK

from Content/Paks/LogicMods
to: Content/Mods/Logic
or: Content/Mods/BPAK
or: Content/Mods/BP

this way, general users should hopefully find it much easier to navigate as they only have to deal with maintaining a single folder and its subfolders;
- Content/Mods
  - Content/Mods/BP
  - Content/Mods/LUA
  - Content/Mods/PAK
 
ue4ss could be updated to add the new `Content/Mods/BP|PAK` folders as additional folders that ue can find pak files to ennsure they are all loaded like they would normally be if within a subfolder of `Content/Paks`, and also load the lua mods from the new path by default in the ue4ss settings file. The BPModloaderMod could also be be fairly easily updated to load logic from the new path as well.. thoughts? :)

this is obviously a change that would likely break the file structure of a lot of existing uploaded mods, which is a huge negative. 
