import { readFileSync } from 'node:fs'
import { join as joinPath } from 'node:path'

export function resolveRef(ref) {
    return readFileSync(joinPath('.git', ref), 'utf8').trim()
}
