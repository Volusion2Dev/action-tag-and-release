import * as core from '@actions/core'
import {formatLogs} from './format-logs'
import {getTagNames} from './get-tag-names'
import {getReleaseNotes} from './get-release-notes'
import {tagAndRelease} from './tag-and-release'

async function run(): Promise<void> {
  try {
    const repository = process.env.GITHUB_REPOSITORY
    const githubToken = core.getInput('github_token')
    const environment = core.getInput('environment')
    const releaseName = core.getInput('release_name')
    const releaseDescription = core.getInput('release_description')
    core.debug(`repository: ${repository}`)
    core.debug(`environment: ${releaseName}`)

    if (!repository) {
      throw new Error('`repository` is required')
    }
    if (!releaseName) {
      throw new Error('`release_name` is required')
    }

    const tagNames = await getTagNames({
      githubToken,
      repository,
      environment
    })

    const changelog = await getReleaseNotes({
      prevReleaseTag: tagNames.prevTag
    })
    const formattedChangelog = formatLogs(changelog)
    await tagAndRelease({
      githubToken,
      changelog: formattedChangelog,
      releaseDescription,
      repository,
      releaseName,
      tagName: tagNames.nextTag
    })

    core.setOutput('release_name', tagNames.nextTag)
  } catch (error) {
    core.setFailed(
      error instanceof Error || typeof error === 'string'
        ? error
        : 'An unexpected error occurred'
    )
  }
}

run()
