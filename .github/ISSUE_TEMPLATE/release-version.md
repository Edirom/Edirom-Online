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
- [ ] reserve a DOI -> *insert DOI here*
- [ ] update version
- [ ] upload a placeholder file
- [ ] save draft -> *insert link to draft here*

Prepa
Prepare and checkout new release in branch
- [ ] have a look into release milestone and manage last issues and PRs
- [ ] `git checkout develop`
- [ ] `git pull`
- [ ] `git checkout -b release/vX.Y.Z develop`
- [ ] update CITATION.cff (date, contributors, version, DOI)
- [ ] bump version number everywhere (find/replace in code), e.g. in build.xml
- [ ] `git add [... changed files ...]`
- [ ] `git commit -m "new version updates"`
- [ ] build and test it

Merge release into main branch: 
- [ ] `git checkout main`
- [ ] `git merge release/vX.Y.Z`
- [ ] `git tag -a vX.Y.Z -m "vX.Y.Z"`
- [ ] `git push --follow-tags`
- [ ] `git branch -d release/vX.Y.Z`

Release on [github.com](https://github.com) 
- [ ] Go to tag vX.Y.Z and click "Release from Tag"
- [ ] auto-generate the release description
- [ ] upload tested xar as Edirom-Online-X.Y.Z.xar (as release asset)
- [ ] publish the release on GitHub - *insert link to GitHub release here*
- [ ] create PR to merge main branch into develop

Publication
- [ ] edit publication draft
- [ ] remove placeholder file and upload files copied from *GitHub release*
- [ ] update description (get "What's changed" section from GitHub Release info)
- [ ] double-check metadata
- [ ] publish on Zenodo (with updated files) -> *link publication DOI*
- [ ] Update Klarinettenquintett with new Edirom Online version

Clean-up
- [ ] delete branch *release/vX.Y.Z*
- [ ] announce new version/s to Edirom-Online community

Plan next release
- [ ] create new release issue
