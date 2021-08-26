import {formatLogs} from '../src/format-logs'

const singleCommitLog = `
Nils (1):
      ELEMENT-85 Collapsible Section Header: CSS feedback
`
const expectedSingleCommitLog = `
Nils (1):
* ELEMENT-85 Collapsible Section Header: CSS feedback
`

const complexLog = `
Chris Ruzin (2):
      [ELEMENT-45] Connect the rollback button to the V1 node API (#1001)
      Remove duped sidebar code in PageBuilder component (#1006)

Dallon Feldner (1):
      V2E-5575: dependency updates (#1003)

dgritter (1):
      ELEMENT-92 extract customerid from a token custom claim instead of user metadata (#1002)
`
const expectedComplexLog = `
Chris Ruzin (2):
* [ELEMENT-45] Connect the rollback button to the V1 node API (#1001)
* Remove duped sidebar code in PageBuilder component (#1006)

Dallon Feldner (1):
* V2E-5575: dependency updates (#1003)

dgritter (1):
* ELEMENT-92 extract customerid from a token custom claim instead of user metadata (#1002)
`

it('updates a simple log', () => {
  expect(formatLogs(singleCommitLog)).toEqual(expectedSingleCommitLog)
})

it('updates a complex log', () => {
  expect(formatLogs(complexLog)).toEqual(expectedComplexLog)
})
