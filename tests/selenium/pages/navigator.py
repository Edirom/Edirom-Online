"""
Page Object: Navigator

The Navigator is the panel on the left side of Edirom Online.
It lists all items of an edition (sources, works, texts etc.).
Clicking an item opens a new window.

Since Edirom Online v1.4.0 the Navigator content is rendered by the
<edirom-navigator> web component inside the ExtJS panel #navigator:
  - categories and items live in the component's (open) shadow DOM, so
    they must be looked up via its shadow_root, not via document selectors
  - items have no onclick attribute; their link targets come from the
    JSON in the component's navigator-data attribute

Usage in a test:
    from pages.navigator import Navigator
    nav = Navigator(driver)
    nav.wait_for_items()
    nav.open_first_internal_item()
    nav.open_item_by_name("Quelle A")
"""
import json
import re

from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from conftest import DEFAULT_TIMEOUT


class Navigator:
    """Represents the Navigator panel on the left side of the interface."""

    # The Navigator container (ExtJS panel)
    NAVIGATOR         = (By.ID, "navigator")

    # The web component inside the panel that renders categories and items
    COMPONENT         = (By.CSS_SELECTOR, "#navigator edirom-navigator")

    # CSS selectors inside the component's shadow root.
    # Nested levels get a depth suffix (navigatorItem2, navigatorCategoryTitle2, ...),
    # so the prefix match covers all levels.
    CATEGORIES        = "[class^='navigatorCategoryTitle']"
    ITEMS             = "[class^='navigatorItem']"

    # Link targets: internal files open a content window, external URLs a browser tab
    INTERNAL_PREFIX   = "xmldb:exist://"
    EXTERNAL_PREFIXES = ("http://", "https://", "mailto:")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, DEFAULT_TIMEOUT)

    # -----------------------------------------------------------------------
    # Rendered elements (shadow DOM)
    # -----------------------------------------------------------------------

    def _shadow_root(self):
        """Return the shadow root of <edirom-navigator> (raises if not rendered yet)."""
        component = self.driver.find_element(*self.COMPONENT)
        root = component.shadow_root
        if root is None:
            raise NoSuchElementException("edirom-navigator has no shadow root yet.")
        return root

    def _find_in_shadow(self, selector):
        try:
            return self._shadow_root().find_elements(By.CSS_SELECTOR, selector)
        except NoSuchElementException:
            return []

    def is_visible(self):
        """Return True if the Navigator panel is visible."""
        try:
            el = self.driver.find_element(*self.NAVIGATOR)
            return el.is_displayed()
        except Exception:
            return False

    def wait_for_categories(self):
        """Wait until at least one category heading is rendered and return all of them."""
        return self.wait.until(
            lambda d: self._find_in_shadow(self.CATEGORIES) or False,
            message="No category headings found in Navigator."
        )

    def wait_for_items(self):
        """Wait until at least one item is rendered and return all of them."""
        return self.wait.until(
            lambda d: self._find_in_shadow(self.ITEMS) or False,
            message="No items found in Navigator."
        )

    def get_item_count(self):
        """Return the number of items currently rendered in the Navigator."""
        return len(self._find_in_shadow(self.ITEMS))

    # -----------------------------------------------------------------------
    # Item data (navigator-data attribute)
    # -----------------------------------------------------------------------

    def get_item_data(self):
        """
        Return all items from the component's navigator-data JSON as a flat list
        of dicts with the keys id, name and targets (nested categories included).
        """
        self.wait_for_items()
        raw = self.driver.find_element(*self.COMPONENT).get_attribute("navigator-data")
        data = json.loads(raw or "{}")

        items = []

        def walk(entries):
            for entry in entries or []:
                if entry.get("type") == "navigatorCategory":
                    walk(entry.get("items"))
                else:
                    items.append({
                        "id": entry.get("id"),
                        "name": entry.get("name"),
                        "targets": entry.get("targets") or "",
                    })

        walk(data.get("navigatorDefinition"))
        return items

    @staticmethod
    def target_uris(targets):
        """
        Split a targets string into its URIs, the same way the frontend does:
        config blocks in square brackets (e.g. "work.xml[width:900]") are removed,
        and multiple URIs are separated by whitespace.
        """
        without_config = re.sub(r"\[[^\]]*\]", " ", targets or "")
        return without_config.split()

    def is_internal(self, item):
        uris = self.target_uris(item["targets"])
        return bool(uris) and uris[0].startswith(self.INTERNAL_PREFIX)

    def is_external(self, item):
        uris = self.target_uris(item["targets"])
        return bool(uris) and uris[0].startswith(self.EXTERNAL_PREFIXES)

    # -----------------------------------------------------------------------
    # Actions
    # -----------------------------------------------------------------------

    def _element_for(self, item):
        """Return the rendered element of an item from get_item_data()."""
        return self._shadow_root().find_element(By.CSS_SELECTOR, f"[id='{item['id']}']")

    def _open_first(self, predicate):
        """Click the first visible item matching predicate; return it, or None if there is none."""
        for item in self.get_item_data():
            if not predicate(item):
                continue
            element = self._element_for(item)
            if element.is_displayed():  # items in folded sub-categories are hidden
                element.click()
                return item
        return None

    def open_first_internal_item(self):
        """Click the first item with an internal target (opens a content window)."""
        return self._open_first(self.is_internal)

    def open_first_external_item(self):
        """Click the first item with an external URL (opens a browser tab)."""
        return self._open_first(self.is_external)

    def open_item_by_name(self, name):
        """Click the Navigator item whose text matches the given name exactly."""
        items = self.wait_for_items()
        for item in items:
            if item.text.strip() == name:
                item.click()
                return
        raise ValueError(
            f"Navigator item '{name}' not found. "
            f"Available items: {[i.text.strip() for i in items]}"
        )
