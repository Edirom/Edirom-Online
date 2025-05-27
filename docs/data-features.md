# Edirom Online Data Features

Edirom Online is sensitive to some special features in your edition data that are not covered by the standard definitions of MEI or TEI. This is a short explanation of these features.

## Source Descriptions

```xml
<annot type="descLink" plist="xmldb:exist:///db/apps/weber-klarinettenquintett-eol-emeritus/texts/sourceDesc-1.xml"/>
```

If Edirom Online deems an MEI file to be a source, it looks for an `mei:annot`element with the `@type` attribute set to `descLink`. The `@plist` attribute of this element is interpreted as xmldb-link to a source description. The source description has to be encoded in TEI. Two new views will be added to the source window:

1. Source Description
2. XML Source Description

There is no absolute rule, where the descLink-annot has to be in the MEI structure of a source. In the case of multiple `mei:annot[@type="descLink]" Edirom Online will pick the first one in document order.

As this feature was introduced prior to the introduction of FRBR[^1] features in MEI it has been common practice to put it into a `mei:notesStmt` which could already appear in the `mei:fileDesc`. Putting the `mei:noteStmt` into `mei:manifestation` or `mei:item` (depnding on the nature of the source being described) adds FRBR-semantic sugar.

[^1]: FRBR stands for _Functional Requirements of Bibliographic Records_. More information on FRBR can be found in the [FRBR Bibliography](https://www.ifla.org/g/bcm-rg/frbr-bibliography/). For more information about FRBR and how it is implemented in MEI see [3.5Functional Requirements for Bibliographic Records (FRBR)](https://music-encoding.org/guidelines/v5/content/metadata.html#FRBR) in the MEI 5.1 Guidelines.