/// <reference path="./types.ts" />

/**
 * @param {Buffer} buffer 
 * @returns {Tree}
 */
export function parseTree(buffer) {
    const entries = []
    let offset = 0
    
    while (offset < buffer.length) {
        const split = buffer.indexOf(' ', offset)
        const mode = buffer.subarray(offset, split).toString()
        offset = split + 1
        const end = buffer.indexOf(0, offset)
        const path = buffer.subarray(offset, end).toString()
        offset = end + 21
        const hash = buffer.subarray(end + 1, offset).toString('hex')
        entries.push({ mode, path, hash })
    }

    return { entries }
}

// https://stackoverflow.com/questions/737673/how-to-read-the-mode-field-of-git-ls-trees-output
const modeToType = {
    '40000': 'tree',
    '100644': 'file',
    '100664': 'file',
    '100755': 'file',
    '120000': 'symlink',
    '160000': 'gitlink',
};
export function getEntryType(entry) {
  return modeToType[entry.mode] ?? 'unknown';
}
