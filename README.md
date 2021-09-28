# Grain's GitHub Action for Dispatching Workflows

This action triggers another GitHub Actions workflow, using the `workflow_dispatch` event.
The workflow must be configured for this event type e.g. `on: [workflow_dispatch]`

This allows you to chain workflows, the classic use case is have a CI build workflow, trigger a CD release/deploy workflow when it completes. Allowing you to maintain separate workflows for CI and CD, and pass data between them as required.

For details of the `workflow_dispatch` even see [this blog post introducing this type of trigger](https://github.blog/changelog/2020-07-06-github-actions-manual-triggers-with-workflow_dispatch/)

_Note 1._ The GitHub UI will report flows triggered by this action as "manually triggered" even though they have been run programmatically via another workflow and the API

_Note 2._ If you want to reference the target workflow by ID, you will need to list them with the following REST API call `curl https://api.github.com/repos/{{owner}}/{{repo}}/actions/workflows`

## Inputs

### `workflow`

**Required.** The name or ID of the workflow to trigger and run. This is the name declared in the YAML, not the filename

### `token`

**Required.** A GitHub access token (PAT) with write access to the repo in question. **NOTE.** The automatically provided token e.g. `${{ secrets.GITHUB_TOKEN }}` can not be used, GitHub prevents this token from being able to fire the `workflow_dispatch` and `repository_dispatch` event. [The reasons are explained in the docs](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#triggering-new-workflows-using-a-personal-access-token).

The solution is to manually create a PAT and store it as a secret e.g. `${{ secrets.PERSONAL_TOKEN }}`

### `ref`

**Required.** The Git reference used with the triggered workflow run. The reference can be a branch, tag, or a commit SHA. If omitted the context ref of the triggering workflow is used. If you want to trigger on pull requests and run the target workflow in the context of the pull request branch, set the ref to `${{ github.event.pull_request.head.ref }}`

### `repo`

**Required.** The default behavior is to trigger workflows in the same repo as the triggering workflow, if you wish to trigger in another GitHub repo "externally", then provide the owner + repo name with slash between them e.g. `grain-lang/grain-lang.org`

### `tag_input`

**Required.** The tag to send to other workflows as the _currently_ only `input` argument to the `workflow_dispatch` event type.

## Outputs

None

## Example usage

```yaml
- name: Update grain-lang.org
  uses: grain-lang/workflow-dispatch-action@v1
  with:
    workflow: Grain Release
    token: ${{ secrets.WORKFLOW_TOKEN }}
    ref: master
    repo: grain-lang/grain-lang.org
    tag_input: grain-v0.4.3
```

## Acknowledgements

This project is a fork of https://github.com/benc-uk/workflow-dispatch but adjusted for the needs of the [Grain Programming Language](https://grain-lang.org).
