#! /usr/bin/env python3

from selenium import webdriver
# from selenium.webdriver.support.ui import Select
# from selenium.webdriver.common.keys import Keys
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support import expected_conditions as EC
import pytest


@pytest.fixture
def load_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    driver = webdriver.Firefox()

    def fin():
        print('teardown driver')
        driver.close()

    request.addfinalizer(fin)
    return driver


def test_OtherTitle(load_driver):
    driver = load_driver
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:85598/ada?qu=Fraternities+at+LSU&te=SD_LSU')
    divs_OtherTitle = driver.find_elements_by_class_name('OTHERTITLE')
    for div in divs_OtherTitle:
        if div.text == 'Introduction to fraternities at LSU':
            assert True
    assert False
