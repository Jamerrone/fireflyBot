const axios = require('axios');
const firefly = require('./firefly/commands/shared');

async function getFile(url) {
  try {
    const response = await axios(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

function getTitle(issuesAmount) {
  switch (issuesAmount) {
    case 0:
      return 'No Issues Found';

    case 1:
      return '1 Invalid File Found';

    default:
      return `${issuesAmount} Invalid Files Found`;
  }
}

async function handlePullRequestChange(context) {
  const pr = context.payload.pull_request;

  if (!pr || pr.state !== 'open') {
    return;
  }

  const org = pr.base.repo.owner.login;
  const repo = pr.base.repo.name;

  const files = await context.github.pullRequests.listFiles({
    number: pr.number,
    owner: org,
    repo
  });

  const issues = [];
  for (const {filename, raw_url, blob_url} of files.data) {
    if (raw_url.endsWith('.css')) {
      const css = await getFile(raw_url);
      const fireflyReport = firefly(filename, blob_url, css);
      if (fireflyReport) {
        issues.push(fireflyReport);
      }
    }
  }

  const actionRequired = issues.length > 0;
  const conclusion = actionRequired ? 'action_required' : 'success';
  const title = getTitle(issues.length);
  const summary = issues.join('\n\n');

  return context.github.checks.create({
    owner: org,
    repo,
    name: 'Firefly Bot',
    head_sha: pr.head.sha,
    status: 'completed',
    conclusion,
    completed_at: new Date().toISOString(),
    output: {
      title,
      summary
    }
  });
}

module.exports = app => {
  app.on(['pull_request'], handlePullRequestChange);
};
