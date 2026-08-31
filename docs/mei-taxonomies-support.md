# MEI Taxonomies Support in _Edirom Online_

Since _MEI 4_, it has been possible to encode taxonomies directly in an MEI file. Moreover, the addition of `@class` to any MEI element introduced a semantically richer approach to classifying elements. _Edirom Online_ picked up these features for assigning categories to annotations. The existing _categories_ and _priorities_ model was transferred to a taxonomy, and assignment to the corresponding values was switched to ID-references (IDREFS) from within `mei:annot/@class`.

Category and priority references — whether in `@class` or in the legacy `mei:ptr/@target` — are resolved consistently throughout the backend via a single shared resolver: a fragment-only reference (`#someId`) resolves within the annotation’s own document, while a reference that also carries a base part (`taxonomy.xml#someId`, `http://…#someId`) is resolved against the annotation’s base URI. The taxonomy definition may therefore live either in the same file as the annotations or in a separate file that they reference. The simplest setup keeps it in the same file’s `mei:encodingDesc/mei:classDecls`:

```xml
<taxonomy>
    <category xml:id="ediromPriority"/>
    <category xml:id="ediromCategory"/>
    <taxonomy>
        <category class="#ediromPriority" xml:id="ediromAnnotPrio1">
            <label xml:lang="de">1</label>
            <label xml:lang="en">1</label>
        </category>
        <category class="#ediromPriority" xml:id="ediromAnnotPrio2">
            <label xml:lang="de">2</label>
            <label xml:lang="en">2</label>
        </category>
        <category class="#ediromPriority" xml:id="ediromAnnotPrio3">
            <label xml:lang="de">3</label>
            <label xml:lang="en">3</label>
        </category>
    </taxonomy>
    <taxonomy>
        <category class="#ediromCategory" xml:id="wega.annotation.category.bogensetzung">
            <label xml:lang="de">Bogensetzung</label>
            <label xml:lang="en">slurs</label>
        </category>
        <category class="#ediromCategory" xml:id="wega.annotation.category.notational-variant">
            <label xml:lang="de">Notation</label>
            <label xml:lang="en">notation</label>
        </category>
        <category class="#ediromCategory" xml:id="wega.annotation.category.dynamics">
            <label xml:lang="de">Dynamik</label>
            <label xml:lang="en">dynamics</label>
        </category>
        <category class="#ediromCategory" xml:id="wega.annotation.category.articulation">
            <label xml:lang="de">Artikulation</label>
            <label xml:lang="en">articulation</label>
        </category>
        <category class="#ediromCategory" xml:id="wega.annotation.category.rhythm">
            <label xml:lang="de">Rhythmus</label>
            <label xml:lang="en">rhythm</label>
        </category>
        <category class="#ediromCategory" xml:id="wega.annotation.category.correction">
            <label xml:lang="de">Korrektur</label>
            <label xml:lang="en">correction</label>
        </category>
        <category class="#ediromCategory" xml:id="wega.annotation.category.editorial-intervention">
            <label xml:lang="de">Editorischer Eingriff</label>
            <label xml:lang="en">editorial intervention</label>
        </category>
        <category class="#ediromCategory" xml:id="wega.annotation.category.verbal-instruction">
            <label xml:lang="de">Spielanweisung</label>
            <label xml:lang="en">verbal instruction</label>
        </category>
    </taxonomy>
</taxonomy>
```

For assigning a priority or a category to an annotation (`mei:annot`), their `@class` then has to contain the ID-reference to the respective `mei:category`:

```xml
<annot class="#ediromAnnotPrio3 #wega.annotation.category.articulation">
    <!-- some content -->
</annot>
```

> [!IMPORTANT]
> Because `@class` references a category by its ID, every `mei:category` that is to be referenced **must** carry an `@xml:id`. A category without an `@xml:id` cannot be resolved and therefore cannot be used for classification.

> [!NOTE]
> Don’t forget to include the references to the annotated features in the `@plist`, and, of course, your annotation ;-)

MEI taxonomies and categories can be nested recursively, i.e., taxonomies can contain taxonomies and categories, and categories can contain other categories. _Edirom Online_ will try to make sense of the discovered structure and use it in the _AnnotationView_ to define list columns in the _ListView_ and metadata fields in the _Single_ view. Moreover, it forms the basis of the annotation filter menu in both _SourceView_ modes, the _PageBasedView_ and the _MeasureBasedView_.

> [!NOTE]
> While reference _resolution_ is shared, the two contexts deliberately traverse different sets of annotations. The _AnnotationView_ (_ListView_ and _Single_ view, served by `getAnnotations.xql`) is scoped to a single work or annotation file — that file _is_ the list, which is what allows several lists, held in separate files, to be viewed independently. The _SourceView_ filter menu (served by `getAnnotationInfos.xql`) is scoped to the current source and therefore gathers every annotation _about_ that source from across the edition (matched via `@plist`), plus any inline ones. These scopes are intentionally different and are not expected to coincide.

## How the Backend Interprets the Taxonomy Structure

The backend XQL endpoint `getAnnotationInfos.xql` drives the filter menus. Its logic is:

