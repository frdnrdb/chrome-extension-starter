const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const filename = path.join(__dirname, 'extension.zip');
const folderToZip = path.join(__dirname, '..', 'build');

const zip = (filename, folder) => {
    const output = fs.createWriteStream(filename);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.log('--->', archive.pointer() + ' bytes saved to', filename);
    });

    archive.pipe(output);
    archive.directory(folder, false);
    archive.finalize();
};

zip(filename, folderToZip);