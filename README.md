<div align="center">
    <img style="max-height: 256px; width: auto;" src="resources/palhub-client-header.png" title="Main Logo" />
    <div class="row mt-3">
        <img src="https://img.shields.io/github/downloads/Dekita/palhub-client/total?style=for-the-badge&logo=github">
        <a class="mx-2" href="https://discord.gg/WyTdramBkm" target="new">
        <img src="https://img.shields.io/discord/956439276357308446?logo=discord&style=for-the-badge&logoColor=e4e4e4&label=Support%20Server"></a>
        <img src="https://img.shields.io/github/stars/Dekita/palhub-client?style=for-the-badge&logo=apache%20spark&logoColor=e4e4e4">
    </div>
</div>


### Table of Contents
- [How to install](#how-to-install) 
- [What is PalHUB Client](#what-is-palhub-client) 
- [PalHUB Client Features](#palhub-client-features) 
- [Technical Details](#technical-details)
<hr class="mt-1">


### What is PalHUB Client
PalHUB Client aims to be the ULTIMATE Mod Manager for the video game Palworld. 

| :exclamation: THIS IS A BETA TESTING BUILD AND SHOULD NOT BE USED BY MUGGLES!! |
|---|

| :exclamation: THIS IS A BETA TESTING BUILD AND SHOULD NOT BE USED BY MUGGLES!! |
|---|

| :exclamation: THIS IS A BETA TESTING BUILD AND SHOULD NOT BE USED BY MUGGLES!! |
|---|
<hr class="mt-1">


### PalHUB Client Features
- Painless Installation
- Easily Navigatible Modern UI 
- Automatic Updates (always the latest version)
- Customizable Theme + Multiple Defaults 
- Optional Minimize to System Tray
- Optional Auto Minimize App on Launch
- Optional Auto Launch App on System Boot
- [todo] Multi Platform Support (win+linux)
- [todo] Optional Auto Play Game on Launch
- [todo] System Notifications
- [TODO](/TODO.md) 
<hr class="mt-1">


### Requirements
- [Palworld](https://store.steampowered.com/app/1623730/Palworld/) (obviously)
- Windows PC (for release version, linux/mac can use dev build)
<hr class="mt-1">


### How To Install
Download the latest version from [HERE](https://github.com/Dekita/palhub-client/releases). 

Once downloaded extract and then run the installer.

PalHUB Client is now installed on your PC. Enjoy <3

Future releases will automatically download when you launch the application. 
<hr class="mt-1">


### How to install (development)
| :exclamation: Node.js is required for development |
|---|

#### Clone Repository

```
git clone https://github.com/dekita/palhub-client 
cd ./palhub-client
```

#### Install Dependencies

```
# using yarn (recommended)
yarn 

# using npm
npm install

# using pnpm
pnpm install --shamefully-hoist
```

#### Run Development Mode

```
# using yarn (recommended)
yarn dev 

# using npm
npm run dev

# using pnpm
pnpm run dev
```

#### Build Application

```
# using yarn (recommended)
yarn build 

#using npm 
npm run build

# using pnpm 
pnpm run build
```

#### Publish Application
| :exclamation: Requires repository access via ENV variable `GH_TOKEN` |
|---|
```
# using yarn (recommended)
yarn publish
```

List current `GH_TOKEN` (powershell)
```powershell
echo $env:GH_TOKEN
```
Set New `GH_TOKEN` (single session)
```powershell
$env:GH_TOKEN = "your_token_here"
```
Set New `GH_TOKEN` (permanently)
```powershell
[System.Environment]::SetEnvironmentVariable("GH_TOKEN", "your_token_here", [System.EnvironmentVariableTarget]::User)
```
<hr class="mt-1">


### Technical Details
- [Nextron](https://github.com/saltyshiomix/nextron) (Bundles Next with Electron)
    - [Electron](https://www.electronjs.org/)
    - [Next.js](https://nextjs.org/)
    - [React](https://react.dev/)
- [Nexus Mods](https://www.nexusmods.com/) (Enables mod downloads/updates) 
- Custom API Endpoints (For Server Listing / User Counts)
<hr class="mt-1">


### Help Guides
- 


### Credit && Thanks
- 