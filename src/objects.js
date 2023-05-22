import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

function parseAuthor(authorString) {
  const [name, email, timestamp, offset] = authorString.split(' ');
  const date = new Date(parseInt(timestamp, 10) * 1000);
  const timezoneOffset = parseInt(offset.slice(0, 3), 10) * 60 + parseInt(offset.slice(3), 10);
  const dateWithOffset = new Date(date.getTime() + timezoneOffset * 60 * 1000);
  return {
    name,
    email: email.slice(1, -1),
    timestamp: dateWithOffset,
  };
}

function parseCommit(buffer) {
    const commitText = buffer.toString()
    const commitMessageStart = commitText.indexOf('\n\n')
    const commitHeaderEntries = commitText.substring(0, commitMessageStart).split('\n')

    const commit = {
        tree: '',
        parents: [],
        author: '',
        committer: '',
        message: commitText.substring(commitMessageStart + 2).trim(),
    }

    for (let entry of commitHeaderEntries) {
        if (entry.startsWith('tree ')) {
            commit.tree = entry.substring(5)
        } else if (entry.startsWith('parent ')) {
            commit.parents.push(entry.substring(7))
        } else if (entry.startsWith('author ')) {
            commit.author = parseAuthor(entry.substring(7))
        } else if (entry.startsWith('committer ')) {
            commit.committer = parseAuthor(entry.substring(10))
        } else {
            throw new Error(`Unexpected commit structure: ${commitText}`)
        }
    }

    return commit
}

function parseTree(buffer) {
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

    return entries
}

export function resolveObjectRaw(hash) {
    const dir = hash.substring(0, 2)
    const file = hash.substring(2)
    return inflateSync(readFileSync(`.git/objects/${dir}/${file}`))
}

export function resolveObject(hash) {
    const objectContent = resolveObjectRaw(hash)
    const split = objectContent.indexOf(0)
    const objectHeader = objectContent.subarray(0, split).toString()
    const [objectType] = objectHeader.split(' ')

    if (objectType === 'commit') {
        return parseCommit(objectContent.subarray(split + 1))
    }
    if (objectType === 'tree') {
        return parseTree(objectContent.subarray(split + 1))
    }
    if (objectType === 'blob') {
        return objectContent.subarray(split + 1)
    }
}
