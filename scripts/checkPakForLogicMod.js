const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

function checkPakForLogicMod(pakFilePath, assetName='ModActor.uasset') {
    try {
        const dirPath = path.dirname(pakFilePath);
        const baseName = path.basename(pakFilePath, '.pak'); // Get the base name without extension

        // Check if corresponding .ucas and .utoc files exist
        const ucasFilePath = path.join(dirPath, `${baseName}.ucas`);
        const utocFilePath = path.join(dirPath, `${baseName}.utoc`);

        // If both .ucas and .utoc files exist, recurse using the .utoc file
        if (fs.existsSync(ucasFilePath) && fs.existsSync(utocFilePath)) {
            console.log(`Found .ucas and .utoc files for ${baseName}, checking ${utocFilePath}...`);
            return checkPakForLogicMod(utocFilePath, assetName); // Recurse with .utoc file
        }

        // If the pak file or .utoc file doesn't exist, proceed with reading the .pak file
        const fileBuffer = fs.readFileSync(pakFilePath);
        const readableData = fileBuffer.toString('utf-8');
        
        // Modify regex to search for the specific asset name (case-insensitive)
        const matches = [...readableData.matchAll(new RegExp(`${assetName}`, 'gi'))];

        // Return true if asset is found, otherwise false
        return {
            found: matches.length > 0,
            paktype: path.extname(pakFilePath).slice(1), // Get the package name without the dot
            assetName,
        };

    } catch (error) {
        console.error('Error reading pak file:', error.message);
        return {found: false}; // Return false in case of any error
    }
}


function checkPakForLogicModInZip(zipFilePath, assetName = 'ModActor.uasset') {
    try {
        const zip = new AdmZip(zipFilePath);
        const zipEntries = zip.getEntries().map(entry => ({
            entryName: entry.entryName,
            isDirectory: entry.isDirectory,
            size: entry.header.size,
            getData: () => entry.getData(),
        }));

        // Look for pak and utoc files in zip entries
        for (const entry of zipEntries) {
            // Check if the entry is a .pak or .utoc file
            if (!entry.isDirectory && (entry.entryName.endsWith('.pak') || entry.entryName.endsWith('.utoc'))) {
                const fileBuffer = entry.getData();
                const readableData = fileBuffer.toString('utf-8');

                // Check for asset name in the file
                const matches = [...readableData.matchAll(new RegExp(assetName, 'gi'))];

                if (matches.length > 0) {
                    return {
                        found: true,
                        paktype: path.extname(entry.entryName).slice(1), // Get the package name without the dot
                        fileName: entry.entryName,
                        assetName,
                    };
                }
            }
        }

        // If no asset was found
        return {
            found: false,
            assetName,
        };

    } catch (error) {
        console.error('Error processing zip file:', error.message);
        return { found: false }; // Return false in case of any error
    }
}



// Example usage
// const pakFile = path.resolve('./path/to/mod.pak');

const zipFilePath = 'D:/PalHUB/Client/cache/DekBasicMinimap-146-1-6-1719888515.zip';
const pakFilePath = 'C:/XboxGames/Palworld/Content/Pal/Content/Paks/LogicMods/DekBasicMinimap_P.pak';

console.log('-----')
const zipAssetFound = checkPakForLogicModInZip(zipFilePath);
const pakAssetFound = checkPakForLogicMod(pakFilePath);
console.log({pakAssetFound, zipAssetFound});

// inspectPakFile(pakFile);

// if (checkFileInPak(pakFile, fileToCheck)) {
//     console.log('The specified file DOES exist in the pak file.');
// } else {
//     console.log('The specified file does not exist in the pak file.');
// }