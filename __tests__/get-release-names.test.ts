import {getReleaseNames} from '../src/get-release-names'
import github from '@actions/github'

jest.mock('@actions/github', () => ({
  __esModule: true,
  default: {
    getOctokit: jest.fn()
  }
}))

type Octokit = ReturnType<typeof github['getOctokit']>
type ListReleasesFn = Octokit['rest']['repos']['listReleases']
type ListReleasesResult = ReturnType<ListReleasesFn> extends Promise<infer T>
  ? T
  : never
type Release = ListReleasesResult['data'] extends (infer T)[] ? T : never

function setupReleaseList(tags?: string[]): jest.Mock {
  const listReleases = jest.fn<
    Promise<ListReleasesResult>,
    Parameters<ListReleasesFn>
  >()
  const octokit = {
    rest: {
      repos: {
        listReleases
      }
    }
  }
  ;(github.getOctokit as jest.Mock).mockReturnValue(octokit)

  if (tags) {
    const releases = tags.map(x => ({
      tag_name: x
    })) as Release[]
    listReleases.mockResolvedValue({
      status: 200,
      headers: {},
      url: '?',
      data: releases
    })
  }

  return listReleases
}

it('makes a brand new release name', async () => {
  setupReleaseList([])

  const result = await getReleaseNames({
    githubToken: 'GITHUB_TOKEN',
    repository: 'my/repo',
    environment: 'sandbox',
    currentDate: new Date('2021-07-15T15:13:04.754Z')
  })
  expect(result).toEqual({
    prevRelease: undefined,
    nextRelease: 'sandbox-20210715-01'
  })
})
