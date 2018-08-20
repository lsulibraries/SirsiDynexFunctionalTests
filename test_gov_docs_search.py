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
    driver.get('https://www.lib.lsu.edu/collections/govdocs')

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


def test_page_loads(load_driver):
    driver = load_driver
    assert 'LSU Libraries' in driver.title

########################################################################################


def test_author_dropdown(load_driver):
    fieldname, searchstring = 'Author', 'hello'
    first_result_title = "The confessioun [o]f maister Iohn Kello minister of Spot, togidder with his ernist repentance maid vpon the scaffald befoir his suffering, the fourt day of October. 1570"
    run_search_query(load_driver, fieldname=fieldname, searchstring=searchstring, first_result_title=first_result_title)


def test_title_dropdown(load_driver):
    fieldname, searchstring = 'Title', 'hello'
    first_result_title = "Hello world!"
    run_search_query(load_driver, fieldname=fieldname, searchstring=searchstring, first_result_title=first_result_title)


def test_subject_dropdown(load_driver):
    fieldname, searchstring = 'Subject', 'hello'
    first_result_title = "To pyr to ai?onion, or, Everlasting fire no fancy being an answer to a late pestilent pamphlet, entituled (The foundations of hell-torments shaken and removed), wherein the author hath laboured to prove that there is no everlasting punishment for any man (though finally wicked and impenitent) after this life : his considerations considered, and his cavils, confuted : together with a practical improvement of the point, and the way to escape the damnation of Hell"
    run_search_query(load_driver, fieldname=fieldname, searchstring=searchstring, first_result_title=first_result_title)


def test_periodical_title_dropdown(load_driver):
    fieldname, searchstring = 'Journal Title', 'hi'
    first_result_title = "Research hi-lites"
    run_search_query(load_driver, fieldname=fieldname, searchstring=searchstring, first_result_title=first_result_title)

#########################################################################################


def test_book_dropdown(load_driver):
    formatname, searchstring = 'Book', 'hi'
    first_result_title = "Hi neighbor! ; George Washington National Forest."
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


def test_map_dropdown(load_driver):
    formatname, searchstring = 'Map', 'hello'
    first_result_title = "Hells Canyon National Recreation Area, visual resource inventory."
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


def test_microform_dropdown(load_driver):
    formatname, searchstring = 'Microform', 'hello'
    first_result_title = "Hello! Are You Registered?"
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


def test_print_journal_dropdown(load_driver):
    formatname, searchstring = 'Print Journal', 'hi'
    first_result_title = "Research hi-lites"
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


def test_audio_cassette_dropdown(load_driver):
    formatname, searchstring = 'Audio Cassette', ''
    first_result_title = "Red book"
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


def test_sound_recording_dropdown(load_driver):
    formatname, searchstring = 'LP (Sound Recording)', ''
    first_result_title = "CDC radio public service announcements."
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


def test_dvd_dropdown(load_driver):
    formatname, searchstring = 'DVD', 'live'
    first_result_title = "VA research and academic affiliates partners in health care discovery and innovation"
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


def test_audio_disc_dropdown(load_driver):
    formatname, searchstring = 'Videocassette', 'food'
    first_result_title = "Food safety for moms-to-be practicing good food safety behaviors before, during and after your pregnancy."
    run_search_query(load_driver, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)



#########################################################################################


def test_author_plus_music_score_dropdown(load_driver):
    fieldname, formatname, searchstring = 'Author', 'Videocassette', 'walker'
    first_result_title = "After the storm a citizen's video guide to understanding stormwater"
    run_search_query(load_driver, fieldname=fieldname, formatname=formatname, searchstring=searchstring, first_result_title=first_result_title)


###########################################################################################