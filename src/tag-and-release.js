import github from '@actions/github'
import {gitCommand} from './utils'

export async function tagAndRelease({
  githubToken,
  repository,
  tagName,
  releaseDescription,
  changelog,
  releaseName
}) {
  const octokit = github.getOctokit(githubToken)
  const [owner, repoName] = repository.split('/')
  let body = `\`\`\`\n${changelog}\n\`\`\``
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
