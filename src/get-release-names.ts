import * as github from '@actions/github'
import {format} from 'date-fns'

interface Options {
  githubToken: string
  repository: string
  environment: string
  currentDate?: Date
}

interface Result {
  prevRelease: string | undefined
  nextRelease: string
}

export async function getReleaseNames({
  githubToken,
  repository,
  environment,
  currentDate = new Date()
}: Options): Promise<Result> {
  const [repoOwner, repoName] = repository.split('/')

  const octokit = github.getOctokit(githubToken)

  const dateString = format(currentDate, 'yyyyMMdd')

  const releases = (
    await octokit.rest.repos.listReleases({
      owner: repoOwner,
      repo: repoName
    })
  ).data

  const prevReleaseObj = releases.find(x =>
    x.tag_name.startsWith(`${environment}-`)
  )
  const prevRelease = prevReleaseObj && prevReleaseObj.tag_name
  const lastReleaseMatch =
    prevRelease && prevRelease.match(`^${environment}-${dateString}-([0-9]+)$`)

  // These names end with -01, -02, etc. to allow multiple releases in the same day
  // If there was already a release today, compute the next number in sequence
  let number = 1
  if (lastReleaseMatch) {
    number = parseInt(lastReleaseMatch[1], 10) + 1
  }

  const nextRelease = `${environment}-${dateString}-${number
    .toString()
    .padStart(2, '0')}`

  return {
    prevRelease,
    nextRelease
  }
}
