"""
Tests: TopBar

The TopBar is the toolbar at the top of the screen. It contains:
  - Home button + edition label (left)
  - Work switcher button — shows current work title, opens dropdown for multiple works
  - Search field + search button (magnifying glass icon, right)

Content of these tests:
  1. Search button (magnifying glass without text) → Search window opens
  2. Enter term in search field + press Enter → Search window opens and backend responds
  3. Enter term in search field + click magnifying glass → same
  4. Work switcher shows current work title
  5. Work switcher opens dropdown when multiple works exist (Bände)

Tests for WHAT the Search window shows (results, counts, links) are in
test_search_window.py.
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from pages.app import AppPage
from pages.topbar import TopBar
from conftest import DEFAULT_TIMEOUT, ACTIVE_EDITION


class TestTopBar:
    """Tests for the TopBar (top toolbar)."""

    def test_search_button_opens_window(self, driver):
        """
        WHAT THIS TESTS:
            Clicking the search icon in the TopBar opens the Search window.

        HOW TO READ THE RESULT:
            PASSED → Search window appeared after clicking the button
            FAILED → Button not found, or Search window did not open
        """
        AppPage(driver).open()
        TopBar(driver).click_search_button()

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.visibility_of_element_located((By.ID, "searchTextField")),
            message="Search window did not open after clicking the search button."
        )

    def test_search_by_pressing_enter(self, driver):
        """
        WHAT THIS TESTS:
            Typing a term in the search field and pressing Enter opens the
            Search window and triggers a search (backend responds).

        HOW TO READ THE RESULT:
            PASSED → Search window opened and backend responded
            FAILED → Window did not open, or AJAX request never completed
        """
        AppPage(driver).open()
        TopBar(driver).search("Abschied")

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.visibility_of_element_located((By.ID, "searchTextField")),
            message="Search window did not open."
        )
        wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".searchWindow .searchResultOverview")
            ),
            message="Search result overview did not appear — backend may not have responded."
        )

    def test_search_by_clicking_magnifier(self, driver):
        """
        WHAT THIS TESTS:
            Typing a term and clicking the magnifying glass icon (instead of
            pressing Enter) also executes the search and shows results.

        HOW TO READ THE RESULT:
            PASSED → Search window opened and backend responded after button click
            FAILED → Magnifier button not found, or search did not execute
        """
        AppPage(driver).open()
        TopBar(driver).search_by_clicking_button("Abschied")

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.visibility_of_element_located((By.ID, "searchTextField")),
            message="Search window did not open after clicking the magnifier."
        )
        wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".searchWindow .searchResultOverview")
            ),
            message="Search result overview did not appear after clicking the magnifier."
        )

    # -------------------------------------------------------------------------
    # WORK SWITCHER TESTS
    # The TopBar contains a button (id="workSwitch") that displays the current
    # work title. When the edition has multiple works (Bände), clicking it
    # opens a dropdown menu to switch between them.
    # -------------------------------------------------------------------------

    def test_work_switcher_shows_work_title(self, driver, edition):
        """
        WHAT THIS TESTS:
            The work switcher button in the TopBar displays the title of the
            current work. This confirms the edition loaded correctly and the
            work title was passed to the UI.

        HOW TO READ THE RESULT:
            PASSED → Work switcher button is visible and contains the expected title
            FAILED → Button not found, or title does not match the edition profile
        """
        if not edition.work_title:
            pytest.skip(f"{edition.name}: no works defined in edition profile")

        AppPage(driver).open()
        actual_title = TopBar(driver).get_work_switch_text()

        assert edition.work_title in actual_title, (
            f"Expected work title '{edition.work_title}' in work switcher, "
            f"but got: '{actual_title}'"
        )

    @pytest.mark.skipif(
        not ACTIVE_EDITION.has_multiple_works,
        reason="EXPECTED: Edition has only one work — band switcher dropdown is not shown."
    )
    def test_work_switcher_opens_menu_for_multiple_works(self, driver, edition):
        """
        WHAT THIS TESTS:
            When the edition has multiple works (Bände), clicking the work
            switcher button opens a dropdown menu listing all works.

        HOW TO READ THE RESULT:
            PASSED → Dropdown appeared and lists at least 2 works
            SKIPPED → Edition has only one work (no dropdown needed)
            FAILED → Dropdown did not open, or fewer items than works
        """
        if not edition.has_multiple_works:
            pytest.skip(f"{edition.name}: only one work, no switcher menu")

        AppPage(driver).open()
        topbar = TopBar(driver)
        topbar.click_work_switch()

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.presence_of_element_located(topbar.WORK_MENU_ITEMS),
            message="Work switcher dropdown did not open."
        )

        items = driver.find_elements(*topbar.WORK_MENU_ITEMS)
        assert len(items) >= len(edition.works), (
            f"Expected {len(edition.works)} works in switcher menu, found {len(items)}."
        )
