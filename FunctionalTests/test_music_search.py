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
    driver.get("https://www.lib.lsu.edu/collections/music")

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
    input = driver.find_element_by_id("q")
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


def test_page_loads(load_driver):
    driver = load_driver
    assert "Music Resources" in driver.title


########################################################################################


def test_author_dropdown(load_driver):
    fieldname, searchstring = "Author", "hello"
    first_result_title = "Contes extraordinaires."
    run_search_query(
        load_driver,
        fieldname=fieldname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


def test_title_dropdown(load_driver):
    fieldname, searchstring = "Title", "hello"
    first_result_title = "Hello, Dolly."
    run_search_query(
        load_driver,
        fieldname=fieldname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


def test_subject_dropdown(load_driver):
    fieldname, searchstring = "Subject", "hello"
    first_result_title = "Pink globalization : Hello Kitty's trek across the Pacific"
    run_search_query(
        load_driver,
        fieldname=fieldname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


def test_periodical_title_dropdown(load_driver):
    fieldname, searchstring = "Journal Title", "hello"
    first_result_title = "Highlights Hello"
    run_search_query(
        load_driver,
        fieldname=fieldname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


########################################################################################


def test_music_score_dropdown(load_driver):
    formatname, searchstring = "Music Score", "the"
    first_result_format = "Music"
    run_search_query(
        load_driver,
        formatname=formatname,
        searchstring=searchstring,
        first_result_format=first_result_format,
    )


def test_music_sound_recording_dropdown(load_driver):
    formatname, searchstring = "Music Sound Recording", "the"
    first_result_format = "Music Sound Recording"
    run_search_query(
        load_driver,
        formatname=formatname,
        searchstring=searchstring,
        first_result_format=first_result_format,
    )


def test_audio_disc_dropdown(load_driver):
    formatname, searchstring = "Compact Disc", "the"
    first_result_format = "Audio disc"
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


def test_book_dropdown(load_driver):
    formatname, searchstring = "Book", "the"
    first_result_format = "Book"
    run_search_query(
        load_driver,
        formatname=formatname,
        searchstring=searchstring,
        first_result_format=first_result_format,
    )


def test_lp_dropdown(load_driver):
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


def test_dvd_dropdown(load_driver):
    formatname, searchstring = "Videocassette", "the"
    first_result_format = "Video cassette"
    run_search_query(
        load_driver,
        formatname=formatname,
        searchstring=searchstring,
        first_result_format=first_result_format,
    )


# #########################################################################################


def test_author_plus_music_score_dropdown(load_driver):
    fieldname, formatname, searchstring = "Author", "Music Score", "Devienne"
    first_result_title = "Les visitandines : comédie mêlée d'ariettes"
    run_search_query(
        load_driver,
        fieldname=fieldname,
        formatname=formatname,
        searchstring=searchstring,
        first_result_title=first_result_title,
    )


# ###########################################################################################


def test_author_plus_music_score_plus_carter_location(load_driver):
    fieldname, formatname, location, searchstring = (
        "Author",
        "Music Score",
        "Carter Music Resources Center, 202 Middleton",
        "Mendelssohn",
    )
    first_result_title = "Leipziger Ausgabe der Werke Felix Mendelssohn Bartholdys."
    run_search_query(
        load_driver,
        fieldname=fieldname,
        formatname=formatname,
        searchstring=searchstring,
        location=location,
        first_result_title=first_result_title,
    )
