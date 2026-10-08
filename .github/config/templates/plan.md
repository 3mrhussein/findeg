## %STATUS_EMOJI% Plan: %TIER% tier

%TIER_REASON%

| Setting             | Value           |
| ------------------- | --------------- |
| Workflow            | %WORKFLOW%      |
| Branch              | `%BRANCH%`      |
| Commit              | `%SHA%`         |
| Turbo flags         | `%TURBO_FLAGS%` |
| pnpm store cache    | %RESTORE_DEPS%  |
| Build caches        | %RESTORE_BUILD% |
| Cache save          | %SAVE_CACHE%    |
| Force build         | %FORCE_BUILD%   |
| Force clean install | %FORCE_INSTALL% |

### Jobs that will run

| Job         | Runs              |
| ----------- | ----------------- |
| Checks      | %RUN_CHECKS%      |
| Integration | %RUN_INTEGRATION% |
| E2E         | %RUN_E2E%         |
