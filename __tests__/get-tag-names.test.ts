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

    listTags.mockImplementation(async opts => {
      const {page = 0, per_page} = opts as any
      expect(per_page).toBe(100)
      const offset = page * per_page
      const data = tagObjects.slice(offset, offset + per_page)
      return {
        status: 200,
        headers: {},
        url: '',
        data
      }
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

it('comes up with the correct tag name if tags come back from the API out of order', async () => {
  setupTagList([
    'sandbox-20210715-02',
    'sandbox-20210715-03',
    'sandbox-20210715-01'
  ])

  const result = await getTagNames({
    githubToken: 'GITHUB_TOKEN',
    repository: 'my/repo',
    environment: 'sandbox',
    currentDate: new Date('2021-07-15T15:13:04.754Z')
  })
  expect(result).toEqual({
    prevTag: 'sandbox-20210715-03',
    nextTag: 'sandbox-20210715-04'
  })
})

it('reads a paginated list', async () => {
  const tagList = []
  for (let i = 0; i < 50; i++) {
    tagList.push(`prod-20220407-${(i + 1).toString().padStart(0)}`)
  }
  for (let i = 0; i < 50; i++) {
    tagList.push(`prod-20220408-${(i + 1).toString().padStart(0)}`)
  }
  for (let i = 0; i < 50; i++) {
    tagList.push(`sandbox-20220407-${(i + 1).toString().padStart(0)}`)
  }
  for (let i = 0; i < 50; i++) {
    tagList.push(`sandbox-20220408-${(i + 1).toString().padStart(0)}`)
  }
  setupTagList(tagList)

  const sandboxResult = await getTagNames({
    githubToken: 'GITHUB_TOKEN',
    repository: 'my/repo',
    environment: 'sandbox',
    currentDate: new Date('2022-07-15T15:13:04.754Z')
  })
  expect(sandboxResult).toEqual({
    prevTag: 'sandbox-20220408-50',
    nextTag: 'sandbox-20220715-01'
  })
  const prodResult = await getTagNames({
    githubToken: 'GITHUB_TOKEN',
    repository: 'my/repo',
    environment: 'prod',
    currentDate: new Date('2022-07-15T15:13:04.754Z')
  })
  expect(prodResult).toEqual({
    prevTag: 'prod-20220408-50',
    nextTag: 'prod-20220715-01'
  })
})
