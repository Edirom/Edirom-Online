# Edirom Online – Release Workflow

- `git checkout develop`
- have a look into release-milestone and manage last issues and PRs
- `git checkout -b rel/1.0.0 develop`
- bump version in build.xml
- commit version release branch
- build `.xar` and test it.
- `git checkout main`
- `git merge --no-ff rel/1.0.0` (release branch into main)
- propably resolve merge conflicts and `git continue merge`(?)
- `git tag` returns a list of all tags
- `git tag -a v1.0.0 -m "v1.0.0"`
- probably `git tag` for review
- `git push --follow-tags`
- on github.com: Go to tag and klick `Release from Tag`
- auto-generate the release description
- upload the tested `Edirom-Online-1.0.0.xar` (asset)
- publish the release on Github
- `git checkout develop`
- `git merge --no-ff rel/1.0.0` (release branch into develop)

first version of this file was written by @riedde, 22.12.2022 (wiki)
