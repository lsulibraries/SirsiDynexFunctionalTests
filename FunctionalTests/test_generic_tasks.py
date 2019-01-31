#! /usr/bin/env python3

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pytest


@pytest.fixture
def load_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    driver = webdriver.Firefox()
    # driver.delete_all_cookies()
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/')

    def fin():
        print('teardown driver')
        driver.close()

    request.addfinalizer(fin)
    return driver


################################################################################


def test_customSearchLinkText(load_driver):
    driver = load_driver
    more_search_options_link = driver.find_element_by_xpath('//*[@title="Advanced Search"]')
    assert more_search_options_link.text == "More Search Options"


def test_customSearchLinkWorks(load_driver):
    driver = load_driver
    more_search_options_link = driver.find_element_by_xpath('//*[@title="Advanced Search"]')
    more_search_options_link.click()
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "advancedSearchField")))
    assert "More Search Options" in driver.title


def test_tempChangeHeaderHref(load_driver):
    driver = load_driver
    lsu_logo = driver.find_element_by_class_name('header-mid')
    lsu_logo.click()
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "motto")))
    assert "LSU Libraries" in driver.title
