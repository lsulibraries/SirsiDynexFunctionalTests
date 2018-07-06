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
    driver = webdriver.Firefox()
    driver.get('https://www.lib.lsu.edu/music/search-dev')

    def fin():
        print('teardown driver')
        driver.close()

    request.addfinalizer(fin)
    return driver


def test_page_loads(load_driver):
    driver = load_driver
    assert 'Music Search' in driver.title

def test_author_dropdown(load_driver):
    driver = load_driver
    field = Select(driver.find_element_by_id('fieldDropDown'))
    field.select_by_visible_text('author')
    # format = Select(driver.find_element_by_id('formatDropDown'))
    # format.select_by_visible_text('Book')
    input = driver.find_element_by_id('q')
    input.clear()
    input.send_keys('hello')
    input.send_keys(Keys.ENTER)
    
    wait = WebDriverWait(driver, 10)
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
