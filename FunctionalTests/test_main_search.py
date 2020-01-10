#! /usr/bin/env python3

import pdb

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
    driver.get("https://www.lib.lsu.edu/?")

    def fin():
        print("teardown driver")
        driver.close()

    wait = WebDriverWait(driver, 20)
    our_tab = wait.until(
        EC.presence_of_element_located((By.CLASS_NAME, "TabbedPanelsTab"))
    )
    our_tab = [
        i
        for i in driver.find_elements_by_class_name("TabbedPanelsTab")
        if i.text == "Catalog"
    ][0]
    our_tab.click()
    request.addfinalizer(fin)
    return driver


def run_search_query(
    driver, fieldname=None, searchstring=None, location=None, first_result_title=None
):
    if fieldname:
        field = Select(driver.find_element_by_id("srchfield1"))
        field.select_by_visible_text(fieldname)
    if location:
        box = Select(driver.find_element_by_id("library"))
        box.select_by_visible_text(location)
    input = driver.find_element_by_id("searchdata1")
    input.clear()
    if searchstring:
        input.send_keys(searchstring)
    input.send_keys(Keys.ENTER)
    wait = WebDriverWait(driver, 10)
    results_1 = wait.until(EC.presence_of_element_located((By.ID, "detailLink0")))
    assert results_1.get_attribute("title") == first_result_title


def get_first_page_results_locations(
    driver, location=None, searchstring=None, expected_results_location=None
):
    if location:
        box = Select(driver.find_element_by_id("library"))
        box.select_by_visible_text(location)
    input = driver.find_element_by_id("searchdata1")
    input.clear()
    if searchstring:
        input.send_keys(searchstring)
    input.send_keys(Keys.ENTER)
    wait = WebDriverWait(driver, 10)
    location_divs = wait.until(
        EC.presence_of_element_located((By.CLASS_NAME, "LIBRARY"))
    )
    # pdb.set_trace()
    location_divs = driver.find_elements_by_class_name("LIBRARY")
    filtered_location_divs = [
        i for i in location_divs if "displayElementText" in i.get_property("classList")
    ]
    count_dict = {"totals": 0, "site": dict()}
    for div in filtered_location_divs:
        count_dict["totals"] += 1
        subtexts = {i for i in div.text.split("\n")}
        for subtext in subtexts:
            if count_dict["site"].get(subtext):
                count_dict["site"][subtext] += 1
            else:
                count_dict["site"][subtext] = 1
    assert count_dict["site"][expected_results_location] <= count_dict["totals"]


################################################################################################################


def test_page_loads(load_driver):
    driver = load_driver
    assert "LSU Libraries" in driver.title


##################################################################################################################


def test_author_dropdown(load_driver):
    driver = load_driver
    fieldname, searchstring = "Author", "hello"
    first_result_title = "Contes extraordinaires."
    run_search_query(
        driver,
        fieldname=fieldname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


def test_title_dropdown(load_driver):
    driver = load_driver
    fieldname, searchstring = "Title", "hello"
    first_result_title = "Hello, Dolly."
    run_search_query(
        driver,
        fieldname=fieldname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


def test_subject_dropdown(load_driver):
    driver = load_driver
    fieldname, searchstring = "Subject", "hello"
    first_result_title = "Pink globalization : Hello Kitty's trek across the Pacific"
    run_search_query(
        driver,
        fieldname=fieldname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


def test_periodical_title_dropdown(load_driver):
    driver = load_driver
    fieldname, searchstring = "Journal Title", "hello"
    first_result_title = "Highlights Hello"
    run_search_query(
        driver,
        fieldname=fieldname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


##################################################################################################################


def test_for_middleton_location(load_driver):
    driver = load_driver
    location = "Middleton Library"
    expected_results_location = "Middleton Library"
    get_first_page_results_locations(
        driver, location=location, expected_results_location=expected_results_location
    )


def test_for_special_collections_location(load_driver):
    driver = load_driver
    location = "Special Collections"
    expected_results_location = "Special Collections"
    get_first_page_results_locations(
        driver, location=location, expected_results_location=expected_results_location
    )


def test_for_government_location(load_driver):
    driver = load_driver
    location = "Government Documents/Microforms"
    expected_results_location = (
        "Government Documents - (Currently Closed to Public - See Access Services)"
    )
    get_first_page_results_locations(
        driver, location=location, expected_results_location=expected_results_location
    )


def test_for_music_location(load_driver):
    driver = load_driver
    location = "Music Resources"
    expected_results_location = "Carter Music Resources Center"
    get_first_page_results_locations(
        driver, location=location, expected_results_location=expected_results_location
    )


def test_for_cartographic_location(load_driver):
    driver = load_driver
    location = "Cartographic Information Center"
    expected_results_location = "Cartographic Information Center"
    get_first_page_results_locations(
        driver, location=location, expected_results_location=expected_results_location
    )


def test_for_nonLSU_location(load_driver):
    driver = load_driver
    location = "Other Collections"
    expected_results_location = (
        "Collections at LSU but not in LSU Libraries - Check Location"
    )
    get_first_page_results_locations(
        driver, location=location, expected_results_location=expected_results_location
    )


def test_for_veterinary_location(load_driver):
    driver = load_driver
    location = "Veterinary Medicine Library"
    expected_results_location = "Veterinary Medicine Library"
    get_first_page_results_locations(
        driver, location=location, expected_results_location=expected_results_location
    )
