#! /usr/bin/env python3

from selenium import webdriver
import pytest

from . import _conf_settings


URL = _conf_settings.URL


@pytest.fixture
def load_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    driver = webdriver.Firefox()
    # driver.delete_all_cookies()
    driver.get(f"{URL}/search/results")

    def fin():
        print("teardown driver")
        driver.close()

    request.addfinalizer(fin)
    return driver


@pytest.fixture
def load_access_page(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    driver = webdriver.Firefox()
    driver.delete_all_cookies()
    driver.get(f"{URL}/search/results?qu=Plaetner%2C+J%C3%B8rgen.&te=SD_LSU&rt=false%7C%7C%7CAUTHOR%7C%7C%7CAuthor")

    def fin():
        print("teardown driver")
        driver.close()

    request.addfinalizer(fin)
    return driver


################################################################################


def test_page_loads(load_driver):
    driver = load_driver
    assert "Search Results for" in driver.title


def test_resultsViewIconReplace_removes_icon(load_driver):
    driver = load_driver
    formatTypeIcon_divs = driver.find_elements_by_class_name("formatTypeIcon")
    assert len(formatTypeIcon_divs) == 0


def test_resultsViewIconReplace_adds_text(load_driver):
    driver = load_driver
    formatType_divs = driver.find_elements_by_class_name("formatType")
    for div in formatType_divs:
        if not div.text:
            assert False


def test_changeToAccessThisItem_changes_text(load_access_page):
    driver = load_access_page
    for elem in driver.find_elements_by_class_name("detail_access_link"):
        if elem.text == elem.get_attribute("href"):
            assert False
