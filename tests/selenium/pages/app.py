"""
Page Object: App

The base page — navigates to the app and waits until it is fully loaded.
All other page objects inherit from this class.

Usage in a test:
    from pages.app import AppPage
    app = AppPage(driver)
    app.open()   # navigates to EDITION_URL and waits for the TaskBar

-------------------------------------------------------------------------------
TWO DESKTOPS
-------------------------------------------------------------------------------
The desktop (top bar, task bar, window area) exists in two versions:

  - the ExtJS desktop (Edirom-Online-Frontend up to v1.5.x): plain elements
    with ids like "ediromTaskbar" and "ediromToolbar"
  - the <edirom-desktop> web component (https://github.com/Edirom/edirom-desktop,
    integrated in https://github.com/Edirom/Edirom-Online-Frontend/pull/344):
    the bars live in shadow roots and are addressed by their documented
    `part` names

The helpers below detect which one is running, so the same tests work with
both. Once no supported frontend uses the ExtJS desktop anymore, the ExtJS
branches can be removed.
"""
from selenium.webdriver.support.ui import WebDriverWait
from conftest import EDITION_URL, DEFAULT_TIMEOUT


def has_desktop_component(driver):
    """True if the frontend uses the <edirom-desktop> web component."""
    return driver.execute_script("return document.querySelector('edirom-desktop') !== null;")


def find_taskbar(driver):
    """
    Returns the task bar of either desktop, or None while the app is still loading.

    Uses JavaScript instead of find_element so that the check returns at once
    and does not run into the implicit wait for the desktop that is not there.
    """
    return driver.execute_script("""
        const desktop = document.querySelector('edirom-desktop');
        if (desktop) {
            return desktop.shadowRoot ? desktop.shadowRoot.querySelector('edirom-taskbar') : null;
        }
        return document.getElementById('ediromTaskbar');
    """)


class AppPage:
    """Represents the fully loaded Edirom Online application."""

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, DEFAULT_TIMEOUT)

    def open(self):
        """Navigate to the app and wait until it is ready."""
        self.driver.get(EDITION_URL)
        # The TaskBar at the bottom is the last element to appear on load.
        # If it is there, the app is ready.
        self.wait.until(find_taskbar, message="App did not load: TaskBar not found.")
        return self
