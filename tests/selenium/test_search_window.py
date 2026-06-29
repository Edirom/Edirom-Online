"""
Tests: Search Window

The Search window opens when the user triggers a search from the TopBar.
It displays search results from the backend (eXist-db Lucene full-text search).

Content of these tests:
  1. Searching for a term that exists → Search window shows results
  2. Searching for a term that does not exist → "no results" message appears
  3. Result overview shows the hit count
  4. Clicking a result title opens the corresponding source/work window

Note on skipping:
  Tests that check for actual search hits (1, 3, 4) require a working Lucene
  index in eXist-db. They are automatically skipped when has_working_search=False
  in the active edition profile.

  The "no results" test (2) always runs — it does not need a working index.
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from pages.app import AppPage
from pages.topbar import TopBar
from conftest import DEFAULT_TIMEOUT, ACTIVE_EDITION


class TestSearchWindow:
    """Tests for the Search window content and behavior."""

    def test_search_no_results(self, driver):
        """
        WHAT THIS TESTS:
            Searching for a term that does not exist in any edition shows
            a "no results" message instead of crashing or hanging.

        HOW TO READ THE RESULT:
            PASSED → Search ran and the no-results message appeared
            FAILED → Search window did not open, or the no-results state was not shown
        """
        AppPage(driver).open()
        TopBar(driver).search("xyzzy_not_in_edition_42")

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.visibility_of_element_located((By.ID, "searchTextField")),
            message="Search window did not open."
        )
        wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".searchWindow .searchResultOverview")
            ),
            message="Expected a 'no results' message for nonsense search term."
        )

    @pytest.mark.skipif(
        not ACTIVE_EDITION.has_working_search,
        reason="Requires working Lucene index. Set has_working_search=True in the edition profile."
    )
    def test_search_finds_results(self, driver, edition):
        """
        WHAT THIS TESTS:
            Searching for a term that exists in the edition returns at least
            one result with a .searchResultDoc element.

        PRECONDITIONS FOR THIS TEST TO PASS:
            - edition_path in prefs.xml must point to the collection root
            - A Lucene index config must be deployed to the correct mirrored
              path in /db/system/config/...

        HOW TO READ THE RESULT:
            PASSED → Search found results for the edition's search term
            SKIPPED → Edition does not have a working search index
            FAILED → Index not active, or edition_path is wrong
        """
        if not edition.has_working_search:
            pytest.skip(f"{edition.name}: search index not active")
        AppPage(driver).open()
        TopBar(driver).search(edition.search_term_with_hits)

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.visibility_of_element_located((By.ID, "searchTextField")),
            message="Search window did not open."
        )
        wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".searchWindow .searchResultDoc")
            ),
            message=f"No results found for '{edition.search_term_with_hits}'."
        )

    @pytest.mark.skipif(
        not ACTIVE_EDITION.has_working_search,
        reason="Requires working Lucene index. Set has_working_search=True in the edition profile."
    )
    def test_search_result_count_shown(self, driver, edition):
        """
        WHAT THIS TESTS:
            The result overview line shows a hit count number,
            e.g. "Found hits in 2 objects". This verifies the UI correctly
            renders the count returned by the backend.

        HOW TO READ THE RESULT:
            PASSED → Overview contains a number greater than 0
            SKIPPED → Edition does not have a working search index
            FAILED → No hits found, or count element not rendered
        """
        if not edition.has_working_search:
            pytest.skip(f"{edition.name}: search index not active")
        AppPage(driver).open()
        TopBar(driver).search(edition.search_term_with_hits)

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.visibility_of_element_located((By.ID, "searchTextField")),
            message="Search window did not open."
        )
        overview = wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".searchWindow .searchResultOverview .num")
            ),
            message="Hit count (.num) not found — either no results or index not active."
        )
        assert int(overview.text) > 0, "Expected hit count > 0"

    @pytest.mark.skipif(
        not ACTIVE_EDITION.has_working_search,
        reason="Requires working Lucene index. Set has_working_search=True in the edition profile."
    )
    def test_search_result_link_opens_source(self, driver, edition):
        """
        WHAT THIS TESTS:
            Clicking a result title link in the Search window opens the
            corresponding source or work window.

        HOW TO READ THE RESULT:
            PASSED → A content window appeared after clicking the result link
            SKIPPED → Edition does not have a working search index
            FAILED → No results found, or click did not open a window
        """
        if not edition.has_working_search:
            pytest.skip(f"{edition.name}: search index not active")
        AppPage(driver).open()
        TopBar(driver).search(edition.search_term_with_hits)

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.visibility_of_element_located((By.ID, "searchTextField")),
            message="Search window did not open."
        )
        result_link = wait.until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".searchWindow .resultTitle")
            ),
            message="No clickable result title found."
        )
        result_link.click()

        # After clicking a result, a content window appears. In this frontend
        # all windows share only the 'ediromWindow' class — there is no separate
        # 'sourceWindow' or 'workWindow' class. We look for any ediromWindow that
        # is not the search window itself.
        wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".ediromWindow:not(.searchWindow)")
            ),
            message="No source or work window opened after clicking the search result."
        )
