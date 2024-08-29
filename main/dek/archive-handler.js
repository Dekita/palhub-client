/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
* Handles zip/rar archives
*/

import path from 'path';
import fs from 'fs/promises';
import AdmZip from 'adm-zip'; // for de-zip
import { createExtractorFromData } from 'node-unrar-js'; // for de-rar
import EventEmitter from "events";

class ArchiveHandler extends EventEmitter {
    constructor(filePath) {
        super();
        this.filePath = filePath;
        this.extension = path.extname(filePath).toLowerCase();
        this.entries = [];
    }

    async _loadEntries() {
        try {
            if (this.extension === '.zip') {
                this._loadZipEntries();
            } else if (this.extension === '.rar') {
                await this._loadRarEntries();
            } else {
                throw new Error('Unsupported file format');
            }
        } catch (error) {
            console.error(error);
        }
    }

    _loadZipEntries() {
        const zip = new AdmZip(this.filePath);
        this.entries = zip.getEntries().map(entry => ({
            entryName: entry.entryName,
            isDirectory: entry.isDirectory,
            size: entry.header.size,
            getData: () => entry.getData(),
        }));
    }

    // https://www.npmjs.com/package/node-unrar-js
    async _loadRarEntries() {
        const filedata = await fs.readFile(this.filePath);
        const buffer = Uint8Array.from(filedata).buffer;
        const extractor = await createExtractorFromData({data: buffer});
        // const list = extractor.getFileList();
        // const listArcHeader = list.arcHeader; // archive header
        // const fileHeaders = [...list.fileHeaders]; // load the file headers        
        const extracted = extractor.extract();
        const files = [...extracted.files]; //load the files

        this.entries = files.map(entry => ({
            entryName: entry.fileHeader.name,
            isDirectory: entry.fileHeader.flags.directory,
            size: entry.fileHeader.unpSize,
            getData: () => entry.extraction,
        }));
    }

    async getEntries() {
        if (this.entries.length === 0) {
            await this._loadEntries();
        }
        return this.entries;
    }

    async extractEntry(entry, outputPath) {
        if (!!!entry.outputPath) return;

        const outputFilePath = path.join(outputPath, entry.outputPath ?? entry.entryName);
        console.log('extracting:', entry.entryName, 'to:', outputFilePath);

        this.emit('extracting', {
            entry: entry.entryName,
            outputPath: outputFilePath,
        });

        if (entry.isDirectory) {
            await fs.mkdir(outputFilePath, { recursive: true });
        } else {
            await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
            await fs.writeFile(outputFilePath, await entry.getData());
        }
    }

    async extractAllTo(outputPath, overwrite = true, ignores = []) {
        console.log('extracting to:', outputPath);
        const entries = await this.getEntries();
        console.log('got entries:', entries);
        for (const entry of entries) {
            if (ignores.includes(entry.entryName)) {
                console.log('ignoring:', entry.entryName);
                continue;
            }
            await this.extractEntry(entry, outputPath);
        }
    }
}

export default ArchiveHandler;
