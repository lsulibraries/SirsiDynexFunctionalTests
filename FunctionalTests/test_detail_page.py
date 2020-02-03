#! /usr/bin/env python3

import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
import pytest

from . import _conf_settings


URL = _conf_settings.URL
USER_AGENT = _conf_settings.USER_AGENT


@pytest.fixture
def load_hello_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    profile.set_preference("general.useragent.override", USER_AGENT)
    driver = webdriver.Firefox(firefox_profile=profile)
    driver.get(f"{URL}/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:2795182/ada?qu=hello")

    def fin():
        print("teardown driver")
        driver.close()

    request.addfinalizer(fin)
    return driver


@pytest.fixture
def load_checkedout_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    profile.set_preference("general.useragent.override", USER_AGENT)
    driver = webdriver.Firefox(firefox_profile=profile)
    driver.get(f"{URL}/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:104644/one")

    def fin():
        print("teardown driver")
        driver.close()

    request.addfinalizer(fin)
    return driver


@pytest.fixture
def load_specials_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    profile.set_preference("general.useragent.override", USER_AGENT)
    driver = webdriver.Firefox(firefox_profile=profile)
    driver.get(f"{URL}/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:1556136/one")

    def fin():
        print("teardown driver")
        driver.close()

    request.addfinalizer(fin)
    return driver


@pytest.fixture
def load_book_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    profile.set_preference("general.useragent.override", USER_AGENT)
    driver = webdriver.Firefox(firefox_profile=profile)
    driver.get(f"{URL}/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:2125167/one")

    def fin():
        print("teardown driver")
        driver.close()

    request.addfinalizer(fin)
    return driver


@pytest.fixture
def load_newbooksdisplay_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    profile.set_preference("general.useragent.override", USER_AGENT)
    driver = webdriver.Firefox(firefox_profile=profile)
    driver.get(f"{URL}/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:5789379/ada?qu=Kurds+and+politics+of+Turkey&d=ent%3A%2F%2FSD_LSU%2F0%2FSD_LSU%3A5789379~SD_LSU~0&te=SD_LSU")

    def fin():
        print("teardown driver")
        driver.close()

    request.addfinalizer(fin)
    return driver


###############################################################################

def test_detailViewIconReplace(load_hello_driver):
    driver = load_hello_driver
    format_text = driver.find_elements_by_class_name("formatType")[0].text
    assert len(format_text) > 0


def test_detailChangeToAccessThisItem(load_hello_driver):
    driver = load_hello_driver
    elect_access_link = driver.find_element_by_xpath("//a[@class='detail_access_link']")
    assert elect_access_link.text == "Access This Item"


def test_hideMissingDetailBookImage(load_hello_driver):
    driver = load_hello_driver
    missing_cover_art = driver.find_element_by_id("detailCover0")
    parent_div = missing_cover_art.find_element_by_xpath("..")
    assert (
        "/images/no_image.png" in missing_cover_art.get_attribute("src")
        and parent_div.get_attribute("style") == "display: none;"
    )


def test_ILLIfCheckedOut(load_checkedout_driver):
    driver = load_checkedout_driver
    wait = WebDriverWait(driver, 10)
    wait.until(
        EC.presence_of_element_located((By.CLASS_NAME, "asyncFieldSD_ITEM_STATUS"))
    )
    item_status_div = driver.find_element_by_class_name("asyncFieldSD_ITEM_STATUS")
    illiad_link = driver.find_element_by_xpath(
        '//*[@class="illiadLinkUrl"]'
    ).get_attribute("href")
    assert "Due:" in item_status_div.text
    assert len(illiad_link) > 0


def test_prepOpenAccordions(load_checkedout_driver):
    driver = load_checkedout_driver
    time.sleep(1)
    accordian_h3s = driver.find_elements_by_class_name("ui-accordion-header")
    for accordian_h3 in accordian_h3s:
        assert accordian_h3.get_attribute("aria-expanded") == "true"
        assert accordian_h3.get_attribute("aria-selected") == "true"


