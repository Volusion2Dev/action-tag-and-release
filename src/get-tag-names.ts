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

interface TagData {
  name: string
  dateString: string
  number: number
}

export async function getTagNames({
  githubToken,
  repository,
  environment,
  currentDate = new Date()
}: Options): Promise<Result> {
  const [repoOwner, repoName] = repository.split('/')

  const octokit = github.getOctokit(githubToken)

  const currentDateString = format(currentDate, 'yyyyMMdd')

  const tags = []
  let pagesRemaining = true
  let page = 0
  while (pagesRemaining) {
    const {data} = await octokit.rest.repos.listTags({
      owner: repoOwner,
      repo: repoName,
      per_page: 100,
      page
    })
    tags.push(...data)
    page += 1
    if (data.length < 100) {
      pagesRemaining = false
    }
  }

  const relevantTags = tags
    .filter(it => it.name.startsWith(`${environment}-`))
    .map((tag): TagData => {
      const split = tag.name.split('-')
      return {
        name: tag.name,
        dateString: split[1],
        number: parseInt(split[2])
      }
    })

  const prevTagData = relevantTags.reduce(
    (mostRecent: TagData | null, next) => {
      if (!mostRecent) {
        return next
      }

      if (next.dateString.localeCompare(mostRecent.dateString) > 0) {
        return next
      }

      if (
        next.dateString === mostRecent.dateString &&
        next.number > mostRecent.number
      ) {
        return next
      }

      return mostRecent
    },
    null
  )

  const prevTagName = prevTagData && prevTagData.name

  // These names end with -01, -02, etc. to allow multiple releases in the same day
  // If there was already a release tag today, compute the next number in sequence
  const number =
    prevTagData && prevTagData.dateString === currentDateString
      ? prevTagData.number + 1
      : 1

  const nextTag = `${environment}-${currentDateString}-${number
    .toString()
    .padStart(2, '0')}`

  return {
    prevTag: prevTagName ?? undefined,
    nextTag
  }
}