1. Collect all `mei:annot[@type = 'editorialComment']` elements from the MEI file and, above that, all those from the edition’s collection whose `@plist` references the current document URI.
2. For each annotation, split `@class` into space-separated tokens and keep only those that contain a `#`. Each kept token is resolved to a category element: a fragment-only token (`#someId`) is resolved within the annotation’s own document, while a token that also carries a base part (`taxonomy.xml#someId`, `http://…#someId`) is resolved against the annotation’s base URI and opened with `doc()`. Tokens without a `#` are ignored. (This resolution is shared with `getAnnotations.xql`: category, priority and taxonomy references all go through the same resolver, so cross-file references behave identically across endpoints.)
3. Keep only resolved elements that are `mei:category` with at least one ancestor `mei:taxonomy` — anything else (plain `@class` tokens that do not resolve to a category inside a taxonomy) is ignored.
4. Group the identified categories by their **taxonomy group identifier**: the string after `#` in the category’s own `@class` attribute (e.g. `#ediromPriority` → `ediromPriority`) if present, otherwise the `@xml:id` of the _innermost_ ancestor `mei:taxonomy`.
5. Each group produces one filter menu. Its display label is resolved from the innermost ancestor `mei:taxonomy`. If the `mei:taxonomy` has an `@label`, that value is used; otherwise the grouping identifier (from step 4) is used to look up the display label in the locale files.
   
   > [!NOTE]
   > Although `mei:taxonomy` may have localisable `mei:head` child elements, these are not used — a heading would be excessive for this use case. Moreover, the locale-driven approach allows the display value to be adjusted without modifying the taxonomy definition, and it automatically switches between singular and plural forms when matching keys are defined in the locale files.
   
6. Within a group, each deduplicated category becomes one filter item, sorted alphabetically by its localised label. The item label is resolved from the category in this order: an `mei:label` whose `@xml:lang` matches the requested language, then a language-neutral label (the first `mei:label` without `@xml:lang`, else `@label`, else the first `mei:label`), then the category’s own `@xml:id`. The frontend displays this label as-is (it arrives as the item’s `name` field); unlike the group label in step 5, category items currently have **no** locale-file fallback.

### Consequences for MEI encoding

**A taxonomy only appears as a filter menu if at least one annotation actually references one of its categories.** Taxonomies or categories that exist in `mei:classDecls` but are never used in `@class` are silently ignored.

**A category only becomes a filter item if it is directly referenced.** Parent or sibling categories that are not themselves referenced by an annotation are not included.

**Within each taxonomy group the filter is OR; across groups it behaves as an AND, but only over the groups an annotation actually participates in.** An annotation is hidden only if there is some taxonomy group in which it carries one or more categories yet none of those categories are currently checked. A group in which the annotation has no category at all imposes no constraint on it — so this is _not_ a strict AND across _all_ active groups, only across those the annotation belongs to.<!-- TODO this is a legacy dependency -> make configurable -->

### Two patterns for identifying the taxonomy group

**Pattern A — taxonomy with `@xml:id`:** The inner taxonomy carries its own ID, which is used directly as the group key and as the source for the group label, e.g.:

```xml
<taxonomy xml:id="myAnnotationTypes">
    <label xml:lang="de">Annotationstypen</label>
    <label xml:lang="en">Annotation Types</label>
    <category xml:id="myType.structural">
        <label xml:lang="de">Strukturell</label>
        <label xml:lang="en">Structural</label>
    </category>
</taxonomy>
```

**Pattern B — taxonomy without `@xml:id`, categories use `@class` to name their group:** The inner taxonomy has no ID; instead each category’s `@class` points to a parent category whose `@xml:id` becomes the group key. This is the pattern used in the example above for `ediromPriority` and `ediromCategory`, i.e.:

```xml
<taxonomy>
    <category xml:id="ediromPriority"/>  <!-- acts as the group identifier -->
    <taxonomy>
        <category class="#ediromPriority" xml:id="ediromAnnotPrio1">
            <label xml:lang="en">1</label>
        </category>
    </taxonomy>
</taxonomy>
```

Both patterns can coexist within the same `mei:classDecls`.

## Pre MEI 4

> [!WARNING]
> Before the availability of `mei:taxonomy`, the implementation method described below probably reflected the semantically richest way of defining the model for _categories_ and _priorities_. Nevertheless, given the features described above (`mei:taxonomy`, `mei:category`, and `@class`), we strongly advise against it.

In older Edirom Editions predating the introduction of `mei:taxonomy`, `mei:category`, and `@class`, annotations referenced _categories_ and _priorities_ by using `mei:ptr`, e.g.:

