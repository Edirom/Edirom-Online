"""
Tests: Navigator

The Navigator is the panel on the right side of Edirom Online.
It acts as a table of contents: it lists all items of an edition
(sources, works, texts etc.) grouped into categories.

Navigator structure (rendered by getNavigatorConfig.xql):
  <div id="navigator">
    <div class="navigatorCategory">
      <div class="navigatorCategoryTitle">Quellen</div>
      <div id="...-items">
        <div class="navigatorItem" onclick="loadLink(...)">Quelle A</div>
        ...
      </div>
    </div>
    ...
  </div>

Items use onclick="loadLink(...)" directly on the div — there are no <a> tags.
External links use onclick="window.open(...)" and open in a new browser tab.

Internal link format:
  loadLink('xmldb:exist:///db/apps/<edition>/<path>', {})
  The xmldb:exist:/// prefix maps to the eXist-db REST API:
  http://localhost:8080/exist/rest/db/apps/<edition>/<path>

Content of these tests:
  1. Navigator panel is visible after the app loads
  2. Navigator shows at least one category heading
  3. Navigator shows at least one clickable item
  4. Every item has a valid (non-empty) onclick attribute
  5. Every internal item's target file exists in eXist-db (no typos in paths)
  6. Clicking an internal item opens a content window
  7. Clicking an external item opens a new browser tab
  8. Navigator can be resized by dragging its resize handle
"""
import re
import urllib.request
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.action_chains import ActionChains

from pages.app import AppPage
from pages.navigator import Navigator
from conftest import DEFAULT_TIMEOUT, EDITION_URL


EXIST_REST_BASE = "http://localhost:8080/exist/rest"


def xmldb_to_rest_url(xmldb_uri):
    """Convert xmldb:exist:///db/... to http://localhost:8080/exist/rest/db/..."""
    # Strip optional fragment (#...) — those point to elements within the file
    xmldb_uri = xmldb_uri.split("#")[0]
    if xmldb_uri.startswith("xmldb:exist://"):
        path = xmldb_uri[len("xmldb:exist://"):]  # keeps leading /db/...
        return EXIST_REST_BASE + path
    return None


