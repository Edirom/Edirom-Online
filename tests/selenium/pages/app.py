"""
Page Object: App

The base page — navigates to the app and waits until it is fully loaded.
All other page objects inherit from this class.

Usage in a test:
    from pages.app import AppPage
    app = AppPage(driver)
    app.open()   # navigates to EDITION_URL and waits for the TaskBar
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import EDITION_URL, DEFAULT_TIMEOUT


class AppPage:
    """Represents the fully loaded Edirom Online application."""

    # The TaskBar at the bottom is the last element to appear on load.
    # If it is visible, the app is ready.
    TASKBAR = (By.ID, "ediromTaskbar")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, DEFAULT_TIMEOUT)

    def open(self):
        """Navigate to the app and wait until it is ready."""
        self.driver.get(EDITION_URL)
        self.wait.until(
            EC.presence_of_element_located(self.TASKBAR),
            message="App did not load: TaskBar not found."
        )
        return self
