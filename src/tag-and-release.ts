import * as github from '@actions/github'
import {gitCommand} from './utils'

interface Options {
  githubToken: string
  repository: string
  tagName: string
  releaseDescription: string | undefined
  changelog: string
  releaseName: string
}

export async function tagAndRelease({
  githubToken,
  repository,
  tagName,
  releaseDescription,
  changelog,
  releaseName
}: Options): Promise<void> {
  const octokit = github.getOctokit(githubToken)
  const [owner, repoName] = repository.split('/')
  let body = changelog
  if (releaseDescription) {
    body = `${releaseDescription}\n${body}`
  }
  const commit = (await gitCommand('git rev-parse HEAD')).trim()
  await octokit.rest.repos.createRelease({
    owner,
    repo: repoName,
    tag_name: tagName,
    target_commitish: commit,
    name: releaseName,
    body
  })
}
