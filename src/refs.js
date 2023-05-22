import { readFileSync } from 'node:fs'

export function resolveHEAD() {
    const HEAD = readFileSync('.git/HEAD', 'utf8')
    if (HEAD.startsWith('ref: ')) {
        return resolveRef(HEAD.substring(5).trim())
    }
    return HEAD.trim()
}

export function resolveRef(ref) {
    return readFileSync(`.git/${ref}`, 'utf8').trim()
}
