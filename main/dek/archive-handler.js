import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';
import { createExtractorFromData } from 'node-unrar-js';
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
        // convnert bffer to array buffer
        // const arraybuffer = new Uint8Array(filedataBuffer).buffer;

        const extractor = await createExtractorFromData({data: buffer});
        const list = extractor.getFileList();
        const listArcHeader = list.arcHeader; // archive header
        const fileHeaders = [...list.fileHeaders]; // load the file headers        
        // console.log({list, listArcHeader, fileHeaders});
        const extracted = extractor.extract();
        // console.log({extracted});
        const files = [...extracted.files]; //load the files
        // console.log({files});

        this.entries = files.map(entry => ({
            entryName: entry.fileHeader.name,
            isDirectory: entry.fileHeader.flags.directory,
            size: entry.fileHeader.unpSize,
            getData: () => entry.extraction,
        }));
        // console.log('this.entries:', this.entries);
    }

    async getEntries() {
        if (this.entries.length === 0) {
            await this._loadEntries();
        }
        return this.entries;
    }

    async extractEntry(entry, outputPath) {
        if (!!!entry.outputPath) return;

        // const outputFilePath = path.join(outputPath, entry.entryName);
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

    async wait(ms=3000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async extractAllTo(outputPath, overwrite = true, ignores = []) {
        console.log('extracting to:', outputPath);
        // await this.wait();
        const entries = await this.getEntries();
        console.log('got entries:', entries);
        for (const entry of entries) {
            if (ignores.includes(entry.entryName)) {
                console.log('ignoring:', entry.entryName);
                continue;
            }
            // await this.wait();
            await this.extractEntry(entry, outputPath);
            // await this.wait();
            // const outputFilePath = path.join(outputPath, entry.entryName);
            // const fileExists = await fs.access(outputFilePath).then(() => true).catch(() => false);
            // if (overwrite || !fileExists) {
            //     await this.extractEntry(entry, outputPath);
            // }
        }
    }
}

export default ArchiveHandler;
