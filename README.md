<p align="center">
  <a href="https://github.com/Volusion2Dev/action-tag-and-release/actions"><img alt="typescript-action status" src="https://github.com/Volusion2Dev/action-tag-and-release/workflows/build-test/badge.svg"></a>
</p>

# Usage

```yaml
- uses: Volusion2Dev/action-tag-and-release@v1
  with:
    github_token: ${{ github.token }}
    environment: sandbox
    release_name: '[Release] - Sandbox'
    release_description: 'Optional description'
```

# Development

This is based on the [Typescript Action template](https://github.com/actions/typescript-action)

## Code in Main

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies

```bash
$ npm install
```

Build the typescript and package it for distribution

```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:

```bash
$ npm test
```

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:

```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Usage:

After testing you can [create a v1 branch](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action
