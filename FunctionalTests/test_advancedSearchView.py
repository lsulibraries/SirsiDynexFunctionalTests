#! /usr/bin/env python3

from selenium import webdriver
import pytest


@pytest.fixture
def load_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    driver = webdriver.Firefox()
    driver.delete_all_cookies()
    # driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/?rm=MORE+SEARCH+OP0|||1|||0|||true')
    driver.get(
        "https://lalutest.ent.sirsi.net/client/en_US/lsu/?rm=MORE+SEARCH+OP0|||1|||0|||true"
    )

    def fin():
        print("teardown driver")
        driver.close()

    request.addfinalizer(fin)
    return driver


def test_page_loads(load_driver):
    driver = load_driver
    assert "More Search Options" in driver.title


def test_hideBasicSearch(load_driver):
    driver = load_driver
    searchBoxWrapper_divs = driver.find_elements_by_class_name("hideBasicSearch")
    for div in searchBoxWrapper_divs:
        assert div.getCssValue("display") == "none"
