# Edirom Online Data Features

Edirom Online is sensitive to some special features in your edition data that are not covered by the standard definitions of MEI or TEI. This is a short explanation of these features.

## Source Descriptions

```xml
<annot type="descLink" plist="xmldb:exist:///db/apps/weber-klarinettenquintett-eol-emeritus/texts/sourceDesc-1.xml"/>
```

If Edirom Online deems an MEI file to be a source, it looks for an `mei:annot`element with the `@type` attribute set to `descLink`. The `@plist` attribute of this element is interpreted as xmldb-link to a source description. The source description has to be encoded in TEI. Two new views will be added to the source window:

1. Source Description
2. XML Source Description

