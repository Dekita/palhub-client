

<div align="center">
    <img style="max-height: 256px; width: auto;" src="resources/palhub-client-header.png" title="Main Logo" />
    <div class="row mt-3">
        <img src="https://img.shields.io/github/downloads/Dekita/palhub-client/total?style=for-the-badge&logo=github">
        <a class="mx-2" href="https://discord.gg/WyTdramBkm" target="new">
        <img src="https://img.shields.io/discord/1132980259596271657?logo=discord&style=for-the-badge&logoColor=e4e4e4&label=Support%20Server"></a>
        <img src="https://img.shields.io/github/stars/Dekita/palhub-client?style=for-the-badge&logo=apache%20spark&logoColor=e4e4e4">
    </div>
</div>

---


### What is PalHUB Client
PalHUB Client aims to be the ULTIMATE Mod Manager for the video game Palworld. Allowing players to effortlessly manage their mods, save/load mod collections to/from a modlist, and most importantly, view/install the requirements for modified servers!! 

Additionally, if you run a server where connecting clients need to have specific mods. This is a plug and play solution to the many many hours you've spent helping users get mods setup to join your server! Simply share your server mod list, and users can install all requirements with the click of a button!! 

List your server in palhub client using the `PalHUB Client (Server Listing Mod)` (coming soon:..)

| :exclamation: THIS APP IS IN BETA, JUST LIKE THE GAME!! PLEASE REPORT ANY BUGS |
|---|

| :exclamation: THIS APP IS IN BETA, JUST LIKE THE GAME!! PLEASE REPORT ANY BUGS |
|---|

| :exclamation: THIS APP IS IN BETA, JUST LIKE THE GAME!! PLEASE REPORT ANY BUGS |
|---|
<hr class="mt-1">


### Download Link & Install Guides
- [Download Latest Release](./releases)
- [How to Install App](./resources/readme/install.md)
- [Developer Build](./resources/readme/install-dev.md)
<hr class="mt-1">


### PalHUB Client Features
- Painless Installation 
- Easily Navigatible Modern UI 
- Guided Setup After Install (w/Automatic Steam Game Path Detection)
- Download & Install Mods From [NexusMods](https://www.nexusmods.com/)
- Effortlessly manage your mod library and active mods with minimal clicks 
- Allows for listing modified servers, their required mods, discord support server, and additional information 
- Allows for joining modified servers, downloading their required mod list, or joining their discord support server
- Automatically join into selected server as game launches (completely skips title screen) 
- Automatic App Updates (PalHUB Client will always be the latest version)
- Customizable Theme + Multiple Defaults 
- Optional Minimize to System Tray
- Optional Auto Minimize App on Launch
- Optional Auto Launch App on System Boot
- [TO-DO] Multi Platform Support (win+linux)
- [TO-DO] Optional Auto Play Game on Launch
- [TO-DO] System Notifications
<hr class="mt-1">


### Requirements
- [Palworld](https://store.steampowered.com/app/1623730/Palworld/) Installed on your machine (steam or gamepass versions supported)
- A [NexusMods](https://www.nexusmods.com/) account, to allow for downloading mods via their api.
- Windows PC (for release version, linux/mac can use developer build directly with node.js installed)
<hr class="mt-1">


### Technical Details
- [Nextron](https://github.com/saltyshiomix/nextron) (Bundles Next with Electron)
    - [Electron](https://www.electronjs.org/)
    - [Next.js](https://nextjs.org/)
    - [React](https://react.dev/)
- [Nexus Mods](https://www.nexusmods.com/) (Enables mod downloads/updates) 
- Custom API Endpoints (For Server Listing / User Counts)
<hr class="mt-1">
