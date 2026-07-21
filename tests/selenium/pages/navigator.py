"""
Page Object: Navigator

The Navigator is the panel on the left side of Edirom Online.
It lists all items of an edition (sources, works, texts etc.).
Clicking an item opens a new window.

Usage in a test:
    from pages.navigator import Navigator
    nav = Navigator(driver)
    nav.open_first_item()
    nav.open_item_by_name("Quelle A")
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import DEFAULT_TIMEOUT


class Navigator:
    """Represents the Navigator panel on the left side of the interface."""

    # The Navigator container
    NAVIGATOR         = (By.ID, "navigator")

    # Category headings (e.g. "Quellen", "Werke")
    CATEGORIES        = (By.CSS_SELECTOR, "#navigator .navigatorCategoryTitle")

    # All clickable items in the Navigator.
    # Items use onclick="loadLink(...)" directly on the div — there are no <a> tags.
    ITEMS             = (By.CSS_SELECTOR, "#navigator .navigatorItem")
    ITEM_LINKS        = ITEMS  # alias kept for backwards compatibility

    # Items that open an internal content window (onclick starts with "loadLink")
    INTERNAL_ITEMS    = (By.XPATH, '//*[@id="navigator"]//*[contains(@class,"navigatorItem") and starts-with(@onclick,"loadLink")]')

    # Items that open an external URL in a new browser tab
    EXTERNAL_ITEMS    = (By.XPATH, '//*[@id="navigator"]//*[contains(@class,"navigatorItem") and contains(@onclick,"window.open")]')

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, DEFAULT_TIMEOUT)

    def is_visible(self):
        """Return True if the Navigator panel is visible."""
        try:
            el = self.driver.find_element(*self.NAVIGATOR)
            return el.is_displayed()
        except Exception:
            return False

    def get_item_count(self):
        """Return the number of items currently shown in the Navigator."""
        items = self.driver.find_elements(*self.ITEM_LINKS)
        return len(items)

    def open_first_item(self):
        """Click the first item in the Navigator."""
        link = self.wait.until(
            EC.element_to_be_clickable(self.ITEMS),
            message="No clickable items found in Navigator."
        )
        link.click()

    def open_first_internal_item(self):
        """Click the first item whose onclick calls loadLink() (opens ediromWindow)."""
        link = self.wait.until(
            EC.element_to_be_clickable(self.INTERNAL_ITEMS),
            message="No internal Navigator items found (onclick=loadLink)."
        )
        link.click()
        return link

    def open_item_by_name(self, name):
        """Click the Navigator item whose text matches the given name exactly."""
        # Find all item links and click the one with matching text
        self.wait.until(EC.presence_of_element_located(self.ITEM_LINKS))
        links = self.driver.find_elements(*self.ITEM_LINKS)
        for link in links:
            if link.text.strip() == name:
                link.click()
                return
        raise ValueError(
            f"Navigator item '{name}' not found. "
            f"Available items: {[l.text.strip() for l in links]}"
        )
