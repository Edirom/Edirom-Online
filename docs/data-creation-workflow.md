# Workflow how to prepare data for an edirom edition

* [Prepare repositories](#prepare-repositories)
* [Prepare the working environment](#prepare-the-working-environment)
* [Data structure of the edition](#data-structure-of-the-edition)
* [Images](#images)
* [Create measure-zones](#create-measure-zones)
* [MEI](#mei)
* [TEI](#tei)
* [Annotations](#annotations)
* [Concordances](#concordances)
* [Examples of Edirom editions](#examples-of-edirom-editions)

In the description of how to [setup](docs/setup.md) Edirom Online on a local machine there is the assumption you already have a data package.
In the early days of Edirom there was a (meanwhile deprecated) Edirom Editor that supported the data creation for writing annotations, creating zones for measures, creating concordances and it created the data package.
So this document tries to describe the workflow to generate data for an Edirom Edition.
If you beyond that also want to customize Edirom-Online and the content, e.g. the table of content of your edition shown in the online publication, have a look at the [customize.md](docs/customize.md).

## Prepare repositories

Start with the creation of two repositories on your own account or create an organization for your edition that will contain all the content.
* software: create a fork of the [Edirom Online](https://github.com/Edirom/Edirom-Online) for your own edition for later edition-specific modifications to the software
* data: create a repository for your Edirom data, the [Edition Example](https://github.com/Edirom/EditionExample) might be helpful as a start, but you could fill up your data repository also on your own

## Prepare the working environment

You can decide between three different ways to work with your edition data that affects the editor you will choose.
1. eXide, the build-in XQuery IDE from eXist-db
    - if you work with this editor, your changes will only be temporarily visible as long as your local Edirom-Online is running
    - it is more likely, you use this option only for testing small changes, but save your changes also permanently
2. oXygen XML editor 
    - save changes locally
    - if you chose the Edition Example as a blueprint and started to make changes to the data, you have to build your data package 
      - open the terminal, navigate to your data package and enter ``` ant ``` (needs ant installed on your machine)
      - alternatively press the “play-Button" after opening the file build.xml in oXygen
    - the directory /dist with a .xar file will be generated, that contains the build of your data package
    - put your newly built .xar file into the eXist package manager
    - reload Edirom-Online and see changes
3. VS Code with exist-db plugin
    - install Visual Studio Code and within this editor the extension "existdb-vscode"
    - assuming you use the [Edition Example](https://github.com/Edirom/EditionExample/blob/develop/.existdb.json.sample) as a blueprint, make the following modifications to the file .existdb.json.sample; if not, add this file to your data package
      - rename the file to .existdb.json
      - add your password in [line 6](https://github.com/Edirom/EditionExample/blob/290be01d3ff9f4605be3fa8ba6d4573e52e3d554/.existdb.json.sample#L6)
      - check and modify root path where the sync can be found in [line 11](https://github.com/Edirom/EditionExample/blob/290be01d3ff9f4605be3fa8ba6d4573e52e3d554/.existdb.json.sample#L11)
      - restart VS Code
        - open folder of your edition
        - confirm pop-up question to install to existdb
        - see the symbol of a barrel next to "EditionExample” at the bottom right of the editor
        - click on the symbol of circling arrows to change from “off” to “on”, on the top you can read "synchronization", you have to click on it to start the connection
      - write and save to your files and see all changes directly in Edirom-Online 

## Data structure of the edition

According to the structure you can see in the Edition Example, there are different files that expect specific content. You can modify the files from the Edition Example or add your own content. You are not forced to follow the structure of the Edition Example, another edition that could also work for getting ideas how to modify and adapt data-structure is the clarinet quintet. Please make sure, you take care about all links and name changes accordingly.
- edition file
  - change the information of the list of content ("Navigator") that is shown on the right of an Edirom-Online edition, e.g. the name of items in the [`navigatorDefinition`](https://github.com/Edirom/EditionExample/blob/290be01d3ff9f4605be3fa8ba6d4573e52e3d554/content/ediromEditions/edirom_edition_example.xml#L13) 
  - `concordances` can be added in this file
- source files can contain measure zones, see [Create measure-zones](#create-measure-zones) for a description
- the work file can contain annotations of your edition, see [Annotations](#annotations)
- prefs.xml provides edition-specific preferences to Edirom-Online

## Images

Check if you have to host the images on your own or if the library or institution can provide you with iiif.
If you have to host the images on your own, make sure the name of the images are fine to avoid possible later trouble (e.g. special characters, vowel mutation, spaces).
Try to decide which sources should be part of your edition in an early stage, so you can have this step done as a whole.

How to add images to your edition data:
1. iiif manifests that are provided online publically
   - you need the URL of a iiif-manifest
   - import iiif-manifest to the [cartographer app](https://cartographer-app.zenmem.de/) and download it as an mei file
   - add this mei-file to the sources directory
   - add a new entry to the navigatorDefinition in the edition-file and take care about necessary modifications, e.g. paths
2. locally stored images
   - to be continued ...

## Create measure-zones

Use the [cartographer-app](https://github.com/Edirom/cartographer-app) to create the zones of measures. The App uses the images and creates zones for measures that match the corresponding images and saves the zones in an MEI-file.
Please take care about possible joint-measures in your images. If a measure is divided because of a line break in the facsimile it seems like two measures. You need to make this clear in the App that it is actually one measure consisting of two (or even more) zones so it can give you the correct number of measures.

## MEI

Of course it is possible to write MEI from scratch to your editor but more likely you use music notation software of your choice to enter your music.
You need to save this as MEI if possible. If not, at least MusicXML should be possible as a format to choose. If you got MusicXML you can use [mei-friend](https://mei-friend.mdw.ac.at/) to import it and convert it to MEI.
Also use mei-friend for proof-reading and adjustments to your MEI-file. 
If you have already (old) MEI-files and you need to update them to a newer MEI version, you can use [MEI garage](https://meigarage.edirom.de/) to convert different MEI versions. The MEI garage uses scripts from [music-encoding/encoding-tools](https://github.com/music-encoding/encoding-tools), so choose on your own, if you want to use the scripts directly from music-encoding or the option with a graphical user interface of the MEI garage.

## TEI

You can write your text-files like introductions to your edition in html or TEI. You can use [TEI garage](https://teigarage.tei-c.org/) if you need to convert text formats.

## Annotations

You can add annotations to your edition and it is possible to provide the annotations with a category and a priority. In general Edirom-Online is looking for annotations encoded with the `annot` Element, but it is not strictly set, where an edition project decides to capture these `annot` elements in their edition. 

**Annotations in work-file**

A lot of editions capture their `annot` Elements inside the `notesStmt` in the work-file of their data-package. For an example see the work-file of the [EditionExample](https://github.com/Edirom/EditionExample/blob/develop/content/works/edirom_work_291f7ad8-9bb8-45eb-9186-801dec2f80d9.xml). 
As mentioned above, you can modify the categories and priorities for annotations, which is done also in the work-file of the EditionExample. Make sure to modify them accordingly in the `termList` of your work-file. See `termList classcode="#ediromCategory"` for [category](https://github.com/Edirom/EditionExample/blob/1b2361e9b92a0c1b19def754a8dcd8d7acdbfeb1/content/works/edirom_work_291f7ad8-9bb8-45eb-9186-801dec2f80d9.xml#L112C21-L112C59) and `termList classcode="#ediromPriority"` for [priority](https://github.com/Edirom/EditionExample/blob/1b2361e9b92a0c1b19def754a8dcd8d7acdbfeb1/content/works/edirom_work_291f7ad8-9bb8-45eb-9186-801dec2f80d9.xml#L174C21-L174C59) of the EditionExample. 

**Annotations in MEI source-file**

Another approach to capture annotations is the encoding of `annot` Elements to an MEI source-file. In [Webers clarinet quintet](https://git.uni-paderborn.de/wega/klarinettenquintett-edirom) the annotations are encoded inside the [source-file](https://git.uni-paderborn.de/wega/klarinettenquintett-edirom/-/blob/main/edition/sources/source-4-MEI.xml) of the edition directly inside the `measure` where the annotation starts. The edition of the clarinet quintet captures the definition of used priorities and categories of their annotations also in the same source-file in the header within the `taxonomy`element.

## Concordances

The Edirom-Online has the option to navigate through different sources and the edition in parallel with the concordance navigator. To make this happen, a concordance of corresponding measures of different sources have to be added as `concordance` Element to the edition-file. See an [example](https://git.uni-paderborn.de/wega/klarinettenquintett-edirom/-/blob/main/edition/edition.xml?ref_type=heads#L148) in the clarinet quintet edition data.

## Examples of Edirom editions

While thinking about the structure and the content your edition should have the following examples might be of any help for you.
* Weber, [_Klarinettenquintett op.34_](https://klarinettenquintett.weber-gesamtausgabe.de/)
* Reger, [_Vokalwerke mit Orgelbegleitung_](https://www.reger-werkausgabe.de/module-ii.html)
* Bach, [_Sämtliche Orgelwerke_](https://edirom.breitkopf.com/bach-edirom/)
* Weber, [_Freischütz_](https://edition.freischuetz-digital.de/)
* Bargheer, [_Fiedellieder_](https://bargheer.edirom.de/)
