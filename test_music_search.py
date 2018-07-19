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
    profile.set_preference("browser.http.user-cache", False)
    driver = webdriver.Firefox()
    driver.delete_all_cookies()
    driver.get('https://www.lib.lsu.edu/music/search-dev')


    def fin():
        print('teardown driver')
        driver.close()

    request.addfinalizer(fin)
    return driver


def run_search_query(driver, fieldname=None, formatname=None, searchstring=None, location=None, first_result_title=None):
    if fieldname:
        field = Select(driver.find_element_by_id('fieldDropDown'))
        field.select_by_visible_text(fieldname)
    if formatname:
        format = Select(driver.find_element_by_id('formatDropDown'))
        format.select_by_visible_text(formatname)
    if location:
        box = Select(driver.find_element_by_id('library'))
        box.select_by_visible_text(location)
    input = driver.find_element_by_id('q')
    input.clear()
    if searchstring:
        input.send_keys(searchstring)
    input.send_keys(Keys.ENTER)
    wait = WebDriverWait(driver, 10)
    results_1 = wait.until(
        EC.presence_of_element_located((By.ID, "detailLink0"))
    )
    assert results_1.get_attribute('title') == first_result_title


def test_page_loads(load_driver):
    driver = load_driver
    assert 'Music Search' in driver.title

#########################################################################################


def test_author_dropdown(load_driver):
    fieldname, searchstring = 'author', 'hello'
    first_result_title = "Contes extraordinaires."
    run_search_query(load_driver, fieldname=fieldname, searchstring=searchstring, first_result_title=first_result_title)


def test_title_dropdown(load_driver):
    fieldname, searchstring = 'title', 'hello'
    first_result_title = "Hello, Dolly."
    run_search_query(load_driver, fieldname=fieldname, searchstring=searchstring, first_result_title=first_result_title)


def test_subject_dropdown(load_driver):
    fieldname, searchstring = 'subject', 'hello'
    first_result_title = "Ernest Hello : vie, oeuvre, mission"
    run_search_query(load_driver, fieldname=fieldname, searchstring=searchstring, first_result_title=first_result_title)


def test_periodical_title_dropdown(load_driver):
    fieldname, searchstring = 'Journal Title', 'hello'
    first_result_title = "Volunteer on-going language learning manual : beyond hello."
    run_search_query(load_driver, fieldname=fieldname, searchstring=searchstring, first_result_title=first_result_title)

#########################################################################################


def test_music_score_dropdown(load_driver):
    formatname, searchstring = 'Music Score', 'hello'
    first_result_title = "Hello, Dolly! A musical comedy."
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


def test_music_sound_recording_dropdown(load_driver):
    formatname, searchstring = 'Music Sound Recording', 'hello'
    first_result_title = "Quatuor pour la fin du temps. (Quartet for the end of time)"
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


def test_audio_disc_dropdown(load_driver):
    formatname, searchstring = 'Compact disc', 'hello'
    first_result_title = "Hello again"
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


def test_audio_cassette_dropdown(load_driver):
    formatname, searchstring = 'Audio Cassette', 'hello'
    first_result_title = "Strings, keyboard and harp"
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


def test_book_dropdown(load_driver):
    formatname, searchstring = 'Book', 'hello'
    first_result_title = "Hello, Dolly."
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


def test_lp_dropdown(load_driver):
    formatname, searchstring = 'LP (Sound Recording)', 'Virtuoso'
    first_result_title = "Virtuoso cello encores"
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


def test_dvd_dropdown(load_driver):
    formatname, searchstring = 'DVD', 'hello'
    first_result_title = "Hello Louisiana a musical travel film"
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


#########################################################################################


def test_author_plus_music_score_dropdown(load_driver):
    fieldname, formatname, searchstring = 'author', 'Music Score', 'Devienne'
    first_result_title = "Les visitandines : comédie mêlée d'ariettes"
    run_search_query(load_driver, fieldname=fieldname, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


###########################################################################################

def test_author_plus_audio_disc_plus_carter_location(load_driver):
    fieldname, formatname, location, searchstring = 'author', 'Compact disc', 'Carter Music Resources Center, 202 Middleton', 'Mendelssohn'
    first_result_title = "Vier geistliche kantaten"
    run_search_query(load_driver, fieldname=fieldname, formatname=formatname, searchstring=searchstring, location=location, first_result_title=first_result_title)
