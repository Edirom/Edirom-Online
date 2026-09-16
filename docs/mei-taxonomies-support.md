# MEI Taxonomies Support in _Edirom Online_

___
This feature was conceptualized, implemented, and contributed by @bwbohl at the _Bernd Alois Zimmermann Complete Edition_[^1]
___

[^1]: The works of the _Bernd Alois Zimmermann-Gesamtausgabe. Historisch-kritische Ausgabe seiner Werke, Schriften und Briefe_ (_Bernd Alois Zimmermann Complete Edition. Historical-Critical Edition of his Works, Writings, and Letters) are promoted by the Union of the German Academies of Sciences and Humanities, represented by the Academy of Sciences and Humanities Berlin-Brandenburg and the Academy of Sciences and Literature | Mainz, funded by the Federal Ministry of Education and Research, Bonn and Berlin, the Berlin Senate Department for Higher Education and Research, Health and Long-Term Care and the Hessian Ministry of Science and the Arts, Wiesbaden.

Since _MEI 4_, it has been possible to encode taxonomies directly in an MEI file. Moreover, the addition of `@class` to any MEI element introduced a semantically richer approach to classifying elements. _Edirom Online_ picked up these features for assigning categories to annotations. The existing _categories_ and _priorities_ model was transferred to a taxonomy, and assignment to the corresponding values was switched to ID-references (IDREFS) from within `mei:annot/@class`.

Category and priority references — whether in `@class` or in the legacy `mei:ptr/@target` — are resolved via a single shared resolver (`eutil:get-referenced-element`) wherever taxonomy-aware code looks them up: a fragment-only reference (`#someId`) resolves within the annotation’s own document, while a reference that also carries a base part (`taxonomy.xml#someId`, `http://…#someId`) is resolved against the annotation’s base URI. The taxonomy definition may therefore live either in the same file as the annotations or in a separate file that they reference.

> [!NOTE]
> One exception: the deprecated flat `categories`/`priorities` arrays that `getAnnotationInfos.xql` still returns alongside `taxonomies` (see below) resolve collection-wide via `id()` instead of the shared resolver — a known inconsistency the code itself flags for cleanup once those fields are removed.

The simplest setup keeps it in the same file’s `mei:encodingDesc/mei:classDecls`:

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

MEI taxonomies and categories can be nested recursively, i.e., taxonomies can contain taxonomies and categories, and categories can contain other categories. _Edirom Online_ will try to make sense of the discovered structure and use it in the _AnnotationView_ to define list columns in the _ListView_ and metadata fields in the _Single_ view. Moreover, it forms the basis of the annotation filter menu in both _SourceView_ modes, the _PageBasedView_ and the _MeasureBasedView_.

> [!NOTE]
> While reference _resolution_ is shared, the two contexts deliberately traverse different sets of annotations. The _AnnotationView_ (_ListView_ and _Single_ view, served by `getAnnotations.xql`) is scoped to a single work or annotation file — that file _is_ the list, which is what allows several lists, held in separate files, to be viewed independently. The _SourceView_ filter menu (served by `getAnnotationInfos.xql`) is scoped to the current source and therefore gathers every annotation _about_ that source from across the edition (matched via `@plist`), plus any inline ones. These scopes are intentionally different and are not expected to coincide.

## How the Backend Interprets the Taxonomy Structure

The backend XQL endpoint `getAnnotationInfos.xql` drives the filter menus in the source facsimile views, the grouping and labelling logic itself lives in the shared `annotation.xqm`/`taxonomy.xqm` modules (`annotation:get-referenced-categories-as-taxonomy-array` and its helpers) — `getAnnotationInfos.xql` just calls into them. The effective logic is:

