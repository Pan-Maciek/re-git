import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { parseCommit } from "./commit.js";
import { parseTree } from "./tree.js";
import { resolveObjectRaw } from "./storage.js";

/**
 * @param {string} hash 
 * @returns {Buffer}
 */
export function resolveObjectRaw(hash) {
    const dir = hash.substring(0, 2)
    const file = hash.substring(2)
    return inflateSync(readFileSync(`.git/objects/${dir}/${file}`))
}

export function resolveObject(hash) {
    const objectContent = resolveObjectRaw(hash)
    const split = objectContent.indexOf(0)

    const header = objectContent.subarray(0, split)
    const payload = objectContent.subarray(split + 1)

    const [objectType] = header.toString().split(' ')

    if (objectType === 'commit') {
        return parseCommit(payload)
    }
    if (objectType === 'tree') {
        return parseTree(payload)
    }
    if (objectType === 'blob') {
        return payload
    }
    throw new Error(`Unknown object type ${objectType}`)
}
