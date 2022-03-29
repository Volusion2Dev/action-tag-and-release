import {getTagNames} from '../src/get-tag-names'
import * as github from '@actions/github'

jest.mock('@actions/github', () => ({
  __esModule: true,
  getOctokit: jest.fn()
}))

type Octokit = ReturnType<typeof github['getOctokit']>
type ListTagsFn = Octokit['rest']['repos']['listTags']
type ListTagsResult = ReturnType<ListTagsFn> extends Promise<infer T>
  ? T
  : never
type TagResult = ListTagsResult['data'] extends (infer T)[] ? T : never

function setupTagList(tags?: string[]): jest.Mock {
  const listTags = jest.fn<Promise<ListTagsResult>, Parameters<ListTagsFn>>()
  const octokit = {
    rest: {
      repos: {
        listTags
      }
    }
  }
  ;(github.getOctokit as jest.Mock).mockReturnValue(octokit)

  if (tags) {
    const tagObjects = tags.map(x => ({
      name: x
    })) as TagResult[]
    listTags.mockResolvedValue({
      status: 200,
      headers: {},
      url: '?',
      data: tagObjects
    })
  }

  return listTags
}

it('makes a brand new tag name', async () => {
  setupTagList([])

  const result = await getTagNames({
    githubToken: 'GITHUB_TOKEN',
    repository: 'my/repo',
    environment: 'sandbox',
    currentDate: new Date('2021-07-15T15:13:04.754Z')
  })
  expect(result).toEqual({
    prevTag: undefined,
    nextTag: 'sandbox-20210715-01'
  })
})

it('increments tag numbers when a previous tag is found', async () => {
  setupTagList(['sandbox-20210715-02', 'sandbox-20210715-01'])

  const result = await getTagNames({
    githubToken: 'GITHUB_TOKEN',
    repository: 'my/repo',
    environment: 'sandbox',
    currentDate: new Date('2021-07-15T15:13:04.754Z')
  })
  expect(result).toEqual({
    prevTag: 'sandbox-20210715-02',
    nextTag: 'sandbox-20210715-03'
  })
})

it("doesn't increment if the previous tag is from another day", async () => {
  setupTagList(['sandbox-20210714-01'])

  const result = await getTagNames({
    githubToken: 'GITHUB_TOKEN',
    repository: 'my/repo',
    environment: 'sandbox',
    currentDate: new Date('2021-07-15T15:13:04.754Z')
  })
  expect(result).toEqual({
    prevTag: 'sandbox-20210714-01',
    nextTag: 'sandbox-20210715-01'
  })
})

it("doesn't increment if the previous tag is from another environment", async () => {
  setupTagList(['sandbox-20210715-01'])

  const result = await getTagNames({
    githubToken: 'GITHUB_TOKEN',
    repository: 'my/repo',
    environment: 'prod',
    currentDate: new Date('2021-07-15T15:13:04.754Z')
  })
  expect(result).toEqual({
    prevTag: undefined,
    nextTag: 'prod-20210715-01'
  })
})

it('passes values through the API', async () => {
  const listTags = setupTagList([])
  await getTagNames({
    githubToken: 'GITHUB_TOKEN',
    repository: 'my/repo',
    environment: 'sandbox',
    currentDate: new Date('2021-07-15T15:13:04.754Z')
  })
  expect(github.getOctokit as jest.Mock).toHaveBeenCalledWith('GITHUB_TOKEN')
  expect(listTags).toHaveBeenCalledWith(
    expect.objectContaining({
      owner: 'my',
      repo: 'repo'
    })
  )
})
