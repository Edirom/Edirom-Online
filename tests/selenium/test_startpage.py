"""
Tests: Startpage

Tests for the initial page load and edition selection behavior.

Start page behavior (Application.js):
  - No ?edition= parameter → app calls getEditions.xql
      - 0 editions found  → shows "No editions found."
                            NOT TESTED: would require deleting all editions from
                            eXist-db, which is destructive and breaks all other tests.
                            This case belongs in a JavaScript unit test for Application.js.
      - 1 edition found   → loads that edition directly (no selection screen)
                            → TestStartPage::test_start_page_without_edition_param
      - 2+ editions found → shows selection screen "Bitte Edition auswählen"
                            → TestEditionChooser (auto-skipped when < 2 editions deployed)
  - ?edition=<id> given  → loads that edition directly
                            → TestStartPage::test_start_page_with_edition_param_loads_directly
"""
import json
import urllib.request

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from conftest import BASE_URL, EDITION_URL, DEFAULT_TIMEOUT


# ---------------------------------------------------------------------------
# Edition detection helper (used by TestEditionChooser)
# ---------------------------------------------------------------------------

EDITIONS_URL = "http://localhost:8080/exist/apps/Edirom-Online-Backend/data/xql/getEditions.xql"


def get_deployed_editions():
    """Query getEditions.xql and return a list of edition dicts."""
    try:
        with urllib.request.urlopen(EDITIONS_URL, timeout=10) as response:
            data = json.loads(response.read().decode())
            if isinstance(data, list):
                return data
            elif isinstance(data, dict) and "id" in data:
                return [data]
            return []
    except Exception:
        return []


def requires_multiple_editions():
    """Returns a pytest.mark.skipif that skips unless 2+ editions are deployed."""
    editions = get_deployed_editions()
    count = len(editions)
    return pytest.mark.skipif(
        count < 2,
        reason=(
            f"EXPECTED: Only {count} edition(s) deployed — need at least 2 "
            "for the edition chooser to appear. Deploy a second edition via the "
            "Dashboard (http://localhost:8080/exist/apps/dashboard/) to run these tests."
        )
    )


class TestStartPage:
    """Tests that verify the application starts and its main frame is visible."""

    def test_page_responds(self, driver):
        """
        WHAT THIS TESTS:
            The app is reachable at all — http://localhost:8089 returns a page.

        HOW TO READ THE RESULT:
            PASSED → Docker is running and nginx responds
            FAILED → Docker is not running, or port is wrong
        """
        driver.get(BASE_URL)

        # The page title should contain "Edirom"
        assert "Edirom" in driver.title, (
            f"Expected 'Edirom' in page title, but got: '{driver.title}'\n"
            f"Is Docker running? Try: docker ps"
        )

    def test_app_fully_loaded(self, driver):
        """
        WHAT THIS TESTS:
            The ExtJS application has fully initialized. The TaskBar (bottom toolbar)
            is the last element to appear during app startup — its presence proves
            the full app booted without a fatal error.

            This is a load test, NOT a TaskBar functionality test.
            TaskBar behavior (buttons, clock, etc.) is covered in test_taskbar.py.

        HOW TO READ THE RESULT:
            PASSED → The full ExtJS app loaded successfully
            FAILED → Either the app is still loading (increase timeout)
                     or there is a JavaScript error preventing load
        """
        # EDITION_URL includes ?edition=... so the app skips the selection screen
        # and loads the full app directly (with TaskBar, Navigator, etc.)
        driver.get(EDITION_URL)

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)

        # Wait until the TaskBar element appears in the DOM
        # The ID 'ediromTaskbar' is defined in app/view/desktop/TaskBar.js line 33
        taskbar = wait.until(
            EC.presence_of_element_located((By.ID, "ediromTaskbar")),
            message=(
                f"TaskBar did not appear within {DEFAULT_TIMEOUT} seconds.\n"
                f"Check the browser console for JavaScript errors."
            )
        )

        # Also check it is actually visible (not hidden by CSS)
        assert taskbar.is_displayed(), "TaskBar exists in DOM but is not visible"

    def test_no_javascript_errors(self, driver):
        """
        WHAT THIS TESTS:
            There are no severe JavaScript errors in the browser console after loading.

        HOW TO READ THE RESULT:
            PASSED → No critical JS errors on startup
            FAILED → Check the printed error messages — they show exactly what went wrong
        """
        driver.get(EDITION_URL)

        # Wait for app to load first
        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(EC.presence_of_element_located((By.ID, "ediromTaskbar")))

        # These resources are optional and expected to be missing — ignore their 404s
        EXPECTED_MISSING = ("favicon.ico", "config.json")

        # Collect browser console errors, excluding known harmless 404s
        severe_logs = [
            log for log in driver.get_log("browser")
            if log["level"] == "SEVERE"
            and not any(name in log["message"] for name in EXPECTED_MISSING)
        ]

        # Print them for easier debugging if the test fails
        if severe_logs:
            error_messages = "\n".join(
                f"  [{log['level']}] {log['message']}" for log in severe_logs
            )
            assert False, f"JavaScript errors found on page load:\n{error_messages}"

    def test_start_page_without_edition_param(self, driver):
        """
        WHAT THIS TESTS:
            Opening the app without a ?edition= parameter triggers the edition
            detection logic in Application.js. With exactly one edition deployed,
            the app should load that edition directly (no selection screen needed).
            With multiple editions deployed, a selection screen appears — that
            case is covered by TestEditionChooser below.

        HOW TO READ THE RESULT:
            PASSED → App loaded an edition automatically (1 edition deployed)
            SKIPPED → Selection screen appeared (multiple editions) — see TestEditionChooser
            FAILED → Neither TaskBar nor chooser appeared
        """
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)

        # Wait for either the TaskBar (1 edition → auto-load) or the chooser
        # heading (2+ editions → selection screen). Whichever appears first wins.
        wait.until(
            lambda d: (
                d.find_elements(By.ID, "ediromTaskbar") or
                d.find_elements(By.CSS_SELECTOR, ".navigatorCategoryTitle")
            ),
            message="Neither TaskBar nor edition chooser appeared within the timeout."
        )

        if driver.find_elements(By.CSS_SELECTOR, ".navigatorCategoryTitle"):
            pytest.skip(
                "EXPECTED: Multiple editions deployed — app correctly shows selection screen. "
                "test_edition_chooser.py verifies this behavior."
            )

    def test_start_page_with_edition_param_loads_directly(self, driver):
        """
        WHAT THIS TESTS:
            When ?edition=<id> is given in the URL, the app skips any selection
            screen and loads that specific edition directly.

        HOW TO READ THE RESULT:
            PASSED → TaskBar appeared after loading with explicit edition parameter
            FAILED → App did not load even with a valid edition parameter
        """
        driver.get(EDITION_URL)
        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.presence_of_element_located((By.ID, "ediromTaskbar")),
            message=(
                f"TaskBar did not appear when loading with ?edition= parameter.\n"
                f"URL used: {EDITION_URL}"
            )
        )


