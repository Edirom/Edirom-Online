"""
Edition profile: EditionExample v0.2.0
https://github.com/Edirom/EditionExample/releases/tag/v0.2.0

Content:
  - 2 MEI sources: "Trüber Abschied (Erstdruck)" and "(Manuskript)"
  - 1 Work: "Trüber Abschied"
"""
from .base import EditionProfile

_BASE = "xmldb:exist:///db/apps/edirom/edition-example/content"

profile = EditionProfile(
    edition_id="edirom_edition_example",
    name="EditionExample v0.2.0",
    base_uri=_BASE,
    edition_xml_path="ediromEditions/edirom_edition_example.xml",
    has_working_search=True,
    search_term_with_hits="wurde",  # found in TEI text (1 hit)
    sources=[
        ("sources/edirom_source_2b2b26e5-c85d-4edd-8806-fe126ce390a2.xml",
         "Trüber Abschied (Erstdruck)"),
        ("sources/edirom_source_47dde5ab-b8ff-4004-bfde-b65ea5a9a15e.xml",
         "Trüber Abschied (Manuskript)"),
    ],
    works=[
        ("works/edirom_work_291f7ad8-9bb8-45eb-9186-801dec2f80d9.xml",
         "Trüber Abschied"),
    ],
)
