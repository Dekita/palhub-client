import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export function migrateFiles(oldAppName, newAppName, filesToMove, deleteOldFiles = false) {
    const appDataPath = app.getPath('appData');
    const oldAppDataFolder = path.join(appDataPath, oldAppName);
    const newAppDataFolder = path.join(appDataPath, newAppName);

    console.log(`Migration from ${oldAppDataFolder} to ${newAppDataFolder}`);

    // Check if the old app folder exists
    if (fs.existsSync(oldAppDataFolder)) {
        console.log(`Old app data folder detected: ${oldAppDataFolder}`);

        // Ensure the new app folder exists
        try {
            fs.mkdirSync(newAppDataFolder, { recursive: true });
            console.log(`Created new app data folder: ${newAppDataFolder}`);
        } catch (err) {
            console.error('Error creating new app data folder:', err);
            return;
        }

        // Copy specific files synchronously
        for (const file of filesToMove) {
            const oldFilePath = path.join(oldAppDataFolder, file);
            const newFilePath = path.join(newAppDataFolder, file);

            if (fs.existsSync(oldFilePath) && !fs.existsSync(newFilePath)) {
                try {
                    fs.copyFileSync(oldFilePath, newFilePath);
                    console.log(`Copied file: ${file}`);
                } catch (err) {
                    console.error(`Failed to copy file ${file}:`, err);
                }
            } else {
                console.warn(`File not found in old folder: ${file}`);
            }
        }

        // Optionally delete old files and folder
        if (deleteOldFiles) {
            try {
                const remainingFiles = fs.readdirSync(oldAppDataFolder);

                // Delete remaining files in the old folder
                for (const file of remainingFiles) {
                    fs.unlinkSync(path.join(oldAppDataFolder, file));
                }

                // Remove the old folder
                fs.rmdirSync(oldAppDataFolder, { recursive: true });
                console.log('Old app data folder and files deleted.');
            } catch (err) {
                console.error('Error deleting old app data folder or files:', err);
            }
        } else {
            console.log('Old app data folder retained as per configuration.');
        }
    } else {
        console.log('No old app data folder found. Skipping migration.');
    }
}
