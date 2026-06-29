"""
Edition profile: Weber Klarinettenquintett op. 34 WeV P.11
https://git.uni-paderborn.de/wega/klarinettenquintett-edirom
Release 1.1.1 XAR: https://git.uni-paderborn.de/-/project/7894/uploads/0e0c97b029820cc94302d4c6151bec79/weber-klarinettenquintett-eol-emeritus.xar

Content:
  - 9 sources:
      source-1  Autograph A
      source-2  Erstdruck I ED₁
      source-3  Stichvorlage K/sv
      source-4-MEI  Quintett für Klarinette ... B-Dur  (MEI, has editorialComment annotations)
      source-5  Erstdruck II ED₂
      source-6  Baermann-st/Baermann D⁺-st
      source-7  Baermann-kl/Baermann D⁺-kl
      source-8  Ebers D-arr
      source-9  Hermann/Hermann D⁺-arr
  - 1 Work: edition-27830471_work-1

Search:
  - has_working_search = True
    The frontend's doAJAXRequest() wrapper automatically adds the resolved
    edition URI to every AJAX call via Ext.applyIf(params, {edition: activeEdition}).
    This edition's pre-install.xql correctly deploys collection.xconf to the
    mirrored path /db/system/config/db/apps/weber-klarinettenquintett-eol-emeritus/
    collection.xconf (verified in eXist-db), so ft:query() finds results.
    Verified: 'Bogensetzung' → 21 hits, 'Kurzum' → 1 hit.
"""
from .base import EditionProfile

_BASE = "xmldb:exist:///db/apps/weber-klarinettenquintett-eol-emeritus"

profile = EditionProfile(
    edition_id="edition-27830471",
    name="Weber Klarinettenquintett op. 34 v1.1.1",
    base_uri=_BASE,
    edition_xml_path="edition/edition.xml",
    has_working_search=True,
    search_term_with_hits="Bogensetzung",  # 21 hits across sources and annotations
    sources=[
        ("edition/sources/source-1.xml",       "Autograph A"),
        ("edition/sources/source-2.xml",        "Erstdruck I ED₁"),
        ("edition/sources/source-3.xml",        "Stichvorlage K/sv"),
        ("edition/sources/source-4-MEI.xml",    "Quintett für Klarinette ... B-Dur"),
        ("edition/sources/source-5.xml",        "Erstdruck II ED₂"),
        ("edition/sources/source-6.xml",        "Baermann-st/Baermann D⁺-st"),
        ("edition/sources/source-7.xml",        "Baermann-kl/Baermann D⁺-kl"),
        ("edition/sources/source-8.xml",        "Ebers D-arr"),
        ("edition/sources/source-9.xml",        "Hermann/Hermann D⁺-arr"),
    ],
    works=[
        ("edition/work.xml", "Klarinettenquintett op. 34"),
    ],
)
