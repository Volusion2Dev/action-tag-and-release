import * as github from '@actions/github'
import {format} from 'date-fns'

interface Options {
  githubToken: string
  repository: string
  environment: string
  currentDate?: Date
}

interface Result {
  prevTag: string | undefined
  nextTag: string
}

export async function getTagNames({
  githubToken,
  repository,
  environment,
  currentDate = new Date()
}: Options): Promise<Result> {
  const [repoOwner, repoName] = repository.split('/')

  const octokit = github.getOctokit(githubToken)

  const dateString = format(currentDate, 'yyyyMMdd')

  const tags = (
    await octokit.rest.repos.listTags({
      owner: repoOwner,
      repo: repoName,
      per_page: 100
    })
  ).data

  const prevTagObj = tags.find(x => x.name.startsWith(`${environment}-`))
  const prevTagName = prevTagObj && prevTagObj.name
  const lastTagMatch =
    prevTagName && prevTagName.match(`^${environment}-${dateString}-([0-9]+)$`)

  // These names end with -01, -02, etc. to allow multiple releases in the same day
  // If there was already a release tag today, compute the next number in sequence
  let number = 1
  if (lastTagMatch) {
    number = parseInt(lastTagMatch[1], 10) + 1
  }

  const nextTag = `${environment}-${dateString}-${number
    .toString()
    .padStart(2, '0')}`

  return {
    prevTag: prevTagName,
    nextTag
  }
}
