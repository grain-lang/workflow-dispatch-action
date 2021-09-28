// ----------------------------------------------------------------------------
// Copyright (c) Ben Coleman, 2020
// Licensed under the MIT License.
//
// Workflow Dispatch Action - Main task code
// ----------------------------------------------------------------------------

import * as core from "@actions/core";
import * as github from "@actions/github";

//
// Main task function (async wrapper)
//
async function run(): Promise<void> {
  try {
    // Required inputs
    const token = core.getInput("token");
    const workflowRef = core.getInput("workflow");
    const ref = core.getInput("ref");
    const [owner, repo] = core.getInput("repo").split("/");
    const tag = core.getInput("tag_input");

    // Get octokit client for making API calls
    const octokit = github.getOctokit(token);

    // List workflows via API, and handle paginated results
    const workflows = await octokit.paginate(
      octokit.rest.actions.listRepoWorkflows,
      {
        owner,
        repo,
      },
      (resp) => resp.data
    );

    // Debug response if ACTIONS_STEP_DEBUG is enabled
    core.debug("### START List Workflows response data");
    core.debug(JSON.stringify(workflows, null, 3));
    core.debug("### END:  List Workflows response data");

    // Locate workflow either by name or id
    const workflow = workflows.find(
      (workflow) =>
        workflow.name === workflowRef || workflow.id.toString() === workflowRef
    );
    if (!workflow) {
      throw new Error(
        `Unable to find workflow '${workflowRef}' in ${owner}/${repo} 😥`
      );
    }
    console.log(`Workflow id is: ${workflow.id}`);

    // Call workflow_dispatch API
    const dispatchResp = await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: workflow.id,
      ref,
      inputs: { tag },
    });
    core.info(`API response status: ${dispatchResp.status} 🚀`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("Unknown error occurred");
    }
  }
}

//
// Call the main task run function
//
run();
