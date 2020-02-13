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
PROFILE = _conf_settings.PROFILE

@pytest.fixture
def load_hello_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    profile.set_preference("general.useragent.override", USER_AGENT)
    driver = webdriver.Firefox(firefox_profile=profile)
    driver.get(f"{URL}/search/detailnonmodal/ent:$002f$002f{PROFILE}$002f0$002f{PROFILE}:2795182/ada?qu=hello")

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
    driver.get(f"{URL}/search/detailnonmodal/ent:$002f$002f{PROFILE}$002f0$002f{PROFILE}:104644/one")

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
    driver.get(f"{URL}/search/detailnonmodal/ent:$002f$002f{PROFILE}$002f0$002f{PROFILE}:1556136/one")

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
    driver.get(f"{URL}/search/detailnonmodal/ent:$002f$002f{PROFILE}$002f0$002f{PROFILE}:2125167/one")

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
    driver.get(f"{URL}/search/detailnonmodal/ent:$002f$002f{PROFILE}$002f0$002f{PROFILE}:5789379/ada?qu=Kurds+and+politics+of+Turkey&d=ent%3A%2F%2F{PROFILE}%2F0%2F{PROFILE}%3A5789379~{PROFILE}~0&te={PROFILE}")

    def fin():
        print("teardown driver")
        driver.close()

    request.addfinalizer(fin)
    return driver
@pytest.fixture


def load_pubnote_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    profile.set_preference("general.useragent.override", USER_AGENT)
    driver = webdriver.Firefox(firefox_profile=profile)
    driver.get(f"{URL}/search/detailnonmodal/ent:$002f$002f{PROFILE}$002f0$002f{PROFILE}:4627075/one?qu=Saunders+Vetrinary+Flash+Cards&te={PROFILE}")

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


#this item will be checked out until may 22, can we establish a test item or something that will always be checked out.
def test_ILLIfCheckedOut(load_checkedout_driver):
    driver = load_checkedout_driver
    print(driver.current_url)
    wait = WebDriverWait(driver, 10)
    wait.until(
        EC.presence_of_element_located((By.CLASS_NAME, "asyncFieldSD_ITEM_STATUS"))
    )
    time.sleep(1)
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
    try:
        # mobile version
        available_header = driver.find_element_by_xpath(
            "//*[@class='detailChildFieldLabel label text-h5 detailItemsTable_SD_ITEM_STATUS']"
        )
    except NoSuchElementException:
        #desktop version
        available_header = driver.find_element_by_xpath(
            "//*[@class='detailItemsTable_SD_ITEM_STATUS']"
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
    print("STACK MAP EXPECTED TO FAIL on Mobile")
    driver = load_book_driver
    print(driver.current_url)
    stackmap_a = driver.find_element_by_class_name("SMlink")
    retries = 10
    while retries > 0:
        try:
            if stackmap_a:
                break
        except NoSuchElementException:
            retries = retries - 1
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
    print(driver.current_url)
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


def test_newBookDisplayShelf(load_newbooksdisplay_driver):
    driver = load_newbooksdisplay_driver
    print(driver.current_url)
    time.sleep(1)
    location = driver.find_elements_by_xpath("//*[text()='New Books Display']")
    assert location[0].text == 'New Books Display'
# old and obsolete
#    try:
#        location = driver.find_elements_by_xpath("//td[@class='detailItemsTable_SD_ITEM_STATUS']")
#        if location:
#            location = location[0].text
#    except NoSuchElementException:
#        location = driver.find_elements_by_xpath("//div[@class='asyncFieldSD_ITEM_STATUS']")
#        print(location)
#        location = location[0].text
#        print(location)
#    assert location == "New Books Display"


def test_newBookDisplayRequest(load_newbooksdisplay_driver):
    driver = load_newbooksdisplay_driver
    time.sleep(1)
    request = driver.find_elements_by_xpath("//div[@class='asyncFieldSD_ITEM_HOLD_LINK asyncInProgressSD_ITEM_HOLD_LINK']")[0].text
    assert request == "Available"


def test_publicNote(load_pubnote_driver):
    driver = load_pubnote_driver
    print(driver.current_url)
    time.sleep(1)
    request = driver.find_element_by_xpath("//*[text()='CIRCULATES FOR 2 DAYS ONLY!! 400 Flash Cards - ask at Circulation desk']")
#    try:
#        request = driver.find_element_by_xpath("//div[@class='detailChildFieldValue fieldValue text-p detailItemsTable_ITEMNOTE']")
#    except NoSuchElementException:
#        request = driver.find_element_by_xpath("//td[@class='detailItemsTable_ITEMNOTE']")
    assert request.text == "CIRCULATES FOR 2 DAYS ONLY!! 400 Flash Cards - ask at Circulation desk"

