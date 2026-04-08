---
name: Release new version
about: Plan and subtasks for releasing a new version
title: "[rel] Release vX.Y.Z"
labels: ''
assignees: ''

---

based on [Edirom-Online Release Workflow](https://github.com/Edirom/Edirom-Online/blob/develop/docs/release-workflow.md)

Release preparation timeline
- [ ] create and plan next milestone (assign issues, set priorities, identify and name topic/s): *link milestone*
- [ ] set dates for test phase: DD.MM.YYYY - DD.MM.YYYY
- [ ] set date for release: DD.MM.YYYY
- [ ] send announcement about dates to community

Preparations on [zenodo.org](https://zenodo.org)
- [ ] go to previous version and click "New version"
- [ ] reserve a DOI -> *insert here*
- [ ] update version
- [ ] upload a placeholder file
- [ ] save draft -> *link here*

Prepare and checkout new release in branch
- [ ] have a look into release milestone and manage last issues and PRs
- [ ] `git checkout develop` and `git pull`
- [ ] `git checkout -b release/vX.Y.Z develop`
- [ ] update CITATION.cff (date, contributors, version, DOI)
- [ ] bump version numbers (also frontend/backend) everywhere (find/replace in code), e.g. in build.xml
- [ ] `git add [... changed files ...]` and `git commit -m "new version updates"`
- [ ] build and test it

Checkout main branch: `git checkout main`
- [ ] `git merge --no-ff release/vX.Y.Z` (release branch into main)
- [ ] (potentially) resolve merge conflicts and `git continue merge`
- [ ] `git tag` returns a list of all tags
- [ ] `git tag -a vX.Y.Z -m "vX.Y.Z"`
- [ ] (potentially) `git tag` for review
- [ ] `git push --follow-tags`

Release on [github.com](https://github.com) 
- [ ] Go to tag vX.Y.Z and click "Release from Tag"
- [ ] auto-generate the release description
- [ ] publish the release on GitHub - *link GitHub release*

Checkout develop branch: `git checkout develop`
- [ ] `git merge --no-ff release/vX.Y.Z` (release branch into develop)

Publication
- [ ] edit publication draft
- [ ] remove placeholder file and upload files copied from *GitHub release*
- [ ] update description (get "What's changed" section from GitHub Release info)
- [ ] double-check metadata
- [ ] publish on Zenodo (with updated files) -> *link publication DOI*
- [ ] Update Klarinettenquintett with new Edirom Online version

Clean-up
- [ ] delete branch *release/vX.Y.Z*
- [ ] announce new version to Edirom-Online community

Plan next release
- [ ] create new release issue
