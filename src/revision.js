import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolveRef } from './refs.js'
import { join as joinPath } from 'node:path'
import { resolveObject } from './objects.js'

function resolveHEAD() {
    const HEAD = readFileSync('.git/HEAD', 'utf8')
    if (HEAD.startsWith('ref: ')) { // symbolic ref
        return resolveRef(HEAD.substring(5).trim())
    }
    return HEAD.trim()
}

const revRegex = /([~^]\d?|@{.*?})/g
function parseSingleRevision(rev) {
    const [baseRev, ...rest] = rev.split(revRegex).filter(Boolean)
    const transformations = rest.map(value => {
        const modifier = value[0]
        if (modifier === '~' || modifier === '^') {
            return { modifier, value: parseInt(value.substring(1) || '1', 10) }
        }
        if (modifier === '@') {
            throw new Error('Time-based revisions are currently not supported')
        }
    })
    return [baseRev, transformations]
}

function followFirstParent(rev, depth) {
    if (depth === 0) return rev
    const commit = resolveObject(rev)
    return followFirstParent(commit.parents[0], depth - 1)
}

function followNthParent(rev, n) {
    const commit = resolveObject(rev)
    return commit.parents[n-1]
}

function applyTransformations(rev, transformations) {
    for (let transformation of transformations) {
        if (transformation.modifier === '~') {
            rev = followFirstParent(rev, transformation.value)
        }
        else if (transformation.modifier === '^') {
            rev = followNthParent(rev, transformation.value)
        }
    }
    return rev
}

export function resolveRevision(rev) {
    const [baseRev, transformations] = parseSingleRevision(rev)
    if (baseRev === 'HEAD') {
        return applyTransformations(resolveHEAD(), transformations)
    }
    if (existsSync(joinPath('.git/refs/tags', baseRev))) {
        return applyTransformations(resolveRef(`refs/tags/${baseRev}`), transformations)
    }
    if (existsSync(joinPath('.git/refs/heads', baseRev))) {
        return applyTransformations(resolveRef(`refs/heads/${baseRev}`), transformations)
    }
    // short commit
    // ranges
}
