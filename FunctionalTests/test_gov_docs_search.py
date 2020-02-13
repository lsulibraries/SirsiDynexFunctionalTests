#! /usr/bin/env python3

from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import pytest

from . import _conf_settings


USER_AGENT = _conf_settings.USER_AGENT


@pytest.fixture
def load_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    profile.set_preference("general.useragent.override", USER_AGENT)
    driver = webdriver.Firefox(firefox_profile=profile)
    driver.get("https://www.lib.lsu.edu/collections/govdocs")

    def fin():
        print("teardown driver")
        driver.close()

    request.addfinalizer(fin)
    return driver


def run_search_query(
    driver,
    fieldname=None,
    formatname=None,
    searchstring=None,
    location=None,
    first_result_title=None,
    first_result_format=None,
):
    if fieldname:
        field = Select(driver.find_element_by_id("fieldDropDown"))
        field.select_by_visible_text(fieldname)
    if formatname:
        format = Select(driver.find_element_by_id("formatDropDown"))
        format.select_by_visible_text(formatname)
    if location:
        box = Select(driver.find_element_by_id("library"))
        box.select_by_visible_text(location)
    input = driver.find_element_by_id("searchdata1")
    input.clear()
    if searchstring:
        input.send_keys(searchstring)
    input.send_keys(Keys.ENTER)
    wait = WebDriverWait(driver, 10)
    if first_result_format:
        result_format = wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "formatType"))
        )
        assert result_format.text == first_result_format
    else:
        results_1 = wait.until(EC.presence_of_element_located((By.ID, "detailLink0")))
        assert results_1.get_attribute("title") == first_result_title


########################################################################################


def test_page_loads(load_driver):
    driver = load_driver
    assert "LSU Libraries" in driver.title


#relying on this author and this title with colon are not reliable long term...
def test_author_dropdown(load_driver):
    fieldname, searchstring = "Author", "Joyce, James"
    first_result_title = "Fluidics :"
    run_search_query(
        load_driver,
        fieldname=fieldname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


def test_title_dropdown(load_driver):
    fieldname, searchstring = "Title", "Supreme Court Nominations."
    first_result_title = "Supreme Court Nominations"
    run_search_query(
        load_driver,
        fieldname=fieldname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


#upgrade appears to split titles at ':' test may fail until corrected
def test_subject_dropdown(load_driver):
    fieldname, searchstring = "Subject", "City"
    first_result_title = "The Division of St. John :"
    run_search_query(
        load_driver,
        fieldname=fieldname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


def test_periodical_title_dropdown(load_driver):
    fieldname, searchstring = "Journal Title", "hi"
    first_result_title = "Research hi-lites"
    run_search_query(
        load_driver,
        fieldname=fieldname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


#########################################################################################


def test_book_dropdown(load_driver):
    formatname, searchstring = "Book", "the"
    first_result_format = "Book"
    run_search_query(
        load_driver,
        formatname=formatname,
        searchstring=searchstring,
        first_result_format=first_result_format,
    )


def test_map_dropdown(load_driver):
    formatname, searchstring = "Map", "the"
    first_result_format = "Maps"
    run_search_query(
        load_driver,
        formatname=formatname,
        searchstring=searchstring,
        first_result_format=first_result_format,
    )


def test_microform_dropdown(load_driver):
    formatname, searchstring = "Microform", "the"
    first_result_format = "Microform"
    run_search_query(
        load_driver,
        formatname=formatname,
        searchstring=searchstring,
        first_result_format=first_result_format,
    )


def test_print_journal_dropdown(load_driver):
    formatname, searchstring = "Print Journal", "the"
    first_result_format = "Print Journal"
    run_search_query(
        load_driver,
        formatname=formatname,
        searchstring=searchstring,
        first_result_format=first_result_format,
    )


def test_audio_cassette_dropdown(load_driver):
    formatname, searchstring = "Audio Cassette", "the"
    first_result_format = "Audio cassette"
    run_search_query(
        load_driver,
        formatname=formatname,
        searchstring=searchstring,
        first_result_format=first_result_format,
    )


def test_sound_recording_dropdown(load_driver):
    formatname, searchstring = "LP (Sound Recording)", "the"
    first_result_format = "Sound recording"
    run_search_query(
        load_driver,
        formatname=formatname,
        searchstring=searchstring,
        first_result_format=first_result_format,
    )


def test_dvd_dropdown(load_driver):
    formatname, searchstring = "DVD", "the"
    first_result_format = "Video disc"
    run_search_query(
        load_driver,
        formatname=formatname,
        searchstring=searchstring,
        first_result_format=first_result_format,
    )


def test_audio_disc_dropdown(load_driver):
    formatname, searchstring = "Videocassette", "the"
    first_result_format = "Video cassette"
    run_search_query(
        load_driver,
        formatname=formatname,
        searchstring=searchstring,
        first_result_format=first_result_format,
    )


#########################################################################################

#why is this test named music score when it uses videocassette. :/ 
#issue with split title but no colon
def test_author_plus_music_score_dropdown(load_driver):
    fieldname, formatname, searchstring = "Author", "Videocassette", "walker"
    first_result_title = (
        "After the storm"
    )
    run_search_query(
        load_driver,
        fieldname=fieldname,
        formatname=formatname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


###########################################################################################
