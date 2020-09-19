import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  const octokit = github.getOctokit(core.getInput('github_token'))
  const reminderMessage = core.getInput('reminder_message')
  const pullRequestLifetimeHours = parseInt(
    core.getInput('pull_request_lifetime_hours'),
    10
  )

  try {
    const {data: pullRequests} = await octokit.pulls.list({
      ...github.context.repo,
      state: 'open'
    })

    for (const pr of pullRequests) {
      core.info(`pr title: ${pr.title}`)

      const pullRequestResponse = await octokit.graphql<PullRequestResponse>(
        `
        query($owner: String!, $name: String!, $number: Int!) {
          repository(owner: $owner, name: $name) {
            pullRequest(number: $number) {
              timelineItems(first: 50, itemTypes: [REVIEW_REQUESTED_EVENT]) {
                nodes {
                  __typename
                  ... on ReviewRequestedEvent {
                    createdAt
                  }
                }
              }
              comments(first: 100) {
                nodes {
                  body
                }
              }
            }
          }
        }
        `,
        {
          owner: github.context.repo.owner,
          name: github.context.repo.repo,
          number: pr.number
        }
      )

      if (
        pullRequestResponse.repository.pullRequest.timelineItems.nodes
          .length === 0
      ) {
        continue
      }

      const pullRequestCreatedAt =
        pullRequestResponse.repository.pullRequest.timelineItems.nodes[0]
          .createdAt

      const currentTime = new Date().getTime()
      const pullRequestLifetime =
        new Date(pullRequestCreatedAt).getTime() +
        1000 * 60 * 60 * pullRequestLifetimeHours

      core.info(
        `currentTime: ${currentTime} pullRequestLifetime: ${pullRequestLifetime}`
      )
      if (currentTime < pullRequestLifetime) {
        continue
      }

      const reminderComment = `@${pr.user.login}\n${reminderMessage}`
      const hasReminderComment =
        pullRequestResponse.repository.pullRequest.comments.nodes.filter(
          node => node.body.match(RegExp(reminderComment)) != null
        ).length > 0

      if (hasReminderComment) {
        continue
      }

      await octokit.issues.createComment({
        ...github.context.repo,
        issue_number: pr.number,
        body: reminderComment
      })

      core.info(
        `create comment issue_number: ${pr.number} body: ${reminderComment}`
      )
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

interface PullRequestResponse {
  repository: {
    pullRequest: {
      timelineItems: {
        nodes: {
          __typename: string
          createdAt: string
        }[]
      }
      comments: {
        nodes: {
          body: string
        }[]
      }
    }
  }
}

run()
