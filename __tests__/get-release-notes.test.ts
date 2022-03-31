import {getReleaseNotes} from '../src/get-release-notes'
import {gitCommand} from '../src/utils'

jest.mock('../src/utils')

const gitCommandMocked = gitCommand as jest.Mock
beforeEach(() => {
  gitCommandMocked.mockReset()
})

it('gets the git diff', async () => {
  gitCommandMocked.mockResolvedValue('* Commit 1\n* Commit 2\n')
  const result = await getReleaseNotes({
    prevReleaseTag: 'sandbox-20210715-01'
  })
  expect(gitCommandMocked).toHaveBeenCalledWith(
    'git --no-pager shortlog --no-merges sandbox-20210715-01..'
  )
  expect(result).toEqual('* Commit 1\n* Commit 2')
})

it('gets every commit since the beginning', async () => {
  gitCommandMocked.mockResolvedValue('* Commit 1\n* Commit 2\n')
  const result = await getReleaseNotes({
    prevReleaseTag: undefined
  })
  expect(gitCommandMocked).toHaveBeenCalledWith(
    'git --no-pager shortlog --no-merges HEAD'
  )
  expect(result).toEqual('* Commit 1\n* Commit 2')
})
