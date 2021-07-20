import childProcess from 'child_process'
import {promisify} from 'util'
const exec = promisify(childProcess.exec)

export async function gitCommand(command: string): Promise<string> {
  try {
    const {stdout} = await exec(command, {
      encoding: 'utf8'
    })
    return stdout
  } catch (err) {
    throw new Error(`Exit Code ${err.code}: ${err.stderr}`)
  }
}
