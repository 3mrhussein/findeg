#!/usr/bin/env bash
# Publishes the E2E failure screenshots of one run to the ci-evidence branch
# (served by GitHub Pages, so the E2E report can embed them) and prunes runs
# past retention. Called by the `Publish evidence` job in ci-jobs.yml.
#
# Usage: publish-evidence.sh <evidence-dir>
# Env:   RUN_ID, REPO_URL (https://…/owner/repo.git), GH_TOKEN, and the
#        GIT_AUTHOR_*/GIT_COMMITTER_* identity for the commits.
set -euo pipefail

evidence=$1
remote="https://x-access-token:${GH_TOKEN}@${REPO_URL#https://}"

git clone --quiet --branch ci-evidence --single-branch "$remote" site 2>/dev/null || {
  git init --quiet site
  git -C site checkout --quiet --orphan ci-evidence
  git -C site remote add origin "$remote"
}

# The artifact holds runner.temp/artifacts, so copy from <evidence>/artifacts to
# publish paths relative to it, matching the URLs the E2E report builds.
mkdir -p "site/runs/$RUN_ID"
if [ -d "$evidence/artifacts" ]; then
  (cd "$evidence/artifacts" && find . -type f \
    \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) -print0 |
    xargs -0 -I{} cp --parents {} "$OLDPWD/site/runs/$RUN_ID/")
fi
touch site/.nojekyll
git -C site add -A
git -C site commit --quiet -m "evidence: run $RUN_ID" || true

for path in site/runs/*/; do
  dir=$(basename "$path")
  echo "$dir $(git -C site log -1 --format=%ct -- "runs/$dir")"
done | node .github/scripts/ci-e2e-cli.mjs prune | while read -r old; do
  git -C site rm -rq "runs/$old"
done
git -C site commit --quiet -m "evidence: prune old runs" || true

git -C site push --quiet origin ci-evidence
