# Selenium Tests — Edirom Online

Automated browser tests for Edirom Online. Selenium drives a real Chrome browser and checks that the app behaves correctly end-to-end.

## Prerequisites

1. **Docker running** — the app must be reachable at http://localhost:8089:
   ```bash
   cd /Edirom-Online
   docker compose up -d
   ```

2. **Python packages** (once):
   ```bash
   pip3 install selenium pytest pytest-html
   ```
   No ChromeDriver download needed — Selenium 4 handles that automatically.

## Running the tests

```bash
cd /Edirom-Online/tests/selenium

# Run all tests (browser opens visibly)
pytest -v

# Run all tests and generate an HTML report
pytest -v --html=report.html --self-contained-html

# Run a single file
pytest -v test_startpage.py

# Run a single test
pytest -v test_startpage.py::TestStartPage::test_app_fully_loaded
```

## Reading results

```
test_startpage.py::TestStartPage::test_page_responds        PASSED
test_startpage.py::TestStartPage::test_app_fully_loaded     PASSED
test_startpage.py::TestStartPage::test_no_javascript_errors FAILED
```

`FAILED` includes the reason directly below. 
`SKIPPED` tests print why they were skipped — either an expected condition (e.g. only one edition deployed) or a known blocker.

## Headless mode

The browser opens visibly by default. To run headless (e.g. in CI), uncomment
the headless line in `conftest.py`:
```python
chrome_options.add_argument("--headless")
```

## File structure

```
tests/selenium/
│
├── conftest.py           pytest setup: browser, BASE_URL, EDITION_URL,
│                         DEFAULT_TIMEOUT, ACTIVE_EDITION, fixtures
│
├── editions/             Edition profiles — which edition is active and its properties
│   ├── base.py           EditionProfile dataclass
│   ├── edition_example.py
│   └── klarinettenquintett.py
│
├── pages/                Page objects — selectors and actions, no test logic
│   ├── app.py            AppPage.open()
│   ├── topbar.py         TopBar: search, work switcher
│   └── navigator.py      Navigator: items, internal/external links
│
├── test_startpage.py     App startup + edition chooser (2+ editions)
├── test_topbar.py        TopBar: triggering a search, work switcher
├── test_search_window.py Search results: hits, count, opening a result
└── test_navigator.py     Navigator: visibility, items, link targets, resize
```

## Configuration

Adjust in `conftest.py`:
- `BASE_URL` — if you use a different port
- `EDITION_URL` — URL including `?edition=<id>` for tests that need a loaded edition
- `DEFAULT_TIMEOUT` — how long to wait for elements (default: 30 seconds)

Set the active edition profile via the `EDITION_ID` environment variable:
```bash
EDITION_ID=edition-27830471 pytest -v
```

## Adding an edition profile

Each edition that should be testable needs a profile — a Python object describing
its structure and content. Two profiles already exist as examples:
`editions/edition_example.py` and `editions/klarinettenquintett.py`.

**Step 1** — create `editions/myedition.py`:
```python
from .base import EditionProfile

profile = EditionProfile(
    edition_id="my-edition-id",      # the ?edition= URL parameter
    name="My Edition v1.0",          # shown in skip messages
    base_uri="xmldb:exist:///db/apps/my-edition",
    edition_xml_path="content/edition.xml",

    has_working_search=False,        # set True once Lucene index is deployed
    search_term_with_hits="",        # a term that exists in this edition's data

    sources=[                        # optional, for documentation
        ("sources/source-1.xml", "Source A"),
    ],
    works=[
        ("works/work.xml", "My Work Title"),  # title shown in TopBar work switcher
    ],
)
```

**Step 2** — register it in `conftest.py`:
```python
from editions.myedition import profile as _myedition

EDITION_PROFILES = {
    "edirom_edition_example": _edition_example,
    "edition-27830471":       _klarinettenquintett,
    "my-edition-id":          _myedition,        # add this line
}
```

Also add it to the "Available profiles" comment at the top of `conftest.py`.

**Step 3** — run:
```bash
EDITION_ID=my-edition-id pytest -v
```

The `has_working_search` flag controls whether search content tests run or are
skipped automatically. Set it to `True` only once the edition's Lucene index is
correctly deployed in eXist-db (i.e. `collection.xconf` is in the right mirrored
path under `/db/system/config/...`).

