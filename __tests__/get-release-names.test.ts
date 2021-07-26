import {getReleaseNames} from '../src/get-release-names'
import * as github from '@actions/github'

jest.mock('@actions/github', () => ({
  __esModule: true,
  getOctokit: jest.fn()
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

it('increments release numbers when a previous release is found', async () => {
  setupReleaseList(['sandbox-20210715-02', 'sandbox-20210715-01'])

  const result = await getReleaseNames({
    githubToken: 'GITHUB_TOKEN',
    repository: 'my/repo',
    environment: 'sandbox',
    currentDate: new Date('2021-07-15T15:13:04.754Z')
  })
  expect(result).toEqual({
    prevRelease: 'sandbox-20210715-02',
    nextRelease: 'sandbox-20210715-03'
  })
})

it("doesn't increment if the previous release is from another day", async () => {
  setupReleaseList(['sandbox-20210714-01'])

  const result = await getReleaseNames({
    githubToken: 'GITHUB_TOKEN',
    repository: 'my/repo',
    environment: 'sandbox',
    currentDate: new Date('2021-07-15T15:13:04.754Z')
  })
  expect(result).toEqual({
    prevRelease: 'sandbox-20210714-01',
    nextRelease: 'sandbox-20210715-01'
  })
})

it("doesn't increment if the previous release is from another environment", async () => {
  setupReleaseList(['sandbox-20210715-01'])

  const result = await getReleaseNames({
    githubToken: 'GITHUB_TOKEN',
    repository: 'my/repo',
    environment: 'prod',
    currentDate: new Date('2021-07-15T15:13:04.754Z')
  })
  expect(result).toEqual({
    prevRelease: undefined,
    nextRelease: 'prod-20210715-01'
  })
})

it('passes values through the API', async () => {
  const listReleases = setupReleaseList([])
  await getReleaseNames({
    githubToken: 'GITHUB_TOKEN',
    repository: 'my/repo',
    environment: 'sandbox',
    currentDate: new Date('2021-07-15T15:13:04.754Z')
  })
  expect(github.getOctokit as jest.Mock).toHaveBeenCalledWith('GITHUB_TOKEN')
  expect(listReleases).toHaveBeenCalledWith({
    owner: 'my',
    repo: 'repo'
  })
})
