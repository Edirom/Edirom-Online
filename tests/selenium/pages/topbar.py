"""
Page Object: TopBar (top bar)

The TopBar is the toolbar at the top of Edirom Online.
It contains the home button, work switcher, and the search field + button.

Works with both desktops (see pages/app.py): the ExtJS top bar is found by
its element ids, the <edirom-topbar> web component by the `part` names
documented in https://github.com/Edirom/edirom-desktop#edirom-topbar.

Usage in a test:
    from pages.topbar import TopBar
    topbar = TopBar(driver)
    topbar.search("Allegro")
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from conftest import DEFAULT_TIMEOUT
from pages.app import has_desktop_component


class TopBar:
    """Represents the TopBar at the top of the Edirom Online interface."""

    # --- ExtJS desktop -------------------------------------------------------

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

    # --- <edirom-topbar> (inside the shadow root of the top bar) -------------

    PART_WORK_SWITCH  = "[part~='work-switch']"
    PART_MENU_ITEMS   = "[part~='menu-item']"
    PART_SEARCH_FIELD = "[part~='search-field']"
    PART_SEARCH_BUTTON = "[part~='search-button']"

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, DEFAULT_TIMEOUT)

    def _shadow_root(self):
        """The shadow root of <edirom-topbar>, or None for the ExtJS top bar."""
        if not has_desktop_component(self.driver):
            return None
        topbar = self.driver.execute_script(
            "return document.querySelector('edirom-desktop').shadowRoot.querySelector('edirom-topbar');"
        )
        return topbar.shadow_root

    def _clickable(self, legacy_locator, part_selector):
        """Waits until the element is visible and enabled, in whichever top bar is running."""
        root = self._shadow_root()
        if root is None:
            return self.wait.until(EC.element_to_be_clickable(legacy_locator))

        def find(_driver):
            element = root.find_element(By.CSS_SELECTOR, part_selector)
            return element if element.is_displayed() and element.is_enabled() else False

        return self.wait.until(find)

    def click_search_button(self):
        """Click the search icon button to open the Search window."""
        self._clickable(self.SEARCH_BUTTON, self.PART_SEARCH_BUTTON).click()

    def search(self, term):
        """Type a search term into the top search field and press Enter."""
        field = self._clickable(self.SEARCH_FIELD, self.PART_SEARCH_FIELD)
        field.click()
        field.send_keys(term)
        field.send_keys(Keys.RETURN)

    def search_by_clicking_button(self, term):
        """Type a search term into the top search field and click the magnifying glass icon."""
        field = self._clickable(self.SEARCH_FIELD, self.PART_SEARCH_FIELD)
        field.click()
        field.send_keys(term)
        self._clickable(self.SEARCH_BUTTON, self.PART_SEARCH_BUTTON).click()

    def get_work_switch_text(self):
        """Return the text currently shown in the work switcher (= current work title)."""
        element = self._clickable(self.WORK_SWITCH, self.PART_WORK_SWITCH)
        # <edirom-topbar> shows several works in a native <select>: only the selected entry counts
        if element.tag_name.lower() == "select":
            return Select(element).first_selected_option.text
        return element.text

    def click_work_switch(self):
        """Click the work switcher to open the dropdown menu (not needed for a native <select>)."""
        self._clickable(self.WORK_SWITCH, self.PART_WORK_SWITCH).click()

    def get_work_menu_items(self):
        """
        Return the entries of the work switcher (one per work).
        For the ExtJS top bar call click_work_switch() first, then wait for its dropdown.
        <edirom-topbar> uses a native <select> for several works, whose options are returned directly.
        """
        root = self._shadow_root()
        if root is None:
            self.wait.until(
                EC.presence_of_element_located(self.WORK_MENU_ITEMS),
                message="Work switcher dropdown did not open."
            )
            return self.driver.find_elements(*self.WORK_MENU_ITEMS)

        switch = root.find_element(By.CSS_SELECTOR, self.PART_WORK_SWITCH)
        if switch.tag_name.lower() == "select":
            return Select(switch).options

        # Earlier versions of <edirom-topbar> opened a popup menu instead
        return self.wait.until(
            lambda _driver: root.find_elements(By.CSS_SELECTOR, self.PART_MENU_ITEMS),
            message="Work switcher dropdown did not open."
        )
