import * as core from '@actions/core'
import {getReleaseNames} from './get-release-names'
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

    const releaseNames = await getReleaseNames({
      githubToken,
      repository,
      environment
    })

    const changelog = await getReleaseNotes({
      prevRelease: releaseNames.prevRelease
    })
    await tagAndRelease({
      githubToken,
      changelog,
      releaseDescription,
      repository,
      releaseName,
      tagName: releaseNames.nextRelease
    })

    core.setOutput('release_name', releaseNames.nextRelease)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
