# Project Management Workflow

This document describes the project management workflow with github used in the **Edirom Online** repository.

## Overview

The project follows an open, community-driven development model.  
Issues, discussions, and pull requests are managed through the **[Edirom GitHub Project Board](https://github.com/orgs/Edirom/projects/4/)**, which provides a shared overview of progress, priorities, and upcoming releases. The Project Board manages three repositories: the main [Edirom-Online](https://github.com/Edirom/Edirom-Online), [Edirom-Online-Frontend](https://github.com/Edirom/Edirom-Online-Frontend) and [Edirom-Online-Backend](https://github.com/Edirom/Edirom-Online-Backend) with views, that address different aspects of the software development (e.g. open PRs, next releases, assignee).

## Issues and Pull Requests

- **Issues** are used to track bugs, feature requests, and documentation improvements.
- Each issue should have:
  - A clear and descriptive title
  - Relevant **[labels](https://github.com/Edirom/Edirom-Online/labels)** (e.g., `Type: bug report`)
  - Optional **[milestone](https://github.com/Edirom/Edirom-Online/milestones)** assignment if it belongs to a planned release

- **Pull Requests (PRs)** should:
  - Reference the related issue(s)
  - Follow the [contributing guidelines](../CONTRIBUTING.md)
  - Pass all automated tests and code reviews before merging

## Automation

Among other [actions](https://github.com/Edirom/Edirom-Online/actions), one custom **[GitHub Action](https://github.com/Edirom/Edirom-Online/actions/workflows/add-new-issues-and-prs-to-project.yml)** ensures that all new issues and PRs are automatically added to the [Edirom Online Project](https://github.com/orgs/Edirom/projects/4/views/23).  
This keeps project tracking consistent and up to date without manual intervention.

## Milestones and Releases

-  **[Milestones](https://github.com/Edirom/Edirom-Online/milestones)** correspond to planned release versions (e.g., `v1.0.0`, `v2.2.0`).
- Each milestone collects all issues and PRs targeted for that release.
- Before release, issues are reviewed to ensure they meet acceptance criteria. 

## Community Standards

The repository meets GitHub’s [community standards](https://github.com/Edirom/Edirom-Online/community), including:
- **Code of Conduct**
- **Contributing Guidelines**
- **License Information**
- **Issue and PR Templates** 

These ensure transparency, accessibility, and consistency in collaboration.

## Continuous Improvement

The workflow and automation are regularly reviewed and refined to adapt to the needs of the development team and community contributors. Feedback is always welcome — feel free to open an issue or discussion to propose improvements.

---

*Last updated: 2025-11-11*
