 [![reminder-test](https://github.com/tommykw/pull-request-reviewee-reminder-action/actions/workflows/test.yml/badge.svg)](https://github.com/tommykw/pull-request-reviewee-reminder-action/actions/workflows/test.yml)

# Pull Request reviewee reminder action

## Summary
Action to send Github mentions when there are pull requests that has exceeded the lifetime. This action generated from [actions/typescript-action](https://github.com/actions/hello-world-javascript-action). If the pull request is alive within the specified time, they will send a mention to the github reviewee. This is useful if you have a long lived pull request.

## Setup
Create a file with the following content under `.github/workflows/pull-request-reviewee-reminder.yml`.

```yml
name: 'Pull request reviewee reminder'
on:
  schedule:
    # Check pull requests every weekday, 10:00 and 17:00
    - cron: '0 10,17 * * 1-5'
    
jobs:
  pull-request-reviewee-reminder: 
    runs-on: ubuntu-latest
    steps:
      - uses: tommykw/pull-request-reviewee-reminder-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }} # Required
          reminder_message: 'The pull request has been alive for more than 2 days. Let's work with priority.' # Required. Messages to send to reviewee on Github.
          pull_request_lifetime_hours: 48 # Required. This is a lifetime of pull request. If this time is exceeded, a reminder wil be send.
```

## License

MIT
