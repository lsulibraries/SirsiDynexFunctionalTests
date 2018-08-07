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


def run_search_query(driver, fieldname=None, searchstring=None, location=None, first_result_title=None):
    if fieldname:
        field = Select(driver.find_element_by_id('srchfield1'))
        field.select_by_visible_text(fieldname)
    if location:
        box = Select(driver.find_element_by_id('library'))
        box.select_by_visible_text(location)
    input = driver.find_element_by_id('searchdata1')
    input.clear()
    if searchstring:
        input.send_keys(searchstring)
    input.send_keys(Keys.ENTER)
    wait = WebDriverWait(driver, 10)
    results_1 = wait.until(
        EC.presence_of_element_located((By.ID, "detailLink0"))
    )
    assert results_1.get_attribute('title') == first_result_title

#################################################################################################################


def test_page_loads(load_driver):
    driver = load_driver
    assert 'Search Box update' in driver.title

###################################################################################################################


def test_author_dropdown(load_driver):
    driver = load_driver
    fieldname, searchstring = 'Author', 'hello'
    first_result_title = "Contes extraordinaires."
    run_search_query(driver, fieldname=fieldname, searchstring=searchstring, first_result_title=first_result_title)


def test_title_dropdown(load_driver):
    driver = load_driver
    fieldname, searchstring = 'Title', 'hello'
    first_result_title = "Hello, Dolly."
    run_search_query(driver, fieldname=fieldname, searchstring=searchstring, first_result_title=first_result_title)


def test_subject_dropdown(load_driver):
    driver = load_driver
    fieldname, searchstring = 'Subject', 'hello'
    first_result_title = "Ernest Hello : vie, oeuvre, mission"
    run_search_query(driver, fieldname=fieldname, searchstring=searchstring, first_result_title=first_result_title)


def test_periodical_title_dropdown(load_driver):
    driver = load_driver
    fieldname, searchstring = 'Journal Title', 'asdf'
    first_result_title = "ASDA Group, Ltd. SWOT Analysis"
    run_search_query(driver, fieldname=fieldname, searchstring=searchstring, first_result_title=first_result_title)

####################################################################################################################


def test_all_locations(load_driver):
    driver = load_driver
    location, searchstring = 'All Libraries', 'reactivation'
    first_result_title = 'Continental reactivation and reworking'
    run_search_query(driver, location=location, searchstring=searchstring, first_result_title=first_result_title)


def test_middleton_location(load_driver):
    driver = load_driver
    location, searchstring = 'Middleton Library', 'asdf'
    first_result_title = 'Textbook of penile cancer'
    run_search_query(driver, location=location, searchstring=searchstring, first_result_title=first_result_title)


def test_special_collections_location(load_driver):
    driver = load_driver
    location, searchstring = 'Special Collections', 'asdf'
    first_result_title = 'The Impact of Modifying the Jones Act on US Coastal Shipping'
    run_search_query(driver, location=location, searchstring=searchstring, first_result_title=first_result_title)


def test_government_location(load_driver):
    driver = load_driver
    location, searchstring = 'Government Documents/Microforms', 'asdf'
    first_result_title = 'PHS, ATSDR Federal Register cites'
    run_search_query(driver, location=location, searchstring=searchstring, first_result_title=first_result_title)


def test_music_location(load_driver):
    driver = load_driver
    location, searchstring = 'Music Resources', 'if'
    first_result_title = '... if He please (1954).'
    run_search_query(driver, location=location, searchstring=searchstring, first_result_title=first_result_title)


def test_cartographic_location(load_driver):
    driver = load_driver
    location, searchstring = 'Cartographic Information Center', 'of'
    first_result_title = 'Yearbook of agriculture'
    run_search_query(driver, location=location, searchstring=searchstring, first_result_title=first_result_title)


def test_nonLSU_location(load_driver):
    driver = load_driver
    location, searchstring = 'Collections at LSU but not in LSU Libraries', 'of'
    first_result_title = 'Advocate of dialoge'
    run_search_query(driver, location=location, searchstring=searchstring, first_result_title=first_result_title)


def test_veterinary_location(load_driver):
    driver = load_driver
    location, searchstring = 'Veterinary Medicine Library', 'asdf'
    first_result_title = 'AO principles of equine osteosynthesis'
    run_search_query(driver, location=location, searchstring=searchstring, first_result_title=first_result_title)