```xml
<annot xml:id="a63342691-67f7-417d-a4e9-0c81efe57cbd" type="editorialComment" subtype="print" source="#A #KA2 #K15" resp="#WeGA" tstamp="1" staff="1 5 11" plist="xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_A.xml#A_mov6_measure1 xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_KA2.xml#KA2_mov6_measure1 xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_K15.xml#K15_mov6_measure1 xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_A.xml#A_mov6_measure2 xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_KA2.xml#KA2_mov6_measure2 xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_K15.xml#K15_mov6_measure2 xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_A.xml#A_mov6_measure3 xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_KA2.xml#KA2_mov6_measure3 xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_K15.xml#K15_mov6_measure3">
    <title>No:6. Duetto., Tempobezeichnung (A)</title>
    <p>In <rend rend="bold">A</rend> steht die Angabe "<rend rend="italic">Allegretto grazioso.</rend>" nur über den Fl; in <rend rend="bold">KA2, K15</rend> zusätzlich über bzw. unter der
        untersten Notenzeile.</p>
    <ptr type="priority" target="#ediromAnnotPrio3"/>
    <ptr type="categories" target="#ediromAnnotCategory_tempo #ediromAnnotCategory_notation"/>
</annot>
```

The `categories` and `priorities` were defined in `work/classification` using the `classCode` and `termList` elements:

```xml
<classification>
    <classCode xml:id="ediromCategory"/>
    <classCode xml:id="ediromPriority"/>
    <termList classcode="#ediromCategory">
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_dir">
            <name xml:lang="en">Directive</name>
            <name xml:lang="de">Spielanweisung</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_dynam">
            <name xml:lang="en">Dynamics</name>
            <name xml:lang="de">Dynamik</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_slur">
            <name xml:lang="en">Slurs</name>
            <name xml:lang="de">Bogensetzung</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_articulation">
            <name xml:lang="en">Articulation</name>
            <name xml:lang="de">Artikulation</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_pitch">
            <name xml:lang="en">Pitch</name>
            <name xml:lang="de">Tonhöhe</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_dur">
            <name xml:lang="en">Rhythm</name>
            <name xml:lang="de">Tondauern</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_tie">
            <name xml:lang="en">Ties</name>
            <name xml:lang="de">Bogensetzung</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_accidental">
            <name xml:lang="en">Accidentals</name>
            <name xml:lang="de">Akzidentien</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_clef">
            <name xml:lang="en">Clefs</name>
            <name xml:lang="de">Schlüssel</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_voicing">
            <name xml:lang="en">Voices</name>
            <name xml:lang="de">Stimmen</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_notation">
            <name xml:lang="en">Notation</name>
            <name xml:lang="de">Notation</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_fermata">
            <name xml:lang="en">Articulation</name>
            <name xml:lang="de">Artikulation</name>
        </term>

        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_agogics">
            <name xml:lang="en">Agogics</name>
            <name xml:lang="de">Agogik</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_tempo">
            <name xml:lang="en">Tempo</name>
            <name xml:lang="de">Tempo</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_lyrics">
            <name xml:lang="en">Lyrics</name>
            <name xml:lang="de">Text</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_intervention">
            <name xml:lang="en">Editorial Intervention</name>
            <name xml:lang="de">Hg.-Korrektur</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_perfMedium">
            <name xml:lang="en">Instrumentation</name>
            <name xml:lang="de">Besetzung</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_ornamentation">
            <name xml:lang="en">Ornamentation</name>
            <name xml:lang="de">Verzierung</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_correction">
            <name xml:lang="en">Correction</name>
            <name xml:lang="de">Korrektur</name>
        </term>
        <term classcode="#ediromCategory" xml:id="ediromAnnotCategory_partWriting">
            <name xml:lang="en">Part Writing</name>
            <name xml:lang="de">Tonsatz</name>
        </term>
    </termList>
    <termList classcode="#ediromPriority">
        <term classcode="#ediromPriority" xml:id="ediromAnnotPrio1">
            <name xml:lang="en">Priority 1</name>
            <name xml:lang="de">Priorität 1</name>
        </term>
        <term classcode="#ediromPriority" xml:id="ediromAnnotPrio2">
            <name xml:lang="en">Priority 2</name>
            <name xml:lang="de">Priorität 2</name>
        </term>
        <term classcode="#ediromPriority" xml:id="ediromAnnotPrio3">
            <name xml:lang="en">Priority 3</name>
            <name xml:lang="de">Priorität 3</name>
        </term>
    </termList>
    <termList>
        <term>MusicalWork</term>
    </termList>
</classification>
```

_Edirom Online Backend_ still conforms to Edirom Online API 1.0.0 and delivers the `categories` and `priority` fields for each annotation.

Moreover, at the `getAnnotations.xql` endpoint, the _Edirom Online Backend_ delivers a `legacyFields` entry. It lists `categories` and `priority` **only when the returned annotations actually carry taxonomy-derived fields** (i.e. when some field beyond the base set `id, title, categories, priority, pos, sigla` is present); if no such fields exist, `legacyFields` is empty — the legacy fields are then the only classification data and are deliberately not flagged for suppression. This allows frontends relying on _Edirom Online API 1.0.0_ to continue receiving their expected fields, while frontends that implement dynamic taxonomy fields can use it to ignore `legacyFields`. To hide the _legacy fields_ by default – even though they might have been populated – a new key was introduced to the Edirom preferences: `annotation_hide_legacy_fields`. If unset, the _AnnotationView_ will default it to `false`. If set to `true`, the _legacy fields_ will not appear in both the annotation list and single views.
