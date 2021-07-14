import {gitCommand} from './utils'

export async function getReleaseNotes({prevRelease}) {
  const command = `git --no-pager shortlog --no-merges ${
    prevRelease ? `${prevRelease}..` : 'HEAD'
  }`
  const changelog = await gitCommand(command)
  return changelog.trimEnd()
}
