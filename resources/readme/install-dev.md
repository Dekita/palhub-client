
### How to install (development)
| :exclamation: Node.js is required for development |
|---|
<hr class="mt-1">

#### Clone Repository

```
git clone https://github.com/dekita/palhub-client 
cd ./palhub-client
```
<hr class="mt-1">

#### Install Dependencies

```
# using yarn (recommended)
yarn 

# using npm
npm install

# using pnpm
pnpm install --shamefully-hoist
```
<hr class="mt-1">

#### Run Development Mode

```
# using yarn (recommended)
yarn dev 

# using npm
npm run dev

# using pnpm
pnpm run dev
```
<hr class="mt-1">

#### Build Application

```
# using yarn (recommended)
yarn build 

#using npm 
npm run build

# using pnpm 
pnpm run build
```
<hr class="mt-1">

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




