"""
Page Object: TopBar (top bar)

The TopBar is the toolbar at the top of Edirom Online.
It contains the home button, work switcher, and the search field + button.

Usage in a test:
    from pages.topbar import TopBar
    topbar = TopBar(driver)
    topbar.search("Allegro")
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from conftest import DEFAULT_TIMEOUT


class TopBar:
    """Represents the TopBar at the top of the Edirom Online interface."""

    # The TopBar container
    TOPBAR            = (By.ID, "ediromToolbar")

    # Edition/work switcher button — shows the current work title.
    # When the edition has multiple works (Bände), clicking it opens a dropdown.
    WORK_SWITCH       = (By.ID, "workSwitch")
    WORK_SWITCH_MENU  = (By.CSS_SELECTOR, "#workSwitch .x-menu")
    WORK_MENU_ITEMS   = (By.CSS_SELECTOR, ".x-menu-item[id^='workMenu_']")

    # Search elements
    # Note: searchTextFieldTop is an ExtJS wrapper <table>, not an <input>.
    # The actual typeable input is the <input> nested inside it.
    SEARCH_FIELD      = (By.CSS_SELECTOR, "#searchTextFieldTop input")
    SEARCH_BUTTON     = (By.CSS_SELECTOR, "edirom-icon[name='search']")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, DEFAULT_TIMEOUT)

    def click_search_button(self):
        """Click the search icon button to open the Search window."""
        self.wait.until(EC.element_to_be_clickable(self.SEARCH_BUTTON)).click()

    def search(self, term):
        """Type a search term into the top search field and press Enter."""
        field = self.wait.until(EC.element_to_be_clickable(self.SEARCH_FIELD))
        field.click()
        field.send_keys(term)
        field.send_keys(Keys.RETURN)

    def search_by_clicking_button(self, term):
        """Type a search term into the top search field and click the magnifying glass icon."""
        field = self.wait.until(EC.element_to_be_clickable(self.SEARCH_FIELD))
        field.click()
        field.send_keys(term)
        self.wait.until(EC.element_to_be_clickable(self.SEARCH_BUTTON)).click()

    def get_work_switch_text(self):
        """Return the text currently shown in the work switcher button (= current work title)."""
        return self.wait.until(
            EC.visibility_of_element_located(self.WORK_SWITCH)
        ).text

    def click_work_switch(self):
        """Click the work switcher button to open the dropdown menu."""
        self.wait.until(EC.element_to_be_clickable(self.WORK_SWITCH)).click()