# ---------------------------------------------------------------------------
# Edition Chooser — only runs when 2+ editions are deployed in eXist-db
# ---------------------------------------------------------------------------

class TestEditionChooser:
    """
    Tests for the edition selection screen (shown when 2+ editions are deployed).

    Edition Chooser behavior (Application.js):
      When getEditions.xql returns multiple editions, Application.js renders:
        <h3 class="navigatorCategoryTitle">Bitte Edition auswählen</h3>
        ... one entry per edition with links for each available language ...

      Clicking a link sets ?edition=<id>&lang=<lang> and reloads the page,
      which then loads that edition directly.
    """

    @requires_multiple_editions()
    def test_chooser_appears_when_multiple_editions(self, driver):
        """
        WHAT THIS TESTS:
            When multiple editions are deployed, opening the app without
            ?edition= shows a selection screen with the heading
            "Bitte Edition auswählen".

        HOW TO READ THE RESULT:
            PASSED → Selection screen appeared with the expected heading
            SKIPPED → Fewer than 2 editions deployed (normal single-edition setup)
            FAILED → App loaded directly instead of showing the chooser
        """
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)

        heading = wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".navigatorCategoryTitle")
            ),
            message=(
                "Edition chooser heading did not appear even though multiple "
                "editions are deployed. Check Application.js and getEditions.xql."
            )
        )
        assert "auswählen" in heading.text or "Edition" in heading.text, (
            f"Unexpected heading text: '{heading.text}'"
        )

    @requires_multiple_editions()
    def test_chooser_lists_all_deployed_editions(self, driver):
        """
        WHAT THIS TESTS:
            The selection screen shows one entry per deployed edition,
            each with at least one clickable link.

        HOW TO READ THE RESULT:
            PASSED → At least 2 edition links are visible
            SKIPPED → Fewer than 2 editions deployed
            FAILED → Fewer links than deployed editions
        """
        editions = get_deployed_editions()
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)

        wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".navigatorCategoryTitle"))
        )

        links = driver.find_elements(By.CSS_SELECTOR, "a.x-btn")
        assert len(links) >= len(editions), (
            f"Expected at least {len(editions)} edition links, found {len(links)}."
        )

    @requires_multiple_editions()
    def test_chooser_link_loads_edition(self, driver):
        """
        WHAT THIS TESTS:
            Clicking an edition link on the selection screen navigates to that
            edition — i.e. the URL changes to include ?edition=<id>.
            The full app load is tested separately in test_app_fully_loaded.

        HOW TO READ THE RESULT:
            PASSED → URL changed to include ?edition= after clicking a link
            SKIPPED → Fewer than 2 editions deployed
            FAILED → URL did not change — link was not clickable or navigation failed
        """
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)

        wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".navigatorCategoryTitle"))
        )

        first_link = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "a.x-btn"))
        )
        first_link.click()

        wait.until(
            EC.url_contains("edition="),
            message="URL did not change to ?edition=... after clicking an edition link."
        )
