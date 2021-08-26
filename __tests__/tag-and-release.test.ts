import * as github from '@actions/github'
import {gitCommand} from '../src/utils'
import {tagAndRelease} from '../src/tag-and-release'

jest.mock('../src/utils')

jest.mock('@actions/github', () => ({
  __esModule: true,
  getOctokit: jest.fn()
}))

function setupCreateRelease(): jest.Mock {
  const createRelease = jest.fn()
  const octokit = {
    rest: {
      repos: {
        createRelease
      }
    }
  }
  ;(github.getOctokit as jest.Mock).mockReturnValue(octokit)

  return createRelease
}
beforeEach(() => {
  ;(gitCommand as jest.Mock).mockReset()
  ;(gitCommand as jest.Mock).mockImplementation(async (command: string) => {
    if (command === 'git rev-parse HEAD') {
      return 'tEsTcOmMiT'
    }
  })
})

it('should create a release', async () => {
  const createRelease = setupCreateRelease()
  await tagAndRelease({
    githubToken: 'GITHUB_TOKEN',
    tagName: 'sandbox-20210716-01',
    repository: 'my/repo',
    changelog: '* Commit 1\n* Commit 2',
    releaseName: '[Release] - Sandbox',
    releaseDescription: undefined
  })
  expect(createRelease).toHaveBeenCalledTimes(1)
  expect(createRelease.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      Object {
        "body": "* Commit 1
    * Commit 2",
        "name": "[Release] - Sandbox",
        "owner": "my",
        "repo": "repo",
        "tag_name": "sandbox-20210716-01",
        "target_commitish": "tEsTcOmMiT",
      },
    ]
  `)
})

it('should add a description to release body', async () => {
  const createRelease = setupCreateRelease()
  await tagAndRelease({
    githubToken: 'GITHUB_TOKEN',
    tagName: 'sandbox-20210716-01',
    repository: 'my/repo',
    changelog: '* Commit 1\n* Commit 2',
    releaseName: '[Release] - Sandbox',
    releaseDescription: 'This is a test description'
  })
  const {body} = createRelease.mock.calls[0][0]
  expect(body).toMatchInlineSnapshot(`
    "This is a test description

    * Commit 1
    * Commit 2"
  `)
})
