# Edirom Online Contributing Guidelines

- [How to contribute](#how-to-contribute)
  * [Bug reports](#bug-reports)
  * [Feature requests](#feature-requests)
  * [Contributing code and documentation](#contributing-code-and-documentation)
    + [Commit messages](#commit-messages) 
- [Release Process](#release-process)
- [Versioning](#versioning)

## How to contribute

Edirom-Online is a free and open-source software and we appreciate to receive contributions from our community!  
So first of all, thank you for considering contributing to Edirom-Online! When you do so, please try to follow these guidelines.

### Bug reports

If you think you found a bug in Edirom-Online, first please search our [issues list](https://github.com/Edirom/Edirom-Online/issues) in case a similar issue has already been opened. If not, please [open an issue](https://github.com/Edirom/Edirom-Online/issues/new?assignees=&labels=&projects=&template=problem-report.md&title=%5BBUG%5D). We implemented a [template](https://github.com/Edirom/Edirom-Online/blob/develop/.github/ISSUE_TEMPLATE/problem-report.md) for problems and bugs to get as much information about the bug as possible, e.g. how the problem can be reproduced. Provide as much information as you can.

### Feature requests

If you think, Edirom-Online should have a feature that does not exist already, please search our [issues list](https://github.com/Edirom/Edirom-Online/issues) in case a wish for a similar feature was already reported. If not, please [open an issue](https://github.com/Edirom/Edirom-Online/issues/new?assignees=&labels=Type%3A+feature+request&projects=&template=feature_request.md&title=%5Bftr%5D) and describe the feature using our [template](https://github.com/Edirom/Edirom-Online/blob/develop/.github/ISSUE_TEMPLATE/feature_request.md) for new features. 

### Contributing code and documentation

If you would like to contribute to Edirom-Online developing a new feature or working on a bug fix, your contribution is highly appreciated and we kindly ask you to take the following guidelines into concern. 
The active contributors have agreed to organise their work along the so-called 'git-flow-workflow' ([Driessen 2010](https://nvie.com/posts/a-successful-git-branching-model/)) to foster a clean and traceable development process. The following instructions will ensure this workflow.

* Check the [network graph](https://github.com/Edirom/Edirom-Online/network) to see all the other forks of other persons to make sure, nobody else is already working on the topic, you want to start to address.
* Please discuss your idea first in an [issue](https://github.com/Edirom/Edirom-Online/issues). If there is no issue for your idea yet, please **open an issue**. There might be different ways to solve a problem and we want to make sure to find the right approach before spending time on a PR that cannot be merged.
* **Fork** the `Edirom/Edirom-Online` repository into your own account, e.g. `username/Edirom-Online`. (Exception: If you plan to develop in a team (only in this case!), open a dedicated branch on the Edirom-Online repository.)
* Create a **dedicated branch** for your fix or feature on your repository, e.g. `ftr-some-new-feature`.
* Make your changes, while you can commit to your branch as many times as you like.
* It is essential to **test** your modifications before committing or issuing a pull request. A recommended way is running a local eXist-db v5.3.0+ container and deploying your local build of Edirom Online together with some test-data, e.g. the [Edirom Edition Example](https://github.com/Edirom/EditionExample). For other deployment methods, please see our documentation in the [wiki](https://github.com/Edirom/Edirom-Online/wiki). 
* After finishing your work, you can open a **pull request** to `Edirom/Edirom-Online` and fill in our [PR-template](https://github.com/Edirom/Edirom-Online/tree/develop/.github/pull_request_template.md) to describe what your pull request wants to implement. Make sure, that you MUST address the developer-branch.
* Each pull request should implement ONE feature or bugfix. If you want to add or fix more than one thing, submit more than one pull request.
* Your submission will be **reviewed** afterwards. If you are asked to make changes, you can push these changes to your original branch and the pull request will be automatically updated.
* You may then delete your dedicated branch, after your pull request was merged into the `Edirom/Edirom-Online` repository.

#### Commit messages

Please make sure to provide meaningful and understandable commit messsages, that should have the following structure and content:
* `summary`: use imperative and summarize changes in around 50 characters or less, e.g. "Remove deprecated methods"  
* `body`: explain what, why and how e.g. "This commit adds ... Specifically, we have added ..."
* `footer`: reference or close issues using e.g. `Refs #123, 456` or `Refs #206`or `Fixes #210` or `Closes #789`

## Release Process

Releases are discussed and declared by the Edirom community. The planned scope of features and bug fixes of upcoming releases can be read from corresponding [milestones](https://github.com/Edirom/Edirom-Online/milestones), and eventually you can also see here  where contributions are most urgent needed. The Edirom community uses the functionality of Github projects to track the development of Edirom-Online using the project [Edirom Development](https://github.com/orgs/Edirom/projects/4/views/1). 

The most recent 'stable' version of Edirom-Online is always found on the 'main' branch, where all releases are tagged from. The most recent 'work in progress' is found on the 'develop' branch. 

## Versioning

The Edirom-Online Versions follow the ['semantic' versioning scheme](http://semver.org), 'X.Y.Z'. 'X' is a major release, often defined by the presence of backward-incompatible changes to the schema. 'Y' is a minor release, defined by backward compatible changes (i.e., added, but not removed, features). 'Z' is the 'patch' number, indicating a release that fixes or clarifies existing functionality.



