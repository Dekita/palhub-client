const fs = require('fs');
const path = require('path');

function getEpicGameInstallPath(gameName) {
  const manifestDir = path.join('C:', 'ProgramData', 'Epic', 'EpicGamesLauncher', 'Data', 'Manifests');

  try {
    const files = fs.readdirSync(manifestDir);
    for (const file of files) {
      if (path.extname(file) === '.item') {
        const filePath = path.join(manifestDir, file);
        const manifestData = fs.readFileSync(filePath, 'utf8');
        
        // Check if the game name exists in the manifest data
        if (manifestData.includes(gameName)) {
          const manifest = JSON.parse(manifestData);
          return manifest.InstallLocation;
        }
      }
    }
  } catch (err) {
    console.error('Error reading Epic Games manifests:', err);
  }
  return null;
}

const gameName = 'YourGameName'; // Replace with the name of the game you're looking for
const installPath = getEpicGameInstallPath(gameName);

if (installPath) {
  console.log(`${gameName} is installed at: ${installPath}`);
} else {
  console.log(`${gameName} is not installed.`);
}
