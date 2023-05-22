type Signature = {
    name: string
    email: string
    when: Date
}

type Commit = {
    tree: string
    parents: string[]
    author: Signature
    committer: Signature
    message: string
}

type TreeEntry = {
    mode: string
    path: string
    hash: string
}

type Tree = {
    entries: TreeEntry[]
}