## What is not yet covered

The following areas are not tested yet. Previously, all of these were covered by
manual testing tracked as a GitHub issue (guitest checklist). The goal is to
replace that manual process with automated tests here.

Legend: ✅ automated · ⏸ blocked

### Start page
- ✅ view > looks correct (edition selection, or direct edition page) — `test_startpage.py`

### Top bar
- ✅ click Search button > Search window opens — `test_topbar.py`
- ✅ enter term + hit Enter / click magnifying icon > Search window opens and displays results — `test_topbar.py`

### Search window
- ✅ enter term > search results displayed — `test_search_window.py`
- ✅ enter unknown term > no-results message shown — `test_search_window.py`
- ✅ click result link > source/work window opens — `test_search_window.py`

### Navigator
- ✅ click each item > opening window shows content — `test_navigator.py`

### Task bar
- ⏸ click About button > About window shows content
- ⏸ click Help button > Help window shows content
- ⏸ clock displays correct time
- ⏸ open four windows, click "Sort windows in grid" > windows sorted in grid
- ⏸ open multiple windows, click "Sort windows vertically" > windows sorted vertically
- ⏸ open multiple windows, click "Sort windows horizontally" > windows sorted horizontally
- ⏸ open two sources with facsimiles, click "Show measure numbers" > measure numbers appear
- ⏸ open two sources with facsimiles, click "Show annotations" > annotation icons appear
- ⏸ click "Concordance navigator" > Concordance Navigator window opens
- ⏸ right-click tab of open window > minimize / maximize / close work correctly

### Help window
- ⏸ click link in TOC > link opens in Help window
- ⏸ view (scroll) > images show correctly

### Concordance Navigator
- ⏸ enter measure number + press Enter > facsimiles navigate to that measure
- ⏸ enter measure number + click Show > facsimiles navigate to that measure
- ⏸ drag icon to change measure, click Show > correct navigation
- ⏸ use arrows to navigate through measures > facsimiles follow
- ⏸ select another movement + click Show > facsimiles navigate to movement beginning
- ⏸ select another movement + enter measure + press Enter > correct navigation

### Facsimile window
- ⏸ click Show/Hide measures > measure numbers appear on sections with notes
- ⏸ hover over measure number > measure zone is highlighted
- ⏸ click Fit score > facsimile adjusts to full page
- ⏸ click Show/Hide annotations > annotation icons show up
- ⏸ hover over annotation box > text box appears
- ⏸ click annotation box > annotation window opens with description, metadata, zones
- ⏸ Annotations menu > Priorities / Categories filter work
- ⏸ Go to > Go to measure... > facsimile zooms to measure
- ⏸ Go to > Go to movement... > facsimile loads at movement start
- ⏸ switch Page-based / Measure-based view > view changes
- ⏸ zoom bar drag > zoom adjusts
- ⏸ pagination in page-based view > different pages display correctly
- ⏸ pagination in measure-based view > different pages display correctly

### Annotation window
- ⏸ View menu > different views show correctly
- ⏸ Display menu > different display views show correctly
- ⏸ click List view icon > list of annotations displayed
- ⏸ click Next / Previous annotation > annotation info and zoomed view update
- ⏸ click Open all sources > all annotated sections open in new windows
- ⏸ click Close all sources > all previously opened annotation windows close
- ⏸ hover over bottom menu icons > cursor and highlight indicate clickable

### Verovio window
- ⏸ view > Verovio is rendering
- ⏸ click pages forward/backward > Verovio pages render
- ⏸ Go to > Go to measure... > window shows selected measure
- ⏸ Go to > Go to movement... > loads at new position
- ⏸ hover over annotation icon > tooltip shown
- ⏸ click annotation icon > annotation window opens

---

**Why ⏸ items are blocked:**

Tests that open or interact with content windows cannot be written reliably against
the current ExtJS `.ediromWindow` DOM, because that class will be replaced by the
edirom-image-viewer web component (see [PR2019](https://github.com/Edirom/Edirom-Online-Frontend/pull/219) in the Edirom Frontend). All TaskBar, Help, Verovio, Facsimile, Annotation, and Concordance Navigator tests fall into this category and should be written once the web component PR is merged.

