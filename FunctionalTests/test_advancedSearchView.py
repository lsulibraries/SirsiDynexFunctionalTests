#! /usr/bin/env python3

from selenium import webdriver
import pytest

from . import _conf_settings


URL = _conf_settings.URL
USER_AGENT = _conf_settings.USER_AGENT


@pytest.fixture
def load_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    profile.set_preference("general.useragent.override", USER_AGENT)
    driver = webdriver.Firefox(firefox_profile=profile)
    driver.get(f"{URL}/?rm=MORE+SEARCH+OP0|||1|||0|||true")

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
