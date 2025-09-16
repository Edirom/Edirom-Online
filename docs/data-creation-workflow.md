# Workflow how to prepare data for an edirom edition

- [Workflow how to prepare data for an edirom edition](#workflow-how-to-prepare-data-for-an-edirom-edition)
  - [Prepare repositories](#prepare-repositories)
  - [Prepare the working environment](#prepare-the-working-environment)
  - [Data structure of the edition](#data-structure-of-the-edition)
  - [Images](#images)
  - [Create measure-zones](#create-measure-zones)
  - [MEI](#mei)
  - [TEI](#tei)
  - [Edirom Online data features](#edirom-online-data-features)
  - [Annotations](#annotations)
  - [Concordances](#concordances)
  - [Examples of Edirom editions](#examples-of-edirom-editions)

The description of how to [setup](docs/setup.md) Edirom Online on a local machine assumes that you already have a data package.
In the early days of Edirom there was an Edirom Editor that supported the data creation for writing annotations, creating zones for measures and creating concordances. It also created the data package, but this has since been deprecated.
This document therefore describes the workflow for generating data for an Edirom edition.
If you beyond that also want to customize Edirom Online and the content, e.g. the table of contents of your edition shown in the online publication, have a look at the [customize.md](docs/customize.md).

## Prepare repositories

Start by creating of two repositories on your own account or create an organization for your edition that will contain all the content.
* Software: Create a fork of the [Edirom Online](https://github.com/Edirom/Edirom-Online) repository for your own edition, to allow for later edition-specific modifications to the software.
* Data: Create a repository for your Edirom data. The [Edition Example](https://github.com/Edirom/EditionExample) might be helpful as a starting point, but you can also fill up your own data repository.

## Prepare the working environment

There are three different ways to work with your edition data, which affects the editor you choose.
1. eXide, the build-in XQuery IDE from eXist-db:
    - If you work with this editor, your changes will only be visible temporarily as long as your local Edirom Online is running.
    - It is more likely that you will use this option for testing small changes only, but you should also save your changes permanently.
2. oXygen XML editor:
    - Save changes locally.
    - If you chose the Edition Example as a blueprint and started making changes to the data, you need to build your data package.
      - Open the terminal, navigate to your data package and enter ``` ant ``` (you will need to have Ant installed on your machine).
      - Alternatively, after opening the file build.xml in oXygen, press the “play-Button".
    - The directory `/dist` will be generated containing a .xar that contains the build of your data package.
    - Put your newly built .xar file into the eXist package manager.
    - Reload Edirom Online and see the changes.
3. VS Code with exist-db plugin:
    - Install Visual Studio Code and within this editor the extension "existdb-vscode".
    - Assuming you are useing the [Edition Example](https://github.com/Edirom/EditionExample/blob/develop/.existdb.json.sample) as a blueprint, make the following modifications to the file .existdb.json.sample. If not, add this file to your data package.
      - Rename the file to `.existdb.json`.
      - Add your password in [line 6](https://github.com/Edirom/EditionExample/blob/290be01d3ff9f4605be3fa8ba6d4573e52e3d554/.existdb.json.sample#L6).
      - Check and modify the root path where the sync can be found in [line 11](https://github.com/Edirom/EditionExample/blob/290be01d3ff9f4605be3fa8ba6d4573e52e3d554/.existdb.json.sample#L11).
      - Restart VS Code.
        - Open the folder of your edition.
        - Confirm the pop-up question to install to existdb.
        - See the barrel symbol next to "EditionExample” at the bottom right of the editor. Click on the circulating arrow symbol to change from “off” to “on”. You will see "synchronization" at the top. Click on this to start the connection.
      - Write and save to your files to see all changes directly in Edirom Online.

## Data structure of the edition

As you can see from the Edition Example, the structure consists of different files that require specific content. You can modify these files or add your own content. You are not obliged to follow the Edition Example's structure. Another edition that could provide inspiration for modifying and adapting the data structure is the clarinet quintet. Please ensure you update all links and rename them accordingly.
- Edition file:
  - Change the information in the "Navigator" list shown on the right of an Edirom Online edition. For example, change the names of the items in the [`navigatorDefinition`](https://github.com/Edirom/EditionExample/blob/290be01d3ff9f4605be3fa8ba6d4573e52e3d554/content/ediromEditions/edirom_edition_example.xml#L13).
  - `concordances` can be added in this file.
- Source files can contain measure zones; see [Create measure-zones](#create-measure-zones) for a description.
- The work file can contain annotations of your edition. See [Annotations](#annotations) for a description.
- The `prefs.xml` file provides edition-specific preferences for Edirom Online.

## Images

Check whether you need to host the images yourself or if the library or institution can provide you with IIIF.
If you have to host the images yourself, make sure the image names are correct to avoid potential problems later on (e.g. special characters, vowel mutation, spaces).
Try to decide which sources should be included in your edition at an early stage so that you can complete this step in one go.

How to add images to your edition data:
1. Use IIIF manifests that are publicly available online.
   - You need the URL of an IIIF-manifest.
   - Import the IIIF manifest to the [cartographer app](https://cartographer-app.zenmem.de/) and download it as an MEI file.
   - Add this MEI file to the sources directory.
   - Add a new entry to the navigatorDefinition in the edition file and take care to make the necessary modifications (e.g. paths).
2. Locally stored images
   - To be continued ...

## Create measure-zones

You can use the [cartographer-app](https://github.com/Edirom/cartographer-app) to create MEI representations of your sources. The app utilises information from IIIF manifests to generate references for each image within a source. You can define zones on each image to reference individual measures. All data is stored in an MEI file, which can be downloaded afterwards.
To modify, add, or remove zones at a later stage, you can upload the MEI file and edit it accordingly.
Please be aware of joint measures in your sources (e.g. due to system or accolade changes within a measure). In such cases, ensure that a single measure is linked to two or more zones, rather than creating separate measures.

## MEI

Of course, you could write the MEI from scratch in your editor, but it is more likely that you will use the music notation software of your choice to enter your music.
You need to save this as MEI if possible. If not, MusicXML should at least be a possible format. If you have a MusicXML file, you can use [mei-friend](https://mei-friend.mdw.ac.at/) to import and convert it to MEI.
You can also use MEI-friend to proofread and make adjustments to your MEI file.
If you have old MEI files that need updating to a newer MEI version, you can use [MEI garage](https://meigarage.edirom.de/) to convert between different MEI versions. The MEI Garage uses scripts from [music-encoding/encoding-tools](https://github.com/music-encoding/encoding-tools),  so choose whether to use the scripts directly from Music-Encoding or the MEI Garage option with a graphical user interface.

**Attribute n vs label**

For [surface](https://music-encoding.org/guidelines/v5/elements/surface.html#attributes_full_tab) and [measure](https://music-encoding.org/guidelines/v5/elements/measure.html#attributes_full_tab) elements the n-attribute and label-attribute can be used according to the MEI guidelines.
Since the n-attribute captures the total number of elements, the measure or surface elements also provide a label-attribute, eg label="1verso" for surface (=page) or label="2b" for measure. A very common use case is the repetition of a measure number in scores after a line break; in this case the n-attribute will increase its number, but the label-attribute will keep its value.
For both elements Edirom Online

## TEI

You can write the text sections of your editions, such as introductions in HTML or TEI. If you need to convert them into other text formats, you can use [TEI garage](https://teigarage.tei-c.org/).

## Edirom Online data features

Edirom Online is sensitive to some special features in your edition data that are not covered by the standard definitions of MEI or TEI. This is a short explanation of these features.

**Source Descriptions**

```xml
<annot type="descLink" plist="xmldb:exist:///db/apps/weber-klarinettenquintett-eol-emeritus/texts/sourceDesc-1.xml"/>
```

If Edirom Online deems an MEI file to be a source, it looks for an `mei:annot`element with the `@type` attribute set to `descLink`. The `@plist` attribute of this element is interpreted as xmldb-link to a source description. The source description has to be encoded in TEI. Two new views will be added to the source window:

1. Source Description
2. XML Source Description

There is no absolute rule, where the descLink-annot has to be in the MEI structure of a source. In the case of multiple `mei:annot[@type="descLink]" Edirom Online will pick the first one in document order.

As this feature was introduced prior to the introduction of [FRBR](https://music-encoding.org/guidelines/v5/content/metadata.html#FRBR) (Functional Requirements of Bibliographic Records, more information on FRBR can be found in the [FRBR Bibliography](https://www.ifla.org/g/bcm-rg/frbr-bibliography/)) features in MEI it has been common practice to put it into a `mei:notesStmt` which could already appear in the `mei:fileDesc`. Putting the `mei:noteStmt` into `mei:manifestation` or `mei:item` (depnding on the nature of the source being described) adds FRBR-semantic sugar.

## Annotations

You can add annotations to your edition, providing them with a category and priority. In general, Edirom Online looks for annotations encoded with the `annot` element, but the location at which an edition project captures these `annot` elements is not strictly set.

**Annotations in work-file**

Many editions capture their `annot` elements inside the `notesStmt` in their work file. For an example see the work file of the [EditionExample](https://github.com/Edirom/EditionExample/blob/develop/content/works/edirom_work_291f7ad8-9bb8-45eb-9186-801dec2f80d9.xml).
As mentioned above, you can modify the categories and priorities for annotations; this is also done in the work file of the EditionExample. Ensure to modify them accordingly in the `termList` of your work file. See `termList classcode="#ediromCategory"` for [category](https://github.com/Edirom/EditionExample/blob/1b2361e9b92a0c1b19def754a8dcd8d7acdbfeb1/content/works/edirom_work_291f7ad8-9bb8-45eb-9186-801dec2f80d9.xml#L112C21-L112C59) and `termList classcode="#ediromPriority"` for [priority](https://github.com/Edirom/EditionExample/blob/1b2361e9b92a0c1b19def754a8dcd8d7acdbfeb1/content/works/edirom_work_291f7ad8-9bb8-45eb-9186-801dec2f80d9.xml#L174C21-L174C59) of the EditionExample.

**Annotations in MEI source-file**

Another approach to capturing annotations is to encode the `annot` elements in an MEI source file. In [Webers clarinet quintet](https://git.uni-paderborn.de/wega/klarinettenquintett-edirom) the annotations are encoded directly inside the [source-file](https://git.uni-paderborn.de/wega/klarinettenquintett-edirom/-/blob/main/edition/sources/source-4-MEI.xml) of the edition, in the `measure` in which the annotation begins. The edition of the clarinet quintet also defines the priorities and categories of their annotations in the same source file, in the header within the `taxonomy`element.

## Concordances

The Edirom Online allows you to navigate through different sources and the edition in parallel with the concordance navigator. To achive this, a concordance of the corresponding measures from different sources must be added as a `concordance` element to the edition file. See the [example](https://git.uni-paderborn.de/wega/klarinettenquintett-edirom/-/blob/main/edition/edition.xml?ref_type=heads#L148) in the clarinet quintet edition data.

## Examples of Edirom editions

The following examples might help you to think about the structure and content of your edition.

* Weber, [_Klarinettenquintett op.34_](https://klarinettenquintett.weber-gesamtausgabe.de/)
* Reger, [_Vokalwerke mit Orgelbegleitung_](https://www.reger-werkausgabe.de/module-ii.html)
* Bach, [_Sämtliche Orgelwerke_](https://edirom.breitkopf.com/bach-edirom/)
* Weber, [_Freischütz_](https://edition.freischuetz-digital.de/)
* Bargheer, [_Fiedellieder_](https://bargheer.edirom.de/)
