/// <reference path="./types.ts" />

/**
 * @param {string} signatureString 
 * @returns {Signature}
 */
function parseSignature(signatureString) {
  const [name, email, timestamp, offset] = signatureString.split(' ');
  const date = new Date(parseInt(timestamp, 10) * 1000);
  const timezoneOffset = parseInt(offset.slice(0, 3), 10) * 60 + parseInt(offset.slice(3), 10);
  const dateWithOffset = new Date(date.getTime() + timezoneOffset * 60 * 1000);
  return {
    name,
    email: email.slice(1, -1),
    when: dateWithOffset,
  };
}

/**
 * @param {Buffer} buffer 
 * @returns {Commit}
 */
export function parseCommit(buffer) {
    const commitText = buffer.toString()
    const commitMessageStart = commitText.indexOf('\n\n')
    const commitHeaderEntries = commitText.substring(0, commitMessageStart).split('\n')

    const commit = {
        tree: '',
        parents: [],
        author: null,
        committer: null,
        message: commitText.substring(commitMessageStart + 2).trim(),
    }

    for (let entry of commitHeaderEntries) {
        if (entry.startsWith('tree ')) {
            commit.tree = entry.substring(5)
        } else if (entry.startsWith('parent ')) {
            commit.parents.push(entry.substring(7))
        } else if (entry.startsWith('author ')) {
            commit.author = parseSignature(entry.substring(7))
        } else if (entry.startsWith('committer ')) {
            commit.committer = parseSignature(entry.substring(10))
        } else {
            throw new Error(`Unexpected commit structure: ${commitText}`)
        }
    }

    return commit
}
