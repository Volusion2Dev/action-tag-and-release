<p align="center">
  <a href="https://github.com/Volusion2Dev/action-tag-and-release/actions"><img alt="typescript-action status" src="https://github.com/Volusion2Dev/action-tag-and-release/workflows/build-test/badge.svg"></a>
</p>

# Usage

```yaml
- uses: actions/checkout@v2
  with:
    fetch-depth: 0 # this is necessary to get a list of commits

# ...

- uses: Volusion2Dev/action-tag-and-release@v1
  with:
    github_token: ${{ github.token }}
    environment: sandbox
    release_name: '[Release] - Sandbox'
    release_description: 'Optional description'
```

## Inputs

### github_token

Token for accessing the repository. Should just be `${{ github.token }}` most of the time!

### environment

The environment of the release; will be used as a prefix to the tag name. Ex. if you provide `sandbox`, a tag might be `sandbox-20210720-01`.

### release_name

The name of the release in GitHub.

### release_description

A line to put at the beginning of the release notes.

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
