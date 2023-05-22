import { resolveObject } from "./objects.js";

// https://stackoverflow.com/questions/737673/how-to-read-the-mode-field-of-git-ls-trees-output
const modeToType = {
    '40000': 'tree',
    '100644': 'file',
    '100664': 'file',
    '100755': 'file',
    '120000': 'symlink',
    '160000': 'gitlink',
};
function getEntryType(entry) {
  return modeToType[entry.mode] ?? 'unknown';
}

export function resolveTree(hash) {
  const subtree = new Map();
  const entries = resolveObject(hash);
  for (let entry of entries) {
    switch (getEntryType(entry)) {
      case 'tree':
        subtree.set(entry.path, resolveTree(entry.hash));
        break;
      case 'file':
        subtree.set(entry.path, { type: 'file', hash: entry.hash }); // todo unix mode
        break;
      case 'symlink':
        subtree.set(entry.path, { type: 'symlink', hash: entry.hash });
        break;
      case 'gitlink':
        subtree.set(entry.path, { type: 'gitlink', hash: entry.hash });
        break;
      default:
        throw new Error(`Unexpected tree entry. Tree ${hash}, entry: ${entry}`);
    }
  }
  return subtree;
}
