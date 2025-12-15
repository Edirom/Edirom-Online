<div align="center">

[![Build](https://github.com/Edirom/Edirom-Online/actions/workflows/pre-release.yml/badge.svg?branch=develop&event=push)](https://github.com/Edirom/Edirom-Online/actions/workflows/pre-release.yml) 
[![NFDI4C Registry](https://nfdi4culture.de/fileadmin/user_upload/registry/badges/nfdi4culturebadge.svg)](https://nfdi4culture.de/id/E3648) 
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![GitHub release](https://img.shields.io/github/v/release/Edirom/Edirom-Online.svg)](https://github.com/Edirom/Edirom-Online/releases) 
[![FAIR checklist badge](https://fairsoftwarechecklist.net/badge.svg)](https://fairsoftwarechecklist.net/v0.2?f=31&a=32113&i=32300&r=133) 
[![OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/projects/9746/badge)](https://bestpractices.coreinfrastructure.org/projects//9746)
[![fair-software.eu](https://img.shields.io/badge/fair--software.eu-%E2%97%8F%20%20%E2%97%8F%20%20%E2%97%8F%20%20%E2%97%8F%20%20%E2%97%8F-green)](https://fair-software.eu)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.5347861.svg)](https://doi.org/10.5281/zenodo.5347861)

</div>


<div align="center"> 
 
**[About](#about-edirom-online) • 
[Showcases](#showcases) •
[Installation](#installation) •
[Further documentation](#further-documentation) •
[Dependencies](#dependencies) • 
[Roadmap](#roadmap) • 
[Contributing](#contributing) • 
[Get in touch](#get-in-touch) • 
[Code of Conduct](#code-of-conduct) • 
[Citation](#citation) • 
[License](#license)**

</div>

# Edirom Online

## About Edirom Online

Edirom Online is a software for the **presentation and analysis of critical musical editions** in a digital format, particularly in the fields of musicology and philology. Edirom Online supports various data formats commonly used in digital humanities, such as [TEI] (Text Encoding Initiative) for textual data and [MEI] (Music Encoding Initiative) for musical data, that is visualized with [Verovio]. This allows for the integration of different data formats, starting in the early days with texts, images and music and adding audio and even film within a single edition.

The Edirom idea was born in 2004 at [Musikwissenschaftliches Seminar Detmold/Paderborn] and even after several years of Edirom development, the success of Edirom based on the same core concepts as in the beginning continues with numerous projects using and developing Edirom tools and creating digital musical editions with this software. Edirom tools were originally developed by the project [Entwicklung von Werkzeugen für digitale Formen wissenschaftlich-kritischer Musikeditionen] (2006–2012) funded by the DFG. The development of Edirom is now maintained as a community effort while being strongly supported and accompanied by [Virtueller Forschungsverbund Edirom] (ViFE), primarily based at [Paderborn University]. ViFE aims to provide tools for scholars working with digital texts and music, especially those involved in editing historical documents.

The Edirom Online software is developed as a web application consisting of a [backend module](https://github.com/Edirom/Edirom-Online-Backend.git) (written in XQuery and deployed in [eXist-db]) and a [frontend module](https://github.com/Edirom/Edirom-Online-Frontend.git) (written in JavaScript and delpoyed in [nginx]). The backend/frontend modularization was introduced in April 2025 and led to a different setup routine. The present repository contains configuration for building the Edirom Online environment with Docker.


### Showcases

To get some practical insights, look at these projects and editions that already use Edirom Online.

**Clarinet quintet op.34 by Weber**

The third version of Webers clarinet quintet op.34 was created 2022 by Virtueller Forschungsverbund Edirom (ViFE) honoring Prof. Dr. Joachim Veit on the occasion of his retirement. The edition includes digital facsimiles, music that is encoded in MEI and visualized with [Verovio], annotations and texts.
  * publication of [Webers clarinet quintet]
  * code of Edirom Online Release [v1.0.0-beta.4 (Emeritus)]
  * data of [clarinet quintet: Edition]
  
  <img src="./docs/images/EdiromOnline_WeberKlarinettenquintettOp34_2022.jpg" width="80%">

**Freischütz Digital**

The digital edition of Webers Freischütz was developed by the project "[Freischütz Digital] – Paradigmatische Umsetzung eines genuin digitalen Editionskonzepts" (BMBF, 2012–2015). Several demonstrators were developed and integrated into the Edirom Online, e.g. 'Dynamic Score Rendering' and 'Genetic Text Stages'.
  * publication of [Webers Freischütz]
  * code of [Freischütz: Edirom Online]

<img src="./docs/images/EdiromOnline_WeberFreischuetz_2015.jpg" width="80%">

**Bargheer: Fiedellieder plus**

"Carl Louis Bargheer: Fiedellieder plus - Eine digitale Edition" was created 2013 as a students project at Musikwissenschaftliches Seminar Detmold/Paderborn with an early version of Edirom Online.
  * publication of [Bargheers Fiedellieder]
  * code of [Bargheer: Edirom Online]
  * data of [Bargheer: Edition]

  <img src="./docs/images/EdiromOnline_BargheerFiedellieder_2013.jpg" width="80%">
 

### Installation

Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/) has to be installed. The 'docker' command must be available in the terminal.

#### Fast-lane installation

To start the Edirom Online with the EditionExample, create and navigate to a new directory on your computer, and enter the following in the command line. After a while the Edirom will be available at http://localhost:8089

Mac/Linux:
```bash
git clone https://github.com/Edirom/Edirom-Online.git . && export EDITION_XAR=https://github.com/Edirom/EditionExample/releases/download/v0.1.1/EditionExample-0.1.1.xar && docker compose up
```

Windows:
```bash
git clone https://github.com/Edirom/Edirom-Online.git . && set EDITION_XAR=https://github.com/Edirom/EditionExample/releases/download/v0.1.1/EditionExample-0.1.1.xar && docker compose up
```

#### Step-by-step installation

**Step 1**: Clone the Git repository.

On your computer create and navigate to a new directory for the Edirom Online. 
Then open the command line of your computer (also known as Shell, PowerShell, Terminal) and clone the Edirom Online Git repository to your machine with:

```bash
git clone https://github.com/Edirom/Edirom-Online.git .
```

&ast; If you do not use Git, it is possible to download a zip or tar archive from the [Releases](https://github.com/Edirom/Edirom-Online/releases), unzip the archive, and  then navigate into it.

**Step 2 (optional)**: Specify the Edirom Online version (for developers).

By default the docker-compose.yml configuration fetches the backend from https://github.com/Edirom/Edirom-Online-Backend.git (*current release, e.g. v1.0.1*) and the frontend from https://github.com/Edirom/Edirom-Online-Frontend.git (*current release, e.g. v1.0.1*). 
You can change this by setting variables before starting the docker compose in the command line, e.g.

Mac/Linux:
```bash
export BE_REPO=https://github.com/YOUR-FORK-OF/Edirom-Online-Backend.git
export BE_BRANCH=cool-feature-branch
export FE_REPO=https://github.com/YOUR-FORK-OF/Edirom-Online-Frontend.git
export FE_BRANCH=awesome-feature-branch
```

Windows:
```bash
set BE_REPO=https://github.com/YOUR-FORK-OF/Edirom-Online-Backend.git
set BE_BRANCH=cool-feature-branch
set FE_REPO=https://github.com/YOUR-FORK-OF/Edirom-Online-Frontend.git
set FE_BRANCH=awesome-feature-branch
```

If you have set a variable you can also unset it again (to fall back to the defaults):

Mac/Linux:
```bash
unset BE_REPO
```

Windows:
```bash
set BE_REPO=
```

You can also check the current docker compose configuration, and see the effect of the currently set environment variables, via:

```bash
docker compose config
```


**Step 3 (optional)**: Specify an edition.

**Option A**: By setting the environment variable **EDITION_XAR** you can provide a URL of a downloadable xar package (here the EditionExample:).

Mac/Linux:
```bash
export EDITION_XAR=https://github.com/Edirom/EditionExample/releases/download/v0.1.1/EditionExample-0.1.1.xar
```

Windows:
```bash
set EDITION_XAR=https://github.com/Edirom/EditionExample/releases/download/v0.1.1/EditionExample-0.1.1.xar
```

You can get links to edition xar packages for instance from the [sample edition releases](https://github.com/Edirom/EditionExample/releases) (copy link to xar file listed under "Assets") or releases of the [Klarinettenquintett op. 34 WeV P.11](https://git.uni-paderborn.de/wega/klarinettenquintett-edirom/-/releases) (copy link to xar file at the bottom of the box). 

**Option B**: By copying one or more edition xar packages to the directory **/backend/autodeploy** inside the directory of the cloned repository (from Step 1) you can also pass editions into the Edirom Online. You can for instance download xar packages from the release page listed in Option (a). 

If you want to you can also dive into the process of [building sample data] yourself, but at this step providing the public location or a copy of a xar file is enough.

**Step 4 (optional)**: Set ports.

The default configuration of Edirom Online starts the backend service on port 8080 and the frontend service on port 8089 of your machine. If you want to make these service run on other ports you can specify these by setting the corresponding environment variables:

Mac/Linux:
```bash
# set the backend port
export BE_PORT=8081

# set the frontend port
export FE_PORT=8090
```

Windows:
```bash
# set the backend port
set BE_PORT=8081

# set the frontend port
set FE_PORT=8090
```

**Step 5**: Start Edirom Online.

The Edirom Online is started via entering the following command in the command line:

```bash
docker compose up
```

Alternatively start in detached mode (running in background so that the terminal is writable after startup) by using the flag "-d" after the above command. 

> [!NOTE]
> If you want to change the setup, e.g., switching to another branch of Edirom Online Frontend or Edirom Online Backend or provide another edition XAR, the service has to be **rebuilt**.

So if you changed the setup or you want to fetch the latest versions of the Edirom Online Backend and Frontend after you have built it already use the following commands (NOTE: you can copy/paste all lines, including the last line break completely into the terminal)

```bash
docker compose down --volumes --remove-orphans && docker compose build --no-cache && docker compose up 
```

After the environment has been setup (which may take several minutes) the Edirom Online is available at:

[http://localhost:8089/](http://localhost:8089/)

If it does not show up directly, try a reload of the page.

**Step 6**: Stop Edirom Online.

You can stop the environment by hitting Ctrl+C in the command line in which the Docker process is running. If you have used the detached mode, you can stop the environment by typing `docker compose down`.


### Further Documentation

Some useful information regarding documentation is captured in the [docs] folder of this repo. It contains:
* [Customize] Edirom Online and content
* [Release Workflow] for the Edirom Online
* [Manual setup] on a local machine
* [Data creation workflow] for the Edirom Online


## Dependencies

Edirom Online depends heavily on the JavaScript framework [Ext JS] which is included in parts in our code base. We use Ext JS 4.2.1 in the GPL version. Edirom Online also includes the [Raphaël] javascript library (MIT License) and the [ACE] editor (BSD license).

For running the tests provided in the [ANT build file] we rely on `xmllint` 
and `SaxonHE`. 
On a Debian based Linux system these can be installed with `apt-get install 
libsaxonhe-java libxml2-utils`. 
If SaxonHE is not available from your classpath by default you might need to 
explicitly point ANT at it by providing the `-lib` parameter, e.g. `ant -lib 
/usr/share/java/ run-all-tests`. 


## Roadmap

Until 2025, Edirom Online and its features were developed as a single, monolithic application based on the JavaScript framework Ext JS (last used version: Ext JS 4.2.1). As part of the architectural modernization of the software, **Edirom Online was split into separate frontend and backend repositories in April 2025**, enabling a cleaner structure, independent deployment, and improved long-term maintainability.

With support from the DFG-funded project [Edirom Online Reloaded] (2024–2027), the software is currently undergoing significant **modernization steps**:

- modularizing major features into [edirom web components],  
- reducing external (framework) dependencies to ensure sustainability,  
- improving code structure and quality through refactoring and targeted updates,  
- coordinating sustainable development with the support of the broader Edirom community and [ZenMEM].

To track progress, upcoming release plans, and ongoing development activities, please refer to the **milestone pages** of all three repositories:

- [Edirom Online milestones] (main application)  
- [Edirom Online Frontend milestones]
- [Edirom Online Backend milestones]

## Contributing

After all this information, you decided to contribute to Edirom Online, that is awesome! We prepared a [CONTRIBUTING] file to help start your Edirom-Aventure now.
We also prepared a document, to become familiar with the general [project management workflow] of this software. 

If you encounter a security issue in the code, please see the [Security Policy](.github/SECURITY.md) for further guidance.


## Get in touch

Even if you are not ready (yet) to contribute to this wonderful project, maybe instead you just have a question or want to get to know the people involved in the project a little better, here are some ideas for you: 
* The [Edirom mailing list] provides the option of self-subscription, we send invitations to the community meetings via this list and we have Edirom related discussions on this list
* In the [wiki] you can find information and meeting minutes of the edirom community meetings which are regularly on the first Wednesday of the month
* In [GitHub Discussions] you can start a discussion about any Edirom Online related topic

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct]. By participating in this project you agree to abide by its terms.

## Citation

Please cite the software/repository using the information provided under "Cite this repository" on the right hand side. The APA and BIBTeX citations are fed by information from the CITATION.cff file in this repository which you can also use as a source.
If you intend to cite unreleased branches or commits please use the commit hash in the citation. 

## License

Edirom Online is released to the public under the terms of the [GNU GPL v.3] open source license.

[Musikwissenschaftliches Seminar Detmold/Paderborn]: https://www.muwi-detmold-paderborn.de/
[TEI]: https://tei-c.org/
[MEI]: https://music-encoding.org/
[Virtueller Forschungsverbund Edirom]: https://github.com/Edirom 
[Paderborn University]: https://www.uni-paderborn.de/en/
[Entwicklung von Werkzeugen für digitale Formen wissenschaftlich-kritischer Musikeditionen]: https://edirom.de/edirom-projekt/
[Webers clarinet quintet]: https://klarinettenquintett.weber-gesamtausgabe.de/
[v1.0.0-beta.4 (Emeritus)]: https://github.com/Edirom/Edirom-Online/releases/tag/v1.0.0-beta.4
[clarinet quintet: Edition]: https://git.uni-paderborn.de/wega/klarinettenquintett-edirom
[Freischütz digital]: https://freischuetz-digital.de/
[Webers Freischütz]: https://edition.freischuetz-digital.de/
[Freischütz: Edirom Online]: https://github.com/Freischuetz-Digital/Edirom-Online
[Bargheers Fiedellieder]: https://bargheer.edirom.de/index.html
[Bargheer: Edirom Online]: https://github.com/Edirom/Bargheer-EdiromOnline
[Bargheer: Edition]: https://github.com/Edirom/Bargheer-Edition
[eXist-db]: https://exist-db.org/
[nginx]: https://nginx.org/
[Verovio]: https://www.verovio.org/index.xhtml
[docs]: /docs
[Customize]: docs/customize.md
[Release Workflow]: docs/release-workflow.md
[Manual setup]: docs/setup.md
[Data creation workflow]: docs/data-creation-workflow.md
[Ext JS]: https://www.sencha.com/products/extjs
[Raphaël]: http://raphaeljs.com 
[ACE]: http://ace.ajax.org
[edirom web components]: https://github.com/Edirom/edirom-web-components-demonstrator
[Edirom Online Reloaded]: https://www.uni-paderborn.de/projekt/1332
[Edirom Online milestones]: https://github.com/Edirom/Edirom-Online/milestones
[Edirom Online Frontend milestones]: https://github.com/Edirom/Edirom-Online-Frontend/milestones
[Edirom Online Backend milestones]: https://github.com/Edirom/Edirom-Online-Backend/milestones
[ZenMEM]: https://www.uni-paderborn.de/zenmem
[CONTRIBUTING]: CONTRIBUTING.md
[project management workflow]: docs/project_management_workflow.md
[Docker]: https://docs.docker.com/
[Docker Compose]: https://docs.docker.com/compose/
[building sample data]: https://github.com/Edirom/Edirom-Online/blob/develop/docs/setup.md#build-data-package
[Edirom mailing list]: https://lists.uni-paderborn.de/mailman/listinfo/edirom-l
[wiki]: https://github.com/Edirom/Edirom-Online/wiki
[GitHub Discussions]: https://github.com/Edirom/Edirom-Online/discussions
[Contributor Code of Conduct]: CODE_OF_CONDUCT.md
[GNU GPL v.3]: http://www.gnu.org/copyleft/gpl.html
[ANT build file]: https://github.com/Edirom/Edirom-Online/blob/develop/build.xml