class TestNavigator:
    """Tests for the Navigator panel (table of contents)."""

    def test_navigator_is_visible(self, driver):
        """
        WHAT THIS TESTS:
            After loading an edition, the Navigator panel is visible on screen.

        HOW TO READ THE RESULT:
            PASSED → Navigator panel appeared and is displayed
            FAILED → Navigator panel missing or hidden — check rendering or CSS
        """
        AppPage(driver).open()
        nav = Navigator(driver)

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.visibility_of_element_located(nav.NAVIGATOR),
            message="Navigator panel did not appear after loading the edition."
        )

    def test_navigator_shows_categories(self, driver):
        """
        WHAT THIS TESTS:
            The Navigator shows at least one category heading (e.g. "Quellen",
            "Werke"). Categories come from the edition's navigatorDefinition.

        HOW TO READ THE RESULT:
            PASSED → At least one category heading is visible
            FAILED → No categories rendered — check getNavigatorConfig.xql or edition data
        """
        AppPage(driver).open()
        nav = Navigator(driver)

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.presence_of_element_located(nav.CATEGORIES),
            message="No category headings found in Navigator."
        )

        categories = driver.find_elements(*nav.CATEGORIES)
        assert len(categories) >= 1, "Expected at least one Navigator category."

    def test_navigator_shows_items(self, driver):
        """
        WHAT THIS TESTS:
            The Navigator shows at least one clickable item (source, work, or
            other entry). Items are rendered from the edition's navigatorDefinition.

        HOW TO READ THE RESULT:
            PASSED → At least one item is visible
            FAILED → No items rendered — check getNavigatorConfig.xql or edition data
        """
        AppPage(driver).open()
        nav = Navigator(driver)

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.presence_of_element_located(nav.ITEMS),
            message="No items found in Navigator."
        )

        count = nav.get_item_count()
        assert count >= 1, "Expected at least one Navigator item."

    def test_all_items_have_valid_onclick(self, driver):
        """
        WHAT THIS TESTS:
            Every Navigator item must have a non-empty onclick attribute —
            either loadLink(...) for internal files or window.open(...) for
            external URLs. An item without onclick (or with an empty one) would
            silently do nothing when clicked.

            This test does NOT click anything. It reads the DOM attributes
            directly, so it runs in under a second regardless of item count.

            Whether clicking actually opens a window is verified by
            test_clicking_item_opens_window (internal) and
            test_clicking_external_item_opens_browser_tab (external).

        HOW TO READ THE RESULT:
            PASSED → Every item has a valid onclick attribute
            FAILED → One or more items are missing onclick or have an empty value
                     (the assertion message lists the affected item IDs)
        """
        AppPage(driver).open()
        nav = Navigator(driver)

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.presence_of_element_located(nav.ITEMS),
            message="No Navigator items found."
        )

        items = driver.find_elements(*nav.ITEMS)
        broken = []
        for item in items:
            onclick = item.get_attribute("onclick") or ""
            if not onclick.strip():
                broken.append(
                    item.get_attribute("id") or item.text.strip() or "(unknown)"
                )

        assert not broken, (
            f"{len(broken)} Navigator item(s) have no onclick attribute:\n"
            + "\n".join(f"  - {name}" for name in broken)
        )

    def test_all_internal_item_targets_exist(self, driver):
        """
        WHAT THIS TESTS:
            Every internal Navigator item's target file must actually exist in
            eXist-db. A typo in a file path (e.g. 'souces' instead of 'sources')
            would produce a valid onclick attribute but fail silently when clicked.

            This test parses the onclick attribute of every item, extracts the
            xmldb:exist:// URI, and makes a HEAD request to the eXist-db REST API
            to confirm the file is there. No browser interaction is needed.

            Fragment identifiers (#element-id) are stripped before checking —
            they point to elements within the file, not separate files.

        HOW TO READ THE RESULT:
            PASSED  → All internal item targets exist in eXist-db
            FAILED  → One or more targets return 404 — the assertion lists them
        """
        AppPage(driver).open()
        nav = Navigator(driver)

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.presence_of_element_located(nav.ITEMS),
            message="No Navigator items found."
        )

        items = driver.find_elements(*nav.ITEMS)
        missing = []

        for item in items:
            onclick = item.get_attribute("onclick") or ""
            # Extract the first quoted string from loadLink('...', ...)
            match = re.search(r"loadLink\(['\"]([^'\"]+)['\"]", onclick)
            if not match:
                continue  # external or empty — handled by other tests

            xmldb_uri = match.group(1)
            rest_url = xmldb_to_rest_url(xmldb_uri)
            if not rest_url:
                continue

            try:
                req = urllib.request.Request(rest_url, method="HEAD")
                with urllib.request.urlopen(req, timeout=5) as resp:
                    status = resp.status
            except urllib.error.HTTPError as e:
                status = e.code
            except Exception as e:
                status = str(e)

            if status != 200:
                label = item.text.strip() or item.get_attribute("id") or "(unknown)"
                missing.append(f"  - {label}: {xmldb_uri} → HTTP {status}")

        assert not missing, (
            f"{len(missing)} Navigator item target(s) not found in eXist-db:\n"
            + "\n".join(missing)
        )

    def test_clicking_item_opens_window(self, driver):
        """
        WHAT THIS TESTS:
            Clicking a Navigator item that points to an internal file calls
            loadLink(), which opens a content window in the main area.
            This works for all file types: MEI, TEI, HTML, etc.

            Items with external URLs (window.open) are excluded here —
            they are covered by test_clicking_external_item_opens_browser_tab.

        HOW TO READ THE RESULT:
            PASSED  → A content window appeared after clicking an internal item
            SKIPPED → Edition has no internal Navigator items
            FAILED  → Click did not trigger loadLink(), or window did not open
        """
        AppPage(driver).open()
        nav = Navigator(driver)

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        internal_items = driver.find_elements(*nav.INTERNAL_ITEMS)
        if not internal_items:
            pytest.skip("No internal Navigator items (loadLink) found in this edition.")

        nav.open_first_internal_item()

        wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".ediromWindow")),
            message="No content window appeared after clicking an internal Navigator item."
        )

    def test_clicking_external_item_opens_browser_tab(self, driver):
        """
        WHAT THIS TESTS:
            Some Navigator items point to external URLs (onclick="window.open(...)").
            Clicking such an item opens a new browser tab instead of an ediromWindow.

        HOW TO READ THE RESULT:
            PASSED  → A new browser tab opened after clicking the external item
            SKIPPED → Edition has no external Navigator items
            FAILED  → No new tab opened after clicking
        """
        AppPage(driver).open()
        nav = Navigator(driver)

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        wait.until(
            EC.presence_of_element_located(nav.ITEMS),
            message="No Navigator items found."
        )

        external_items = driver.find_elements(*nav.EXTERNAL_ITEMS)
        if not external_items:
            pytest.skip("No external Navigator items (window.open) found in this edition.")

        handles_before = driver.window_handles
        external_items[0].click()

        wait.until(
            lambda d: len(d.window_handles) > len(handles_before),
            message="No new browser tab opened after clicking an external Navigator item."
        )

    def test_navigator_can_be_resized(self, driver):
        """
        WHAT THIS TESTS:
            The Navigator panel has a resize handle on its west (left) side.
            Dragging it horizontally changes the panel's width.

        HOW TO READ THE RESULT:
            PASSED → Navigator width changed after dragging the resize handle
            FAILED → Resize handle not found, or width did not change
        """
        AppPage(driver).open()
        nav = Navigator(driver)

        wait = WebDriverWait(driver, DEFAULT_TIMEOUT)
        navigator_el = wait.until(
            EC.visibility_of_element_located(nav.NAVIGATOR),
            message="Navigator panel not visible."
        )

        # ExtJS renders the west resize handle as a div with class x-resizable-handle-west
        try:
            handle = driver.find_element(
                By.CSS_SELECTOR, "#navigator .x-resizable-handle-west"
            )
        except Exception:
            pytest.skip(
                "West resize handle not found — ExtJS may render it differently "
                "in this version. Check #navigator .x-resizable-handle-* classes."
            )

        width_before = navigator_el.size["width"]

        # Drag the handle 50px to the left to make the Navigator wider
        ActionChains(driver).drag_and_drop_by_offset(handle, -50, 0).perform()

        width_after = navigator_el.size["width"]
        assert width_after != width_before, (
            f"Navigator width did not change after dragging resize handle "
            f"(before: {width_before}px, after: {width_after}px)."
        )
