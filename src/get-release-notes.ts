import {gitCommand} from './utils'

interface Options {
  prevReleaseTag: string | undefined
}

export async function getReleaseNotes({
  prevReleaseTag
}: Options): Promise<string> {
  const command = `git --no-pager shortlog --no-merges ${
    prevReleaseTag ? `${prevReleaseTag}..` : 'HEAD'
  }`
  const changelog = await gitCommand(command)
  return changelog.trimEnd()
}