def test_linkAvailableOnlineCallNumber(load_hello_driver):
    driver = load_hello_driver
    time.sleep(3)
    avaiable_access_link = driver.find_elements_by_xpath(
        "//*[@title='Access this item']"
    )
    assert avaiable_access_link[0].text == "Access this item"


def test_replaceAvailableStatus(load_hello_driver):
    time.sleep(3)
    driver = load_hello_driver
    available_header = driver.find_element_by_xpath(
        "//*[@class='detailChildFieldLabel label text-h5 detailItemsTable_SD_ITEM_STATUS']"
    )
    assert available_header.text == "Current Location"


def test_aeonLink(load_specials_driver):
    driver = load_specials_driver
    retries = 10
    while retries > 0:
        try:
            aeon_td = driver.find_element_by_class_name("detailItemsAeonRequest")
            if aeon_td:
                break
        except:
            retries = retries - 1
            time.sleep(3)
    assert aeon_td.text == "Request Item"


def test_stackmap(load_book_driver):
    driver = load_book_driver
    retries = 10
    while retries > 0:
        try:
            stackmap_a = driver.find_element_by_class_name("SMlink")
            if stackmap_a:
                break
        except NoSuchElementException:
            retries = retries - 1
            time.sleep(3)
    assert stackmap_a.text == "Find in the Library"


def test_citationbuttonarrives(load_book_driver):
    driver = load_book_driver
    try:
        # desktop view
        citation_button = driver.find_element_by_xpath('//div[@id="CitationButton"]/input')
        assert citation_button.get_attribute("value") == "Citation"
    except NoSuchElementException:
        # mobile view
        citation_button = driver.find_element_by_xpath('//*[@id="detail0_action77"]/a')
        assert citation_button.get_attribute('text') == "Citation"


def test_availableheaderscallnumberrename(load_book_driver):
    driver = load_book_driver
    time.sleep(3)
    try:
        callnumber_header = driver.find_element_by_xpath(
            '//th[@class="detailItemsTable_CALLNUMBER"]/div'
        )
    except NoSuchElementException:
        callnumber_header = driver.find_element_by_xpath(
           '//*[@class="detailChildFieldLabel label text-h5 detailItemsTable_CALLNUMBER"]'
        )
    assert callnumber_header.text == "Call Number"


def test_availableheadersrequestitemrename(load_book_driver):
    driver = load_book_driver
    time.sleep(3)
    try:
        holds_header = driver.find_element_by_xpath(
            '//th[@class="detailItemsTable_SD_ITEM_HOLD_LINK"]/div'
        )
    except NoSuchElementException:
        holds_header = driver.find_element_by_xpath(
            '//*[@class="detailChildFieldLabel label text-h5 detailItemsTable_SD_ITEM_HOLD_LINK"]'
        )
    assert holds_header.text == "Request Item"


#working on desktop
def test_newBookDisplayShelf(load_newbooksdisplay_driver):
    driver = load_newbooksdisplay_driver
    time.sleep(1)
    location = driver.find_elements_by_xpath("//td[@class='detailItemsTable_SD_ITEM_STATUS']")[0].text
    assert location == "New Books Display"

def test_newBookDisplayShelfMobile(load_newbooksdisplay_driver):
    driver = load_newbooksdisplay_driver
    time.sleep(1)
    location = driver.find_elements_by_xpath("//div[@class='asyncFieldSD_ITEM_STATUS']")[0].text
    assert location == "New Books Display"


#working on desktop
def test_newBookDisplayRequest(load_newbooksdisplay_driver):
    driver = load_newbooksdisplay_driver
    time.sleep(1)
    request = driver.find_elements_by_xpath("//div[@class='asyncFieldSD_ITEM_HOLD_LINK asyncInProgressSD_ITEM_HOLD_LINK']")[0].text
    assert request == "Available"

