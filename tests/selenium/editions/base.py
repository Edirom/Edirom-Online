"""
Base class for edition profiles.

Each edition that should be testable with the Selenium test suite needs a
profile — a Python object that describes the edition's structure and content.

Adding a new edition:
  1. Create a file editions/<yourname>.py
  2. Instantiate EditionProfile with the correct values
  3. Register it in conftest.py under EDITION_PROFILES

Running tests against a specific edition:
  EDITION_ID=<id> pytest tests/selenium/
"""
from dataclasses import dataclass, field


@dataclass
class EditionProfile:
    # -----------------------------------------------------------------------
    # Identity
    # -----------------------------------------------------------------------

    # The edition's xml:id as it appears in the edition XML file.
    # This is passed as the ?edition= URL parameter.
    edition_id: str

    # Human-readable name, used in skip messages and error output.
    name: str

    # Base path of all edition content in eXist-db (used to build URIs).
    # Example: "xmldb:exist:///db/apps/weber-klarinettenquintett-eol-emeritus"
    base_uri: str

    # Path to the main edition XML file relative to base_uri.
    edition_xml_path: str

    # -----------------------------------------------------------------------
    # Search
    # -----------------------------------------------------------------------

    # Set to True if this edition has a working Lucene index (ft:query works).
    # When False, content-level search tests are automatically skipped.
    has_working_search: bool

    # A search term that is guaranteed to exist in the edition data.
    # Used by content-level search tests (skipped when has_working_search=False).
    search_term_with_hits: str

    # A search term that is guaranteed NOT to exist in any edition.
    search_term_no_hits: str = "xyzzy_not_in_any_edition_42"

    # -----------------------------------------------------------------------
    # Sources and Works
    # -----------------------------------------------------------------------

    # List of (filename, title) tuples for MEI sources.
    # filename is relative to base_uri + /sources/ (or as deployed in eXist-db).
    sources: list = field(default_factory=list)

    # List of (filename, title) tuples for works.
    works: list = field(default_factory=list)

    # -----------------------------------------------------------------------
    # Convenience properties
    # -----------------------------------------------------------------------

    @property
    def edition_uri(self) -> str:
        return f"{self.base_uri}/{self.edition_xml_path}"

    @property
    def work_title(self) -> str:
        """Title of the first (or only) work — shown in the TopBar work switcher."""
        return self.works[0][1] if self.works else ""

    @property
    def has_multiple_works(self) -> bool:
        """True if the edition has more than one work (Band switcher shows a menu)."""
        return len(self.works) > 1
