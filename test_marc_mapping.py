#! /usr/bin/env python3

from selenium import webdriver
# from selenium.webdriver.support.ui import Select
# from selenium.webdriver.common.keys import Keys
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support import expected_conditions as EC
import pytest


@pytest.fixture
def load_driver(request):
    profile = webdriver.FirefoxProfile()
    profile.set_preference("browser.cache.disk.enable", False)
    profile.set_preference("browser.cache.memory.enable", False)
    profile.set_preference("browser.http.user-cache", False)
    driver = webdriver.Firefox()

    def fin():
        print('teardown driver')
        driver.close()

    request.addfinalizer(fin)
    return driver


def test_VariantTitle(load_driver):
    driver = load_driver
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:5182858/one')
    divs_OtherTitle = driver.find_elements_by_class_name('VARIANTTITLE')
    for div in divs_OtherTitle:
        if div.text == 'Facsimile has half-title: Histoire naturelle des plus rares curiositez de la mer des Indes':
            assert True
            break
    else:
        assert False


def test_PortionOfTitle(load_driver):
    driver = load_driver
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:5182858/one')
    divs_OtherTitle = driver.find_elements_by_class_name('PORTION_OF_TITLE')
    for div in divs_OtherTitle:
        if div.text == 'Natural history of the rarest curiosities of the seas of the Indies':
            assert True
            break
    else:
        assert False


def test_ParallelTitle(load_driver):
    driver = load_driver
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:989237/one')
    divs_OtherTitle = driver.find_elements_by_class_name('PARALLELTITLE')
    for div in divs_OtherTitle:
        if div.text == 'Coelestial atlas, or, A new ephemeris for the year of Our Lord ...':
            assert True
            break
    else:
        assert False


def test_DistinctiveTitle(load_driver):
    driver = load_driver
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:1759311/one')
    divs_OtherTitle = driver.find_elements_by_class_name('DISTINCTIVETITLE')
    for div in divs_OtherTitle:
        if 'Free the genitals, cage the generals' in div.text:
            assert True
            break
    else:
        assert False


def test_OtherTitle(load_driver):
    driver = load_driver
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:85598/ada?qu=Fraternities+at+LSU&te=SD_LSU')
    divs_OtherTitle = driver.find_elements_by_class_name('OTHERTITLE')
    for div in divs_OtherTitle:
        if div.text == 'Introduction to fraternities at LSU':
            assert True
            break
    else:
        assert False


def test_CoverTitle(load_driver):
    driver = load_driver
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:85598/ada?qu=Fraternities+at+LSU&te=SD_LSU')
    divs_OtherTitle = driver.find_elements_by_class_name('COVERTITLE')
    for div in divs_OtherTitle:
        if div.text == 'LSU fraternities':
            assert True
            break
    else:
        assert False


def test_AddedTitlePageTitle(load_driver):
    driver = load_driver
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:1021811/ada?qu=Lykophronos+tou+Chalkide%C5%8Ds+Kassandra&te=SD_LSU')
    divs_OtherTitle = driver.find_elements_by_class_name('ADDEDTITLEPAGETITLE')
    for div in divs_OtherTitle:
        if div.text == 'Lycophronis Chalcidensis Cassandra':
            assert True
            break
    else:
        assert False


def test_CaptionTitle(load_driver):
    driver = load_driver
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:1073000/ada?qu=A+sermon+preach%27d+in+St.+Paul%27s+Cathedral%2C+before+the+Lord-Mayor%2C+aldermen%2C+%26c.+on+Sunday%2C+October+23%2C+1698&te=SD_LSU')
    divs_OtherTitle = driver.find_elements_by_class_name('CAPTIONTITLE')
    for div in divs_OtherTitle:
        if div.text == "Sermon preach'd before the Lord-Mayor":
            assert True
            break
    else:
        assert False


def test_RunningTitle(load_driver):
    driver = load_driver
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:428561/one?qu=F352+.H75+1698B&te=SD_LSU')
    divs_OtherTitle = driver.find_elements_by_class_name('RUNNINGTITLE')
    for div in divs_OtherTitle:
        if div.text == 'New discovery of a large country in America Voyage into North America':
            assert True
            break
    else:
        assert False


def test_SpineTitle(load_driver):
    driver = load_driver
    driver.get('https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:1365113/one?qu=ND34+.P5+1798&te=SD_LSU')
    divs_OtherTitle = driver.find_elements_by_class_name('SPINETITLE')
    for div in divs_OtherTitle:
        if div.text == "Pilkington's dictionary of painters":
            assert True
            break
    else:
        assert False


