"""
Selenium test configuration for Edirom Online.

This file is automatically loaded by pytest before any test runs.
It sets up the browser and makes shared fixtures available to all tests.

-------------------------------------------------------------------------------
RUNNING TESTS AGAINST A SPECIFIC EDITION
-------------------------------------------------------------------------------
By default, tests run against EditionExample. To use a different edition,
set the EDITION_ID environment variable before running pytest:

  EDITION_ID=edition-27830471 pytest tests/selenium/

The EDITION_ID must match a key in the EDITION_PROFILES dict below AND the
edition must already be deployed in your local eXist-db (i.e. listed in
EDITION_XAR in docker-compose.yml or loaded manually).

Available profiles:
  edirom_edition_example          — EditionExample v0.2.0 (default)
  edition-27830471                — Weber Klarinettenquintett op. 34 v1.1.1
-------------------------------------------------------------------------------
"""
import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait

from editions.edition_example import profile as _edition_example
from editions.klarinettenquintett import profile as _klarinettenquintett


# --- Edition profiles registry ---
EDITION_PROFILES = {
    "edirom_edition_example": _edition_example,
    "edition-27830471":       _klarinettenquintett,
}

# --- Active edition ---
# Resolved once at import time from the environment variable.
# All test modules can import ACTIVE_EDITION directly, or use the `edition` fixture.
_active_id = os.environ.get("EDITION_ID", "edirom_edition_example")
if _active_id not in EDITION_PROFILES:
    raise ValueError(
        f"Unknown EDITION_ID={_active_id!r}. "
        f"Choose one of: {list(EDITION_PROFILES)}"
    )
ACTIVE_EDITION = EDITION_PROFILES[_active_id]

# --- Derived URL constants (kept for backwards compatibility) ---
BASE_URL = "http://localhost:8089"
EDITION_ID = ACTIVE_EDITION.edition_id
EDITION_URL = f"{BASE_URL}/index.html?edition={EDITION_ID}"

# How many seconds to wait for elements to appear before failing
DEFAULT_TIMEOUT = 30


@pytest.fixture(scope="session")
def edition():
    """
    Returns the active EditionProfile for this test run.

    The profile is determined by the EDITION_ID environment variable.
    Defaults to EditionExample if not set.

    Use this fixture in tests that need edition-specific data like search
    terms, source URIs, or the has_working_search flag.

    Example:
        def test_search_finds_results(self, driver, edition):
            if not edition.has_working_search:
                pytest.skip(f"{edition.name}: search index not active")
            TopBar(driver).search(edition.search_term_with_hits)
    """
    return ACTIVE_EDITION


@pytest.fixture(scope="session")
def driver():
    """
    Creates a Chrome browser instance for the entire test session.

    'scope=session' means the browser opens once and is reused for all tests —
    much faster than opening a new browser for every single test.

    The browser will close automatically when all tests are done.
    """
    chrome_options = Options()

    # Run in visible mode so you can WATCH what Selenium is doing.
    # Once tests are stable, you can enable headless mode by uncommenting this line:
    # chrome_options.add_argument("--headless")

    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Selenium 4 manages ChromeDriver automatically — no manual download needed!
    browser = webdriver.Chrome(options=chrome_options)
    browser.implicitly_wait(5)  # wait up to 5s when looking for elements

    yield browser  # hand the browser to the test

    # This runs after ALL tests are done
    browser.quit()


@pytest.fixture
def wait(driver):
    """
    Provides an explicit wait object.
    Use this when you need to wait for something specific to happen.

    Example in a test:
        wait.until(EC.presence_of_element_located((By.ID, "ediromTaskbar")))
    """
    return WebDriverWait(driver, DEFAULT_TIMEOUT)
