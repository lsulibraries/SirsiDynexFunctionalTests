#! /usr/bin/env python3

from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import pytest


@pytest.fixture
def load_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.cache.offline.enable", False)
    profile.set_preference("network.http.use-cache", False)
    driver = webdriver.Firefox(profile)
    driver.delete_all_cookies()
    driver.get('https://www.lib.lsu.edu/dev/search')

    def fin():
        print('teardown driver')
        driver.close()

    wait = WebDriverWait(driver, 20)
    our_tab = wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'TabbedPanelsTab')))
    our_tab = [i for i in driver.find_elements_by_class_name('TabbedPanelsTab') if i.text == 'Catalog'][0]
    our_tab.click()
    request.addfinalizer(fin)
    return driver


def test_page_loads(load_driver):
    driver = load_driver
    assert 'Search Box update' in driver.title


def test_author_dropdown(load_driver):
    driver = load_driver
    field = Select(driver.find_element_by_id('srchfield1'))
    field.select_by_visible_text('Author')
    # format = Select(driver.find_element_by_id('formatDropDown'))
    # format.select_by_visible_text('Book')
    input = driver.find_element_by_id('searchdata1')
    input.clear()
    input.send_keys('hello')
    input.send_keys(Keys.ENTER)

    wait = WebDriverWait(driver, 20)
    results_title_1 = wait.until(
        EC.presence_of_element_located((By.ID, "detailLink0"))
    )
    assert results_title_1.get_attribute('title') == "Contes extraordinaires."


def test_title_dropdown(load_driver):
    driver = load_driver
    field = Select(driver.find_element_by_id('fieldDropDown'))
    field.select_by_visible_text('title')
    input = driver.find_element_by_id('q')
    input.clear()
    input.send_keys('hello')
    input.send_keys(Keys.ENTER)

    wait = WebDriverWait(driver, 10)
    results_title_1 = wait.until(
        EC.presence_of_element_located((By.ID, "detailLink0"))
    )
    assert results_title_1.get_attribute('title') == "Hello, Dolly."


def test_subject_dropdown(load_driver):
    driver = load_driver
    field = Select(driver.find_element_by_id('fieldDropDown'))
    field.select_by_visible_text('subject')
    input = driver.find_element_by_id('q')
    input.clear()
    input.send_keys('hello')
    input.send_keys(Keys.ENTER)

    wait = WebDriverWait(driver, 10)
    results_title_1 = wait.until(
        EC.presence_of_element_located((By.ID, "detailLink0"))
    )
    assert results_title_1.get_attribute('title') == "Ernest Hello : vie, oeuvre, mission"


def test_periodical_title_dropdown(load_driver):
    driver = load_driver
    field = Select(driver.find_element_by_id('fieldDropDown'))
    field.select_by_visible_text('periodical title')
    input = driver.find_element_by_id('q')
    input.clear()
    input.send_keys('hello')
    input.send_keys(Keys.ENTER)

    wait = WebDriverWait(driver, 10)
    results_title_1 = wait.until(
        EC.presence_of_element_located((By.ID, "detailLink0"))
    )
    assert results_title_1.get_attribute('title') == "Volunteer on-going language learning manual : beyond hello."
