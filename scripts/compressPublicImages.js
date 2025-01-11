// Description: This script compresses all PNG images in a specified folder and its subfolders.
// It uses the sharp library to compress the images and save them in the same folder structure.
// The script can be run with Node.js and requires the sharp library to be installed.
// 
// The main purpose of this script is to reduce the size of PNG images in a project.
// Author: dekitarpg.@gmail.com (GPT assist)
//
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Usage: Specify input and output folders
const inputFolder = path.resolve("resources/uncompressed-public-images"); // input folder path
const outputFolder = path.resolve("renderer/public/img"); // converted file output folder path
const conversionType = "webp"; // "png" or "webp"

// Function to recursively find all PNG files in a folder and its subfolders
async function findPngFiles(dir) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const pngFiles = [];
    const imageTypes = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".webp"];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            const subfolderPngs = await findPngFiles(fullPath);
            pngFiles.push(...subfolderPngs);
        } else if (entry.isFile() && imageTypes.includes(path.extname(entry.name).toLowerCase())) {
            pngFiles.push(fullPath);
        }
    }

    return pngFiles;
}

// Function to compress a PNG file
async function compressPng(filePath, outputPath) {
    try {
        await sharp(filePath)
            .png({ quality: 80, compressionLevel: 9 })
            .toFile(outputPath);
        console.log(`Compressed: ${filePath}`);
    } catch (err) {
        console.error(`Failed to compress ${filePath}:`, err);
    }
}

// Function to compress and convert PNG to WebP
async function convertToWebP(filePath, outputPath) {
    try {
        // regexp checks for all image types
        const webpPath = outputPath.replace(/\.(png|jpg|jpeg|gif|bmp|tiff|webp)$/i, ".webp");
        await sharp(filePath)
            .webp({ quality: 80, lossless: false }) // Adjust quality for lossy or use lossless: true
            .toFile(webpPath);
        console.log(`Converted: ${filePath} -> ${webpPath}`);
    } catch (err) {
        console.error(`Failed to convert ${filePath}:`, err);
    }
}

// Ensure directory existence (custom implementation)
async function ensureDir(dir) {
    try {
        await fs.promises.mkdir(dir, { recursive: true });
    } catch (err) {
        if (err.code !== "EEXIST") throw err; // Ignore error if the directory exists
    }
}

// Main functions
async function compressAllPngs(inputFolder, outputFolder) {
    try {
        // Find all PNG files
        const pngFiles = await findPngFiles(inputFolder);

        // Compress each PNG
        for (const filePath of pngFiles) {
            const relativePath = path.relative(inputFolder, filePath);
            const outputPath = path.join(outputFolder, relativePath);

            // Ensure the output subfolder exists
            await ensureDir(path.dirname(outputPath));

            await compressPng(filePath, outputPath);
        }

        console.log("Compression complete!");
    } catch (err) {
        console.error("Error:", err);
    }
}

async function compressAllPngsToWebP(inputFolder, outputFolder) {
    try {
        // Find all PNG files
        const pngFiles = await findPngFiles(inputFolder);
    
        // Convert each PNG to WebP
        for (const filePath of pngFiles) {
            const relativePath = path.relative(inputFolder, filePath);
            const outputPath = path.join(outputFolder, relativePath);
    
            // Ensure the output subfolder exists
            await ensureDir(path.dirname(outputPath));
    
            await convertToWebP(filePath, outputPath);
        }
    
        console.log("Conversion to WebP complete!");
    } catch (err) {
        console.error("Error:", err);
    }
}

switch (conversionType) {
    case "png":
        compressAllPngs(inputFolder, outputFolder);
        break;
    case "webp":
        compressAllPngsToWebP(inputFolder, outputFolder);
        break;
    default:
        console.error("Invalid conversion type. Please specify 'png' or 'webp'.");
}