1. Collect all `mei:annot[@type = 'editorialComment']` elements from the MEI file and, above that, all those from the edition’s collection whose `@plist` references the current document URI.
2. For each annotation, split `@class` into space-separated tokens and keep only those that contain a `#`. Each kept token is resolved to a category element: a fragment-only token (`#someId`) is resolved within the annotation’s own document, while a token that also carries a base part (`taxonomy.xml#someId`, `http://…#someId`) is resolved against the annotation’s base URI and opened with `doc()`. Tokens without a `#` are ignored. (This resolution is shared with `getAnnotations.xql`: category, priority and taxonomy references all go through the same resolver, so cross-file references behave identically across endpoints.)
3. Keep only resolved elements that are `mei:category` — a token that resolves to anything else, or that doesn't resolve at all, is ignored. (There's no separate check for an ancestor `mei:taxonomy` here: in valid MEI, `mei:category` can only ever occur inside a `mei:taxonomy` — directly, or nested inside another category that ultimately sits inside one — so being a `mei:category` already implies that.)
4. Group the identified categories by their **taxonomy group identifier**: the string after `#` in the category’s own `@class` attribute (e.g. `#ediromPriority` → `ediromPriority`) if present, otherwise the `@xml:id` of the _innermost_ ancestor `mei:taxonomy`.
5. Each group produces one filter menu. Its display label is resolved server-side from the innermost ancestor `mei:taxonomy`: if it has an `@label`, that value is used. Otherwise the backend just sends the grouping identifier (from step 4) back as the label.

   The frontend then treats a label that's identical to the id as a signal that no real label was resolved, and looks *that* up in the locale files at render time (`taxonomy.label !== taxonomy.id ? taxonomy.label : getLangString(taxonomy.id)`, in `SourceView.js`/`TextView.js`/`TextFacsimileSplitView.js`) — so if the edirom or edition specific locale files provide an entry with that key, the group with no `@label` still gets a human-readable menu title, just resolved client-side rather than by the backend. This is also where edition-specific overrides can happen.

   > [!NOTE]
   > Although `mei:taxonomy` may have localisable `mei:head` child elements, these are not used — a heading would be excessive for this use case. The locale-driven frontend fallback lets the display value be adjusted (and localised) without touching the taxonomy definition. It does *not* switch between singular and plural forms here — the `_multiple`-suffixed locale keys and the code that consults them belong to the separate `getAnnotationMeta.xql` endpoint, unrelated to this filter menu.

6. Within a group, each deduplicated category becomes one filter item, sorted alphabetically by its localised label. The item label is resolved from the category in this order: an `mei:label` whose `@xml:lang` matches the requested language, then a language-neutral label (the first `mei:label` without `@xml:lang`, else `@label`, else the first `mei:label`), then the category’s own `@xml:id`. The frontend displays this label as-is (it arrives as the item’s `name` field); unlike the group label in step 5, category items currently have **no** locale-file fallback.

### Consequences for MEI encoding

**A taxonomy only appears as a filter menu if at least one annotation actually references one of its categories.** Taxonomies or categories that exist in `mei:classDecls` but are never used in `@class` are silently ignored.

**A category only becomes a filter item if it is directly referenced.** Parent or sibling categories that are not themselves referenced by an annotation are not included.

**Within each taxonomy group the filter is OR; across groups it behaves as an AND, but only over the groups an annotation actually participates in.** An annotation is hidden only if there is some taxonomy group in which it carries one or more categories yet none of those categories are currently checked. A group in which the annotation has no category at all imposes no constraint on it — so this is _not_ a strict AND across _all_ active groups, only across those the annotation belongs to.<!-- TODO this is a legacy dependency -> make configurable -->

### Two patterns for identifying the taxonomy group

**Pattern A — taxonomy with `@xml:id`:** The inner taxonomy carries its own ID, which is used directly as the group key, and its `@label` (if present) as the group label — note this has to be a single, non-localised string, since `mei:taxonomy` has no `mei:label` children of its own, unlike `mei:category`, e.g.:

```xml
<taxonomy xml:id="myAnnotationTypes" label="Annotation Types">
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

## Pre MEI 4

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

### Legacy fields and the `mode` parameter

The `mode` request parameter is a contract selector, not a rendering switch. A request **without** `mode=taxonomies` receives strict _Edirom Online API 1.0.0_ data: the `categories` and `priority` fields are always delivered, exactly as before.

In `mode=taxonomies` the _Edirom Online Backend_ omits the flattened `categories` and `priority` fields, but **only when doing so loses no information** — that is, when the document's classification is fully expressible as taxonomy fields. A document qualifies when none of its annotations carries a legacy `mei:ptr[@type='categories'|'priority']` and every `@class` token resolves into a `mei:taxonomy`. Classifications modelled as `mei:term` inside `mei:classification/mei:termList` (as in the example above) resolve *outside* `mei:taxonomy` and therefore keep the flattened fields, as do dangling `@class` references.

The decision is made once per document rather than per annotation, so the delivered field set stays uniform across the whole result. A single annotation still using the `mei:ptr` mechanism keeps the flattened fields for every annotation in that document.

Consumers therefore read field *presence* — reported in the `fields` entry at the `getAnnotations.xql` endpoint — as the signal: if `categories` and `priority` are absent, the taxonomy fields carry the complete classification. The `emptyFields` entry is unrelated and continues to flag fields that are empty across all returned annotations.
