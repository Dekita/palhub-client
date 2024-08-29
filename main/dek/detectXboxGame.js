/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

//! This code is only for Windows OS (used to detect if an Xbox game is installed on the system)
//! NON FUNCTIONAL DUE TO REQUIRE POWERSHELL ADMIN
//! ALSO RETURNS VIRTUALIZLED PATH DIRECTORY, NOT 
//! THE ACTUAL GAME INSTALLATION PATH

const { exec } = require('child_process');

function getInstalledXboxGames() {
    return new Promise((resolve, reject) => {
        const psCommand = 'Get-AppxPackage -AllUsers | Where-Object {$_.PackageFamilyName -like *Microsoft.GamingApp*} | Select-Object -Property Name, InstallLocation';

        exec(`powershell.exe -Command "${psCommand}"`, (error, stdout, stderr) => {
            if (error) {
                return reject(`Error: ${stderr}`);
            }
            
            const lines = stdout.trim().split('\n').slice(2); // Skip header lines
            const games = lines.map(line => {
                const [name, ...installLocationParts] = line.trim().split(/\s{2,}/);
                const installLocation = installLocationParts.join(' ');
                return { name, installLocation };
            });

            resolve(games);
        });
    });
}

export default async function detectXboxGameInstallation(gameName) {
    try {
        const games = await getInstalledXboxGames();
        const game = games.find(g => g.name.toLowerCase().includes(gameName.toLowerCase()));
        if (game) {
            console.log(`XBOX Game found at: ${game.installLocation}`);
        } else {
            console.log('XBOX Game not found');
        }
    } catch (error) {
        console.error('Error detecting XBOX game installation:', error);
    }
}

