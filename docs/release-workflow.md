# Edirom Online – Release Workflow

- `git checkout develop`
- have a look into release-milestone and manage last issues and PRs
- check third party dependencies
  - [ ] Verovio
  - [ ] [jQuery](https://github.com/Edirom/Edirom-Online-Frontend/blob/6c55fbaaa7063f823c8a2c2c6ed5c5359d6f69e2/index.html#L40), latest [jQuery release](https://releases.jquery.com) 
  - [ ] TEI stylesheets
  - [ ] Euryanthe
- `git checkout -b rel/2.3.0 develop`
- bump version
- commit version release branch
- build `.xar` and test it.
- `git checkout main`
- `git merge --no-ff rel/2.3.0` (release branch into main)
- propably resolve merge conflicts and `git continue merge`(?)
- `git tag` returns a list of all tags
- `git tag -a v2.3.0 -m "v2.3.0"`
- probably `git tag` for review
- `git push --follow-tags`
- on github.com: Go to tag and klick `Release from Tag`
- auto-generate the release description
- upload the tested `Edirom-Online-2.3.0.xar` (asset)
- publish the release on Github
- `git checkout develop`
- `git merge --no-ff rel/2.3.0` (release branch into develop)

first version of this file was written by @riedde, 22.12.2022 (wiki)
