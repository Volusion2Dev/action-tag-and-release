import {gitCommand} from './utils'

interface Options {
  prevRelease: string | undefined
}

export async function getReleaseNotes({prevRelease}: Options): Promise<string> {
  const command = `git --no-pager shortlog --no-merges ${
    prevRelease ? `${prevRelease}..` : 'HEAD'
  }`
  const changelog = await gitCommand(command)
  return changelog.trimEnd()
}
