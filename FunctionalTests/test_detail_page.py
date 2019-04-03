#! /usr/bin/env python3

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
import pytest


import time


@pytest.fixture
def load_hello_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    driver = webdriver.Firefox()
    # driver.delete_all_cookies()
    # driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:2795182/ada?qu=hello')
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:2795182/ada?qu=hello')

    def fin():
        print('teardown driver')
        driver.close()

    request.addfinalizer(fin)
    return driver


@pytest.fixture
def load_observing_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    driver = webdriver.Firefox()
    # driver.delete_all_cookies()
    # driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:2125167/ada?qu=observing+user+experience')
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:2125167/ada?qu=observing+the+user')

    def fin():
        print('teardown driver')
        driver.close()

    request.addfinalizer(fin)
    return driver


@pytest.fixture
def load_specials_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    driver = webdriver.Firefox()
    # driver.delete_all_cookies()
    # driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:1695928/ada?qf=ITYPE%09Type%0921%3AARCH-MSS%09Archive%2FManuscript')
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:1695928/ada?qf=ITYPE%09Type%0921%3AARCH-MSS%09Archive%2FManuscript')

    def fin():
        print('teardown driver')
        driver.close()

    request.addfinalizer(fin)
    return driver

@pytest.fixture
def load_book_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    driver = webdriver.Firefox()
    # driver.delete_all_cookies()
    # driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:1695928/ada?qf=ITYPE%09Type%0921%3AARCH-MSS%09Archive%2FManuscript')
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:179060/one')

    def fin():
        print('teardown driver')
        driver.close()

    request.addfinalizer(fin)
    return driver


################################################################################


def test_detailViewIconReplace(load_hello_driver):
    driver = load_hello_driver
    format_text = driver.find_elements_by_class_name('formatType')[0].text
    assert len(format_text) > 0


def test_detailChangeToAccessThisItem(load_hello_driver):
    driver = load_hello_driver
    elect_access_link = driver.find_element_by_xpath("//a[@class='detail_access_link']")
    assert elect_access_link.text == 'Access This Item'


def test_hideMissingDetailBookImage(load_hello_driver):
    driver = load_hello_driver
    missing_cover_art = driver.find_element_by_id('detailCover0')
    parent_div = missing_cover_art.find_element_by_xpath('..')
    assert '/images/no_image.png' in missing_cover_art.get_attribute('src') and parent_div.get_attribute('style') == 'display: none;'


def test_ILLIfCheckedOut(load_observing_driver):
    driver = load_observing_driver
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'asyncFieldSD_ITEM_STATUS')))
    item_status_div = driver.find_element_by_class_name('asyncFieldSD_ITEM_STATUS')
    illiad_link = driver.find_element_by_xpath('//*[@class="illiadLinkUrl"]').get_attribute('href')
    assert "Due:" in item_status_div.text
    assert len(illiad_link) > 0


def test_prepOpenAccordions(load_observing_driver):
    driver = load_observing_driver
    accordian_h3s = driver.find_elements_by_class_name('ui-accordion-header')
    assert len(accordian_h3s) == 3
    for accordian_h3 in accordian_h3s:
        assert accordian_h3.get_attribute('aria-expanded') == 'true'
        assert accordian_h3.get_attribute('aria-selected') == 'true'
        assert "ui-corner-top" in accordian_h3.get_attribute('class')


def test_linkAvailableOnlineCallNumber(load_hello_driver):
    driver = load_hello_driver
    avaiable_access_link = driver.find_elements_by_xpath("//*[@title='Access this item']")
    assert avaiable_access_link[0].text == "Access this item"


def test_replaceAvailableStatus(load_hello_driver):
    driver = load_hello_driver
    available_header = driver.find_element_by_xpath("//*[@class='detailItemsTable_SD_ITEM_STATUS']")
    assert available_header.text == 'Current Location'


def test_aeonLink(load_specials_driver):
    driver = load_specials_driver
    while True:
        try:
            aeon_td = driver.find_element_by_class_name("detailItemsAeonRequest")
            if aeon_td:
                break
        except:
            continue
        time.sleep(1)
    assert aeon_td.text == 'Request Item'


def test_stackmap(load_book_driver):
    driver = load_book_driver
    while True:
        try:
            stackmap_a = driver.find_element_by_class_name('SMlink')
            if stackmap_a:
                break
        except NoSuchElementException:
            time.sleep(1)
    assert stackmap_a.text == 'Find in the Library'

def test_citationbuttonarrives(load_book_driver):
    driver = load_book_driver
    citation_button = driver.find_element_by_xpath('//div[@id="CitationButton"]/input')
    assert citation_button.get_attribute('value') == 'Citation'

def test_availableheaderscallnumberrename(load_book_driver):
    driver = load_book_driver
    call_number_header = driver.find_element_by_xpath('//th[@class="detailItemsTable_CALLNUMBER"]/div')
    assert call_number_header.text == 'Call Number'


def test_availableheadersrequestitemrename(load_book_driver):
    driver = load_book_driver
    call_number_header = driver.find_element_by_xpath('//th[@class="detailItemsTable_SD_ITEM_HOLD_LINK"]/div')
    assert call_number_header.text == 'Request Item'
