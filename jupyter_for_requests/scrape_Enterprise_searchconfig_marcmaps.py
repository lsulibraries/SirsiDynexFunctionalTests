import requests
from bs4 import BeautifulSoup as soup
import json


"""required imports"""
# pip install bs4
# pip install requests


"""functions to get response from urls"""


def get_search_fields_editfield_page(search_field_code):
    search_field_code = search_field_code.replace('/', '$002f').replace(' ', '$0020')
    return s.get('https://lsu.ent.sirsi.net/client/en_US/admin/search/managefields.edit/{}'.format(search_field_code))


def get_search_fields_marc_page(search_field_code):
    search_field_code = search_field_code.replace('/', '$002f').replace(' ', '$0020')
    return s.get('https://lsu.ent.sirsi.net/client/en_US/admin/search/managefields.confmarcmap/{}'.format(search_field_code))


def get_max_search_fields_page():
    search_fields_page = s.get('https://lsu.ent.sirsi.net/client/en_US/admin/search/managefields')
    search_soup = soup(search_fields_page.content, 'lxml')
    pages = search_soup.select('.t-data-grid-pager a')
    max_page = max(int(i.text) for i in pages)
    return max_page


def get_marc_maps_editfield_page(search_field_code):
    search_field_code = str(search_field_code).replace('/', '$002f').replace(' ', '$0020')
    return s.get('https://lsu.ent.sirsi.net/client/en_US/admin/search/managemarcmaps.edit/{}'.format(search_field_code))


def get_marc_maps_managemarcmaps_confmarc21tags_page(search_field_code):
    search_field_code = str(search_field_code).replace('/', '$002f').replace(' ', '$0020')
    return s.get('https://lsu.ent.sirsi.net/client/en_US/admin/search/managemarcmaps.confmarc21tags/{}/false'.format(search_field_code))


def get_marc_maps_subfields_page(search_field_code):
    search_field_code = str(search_field_code).replace('/', '$002f').replace(' ', '$0020')
    return s.get('https://lsu.ent.sirsi.net/client/en_US/admin/search/managemarctags.configuresubfields/{}'.format(search_field_code))


"""Utility functions"""


def get_max_marc_maps_page():
    search_fields_page = s.get('https://lsu.ent.sirsi.net/client/en_US/admin/search/managemarcmaps')
    search_soup = soup(search_fields_page.content, 'lxml')
    pages = search_soup.select('.t-data-grid-pager a')
    max_page = max(int(i.text) for i in pages)
    return max_page


def get_max_marc_maps_subfields(subfields_soup):
    return len(subfields_soup.select('.t-data-grid tbody tr'))


def get_search_fields_items(page, search_fields_dict):
    search_fields_page = s.get('https://lsu.ent.sirsi.net/client/en_US/admin/search/managefields.grid.pager/{}'.format(page))
    search_soup = soup(search_fields_page.content, 'lxml')
    if not search_fields_dict:
        search_fields_dict = dict()
    for row in search_soup.tbody:
        search_field_code, search_field_name, search_field_hierarchy, links = row.contents
        search_fields_dict[search_field_code.string] = {
            'code': search_field_code.string,
            'name': search_field_name.string,
            'hierarchy': search_field_hierarchy.string.strip(),
        }
    return search_fields_dict


"""functions for parsing field types"""


def parse_checkbox(css_id, my_soup):
    try:
        css_code = '#{}'.format(css_id)
        my_soup.select(css_code)[0]['checked']
        return True
    except KeyError:
        return False
    except IndexError:
        return "Unknown"


def parse_dropdown(css_id, my_soup):
    try:
        css_code = '#{}'.format(css_id)
        return my_soup.select(css_code)[0].select('[selected]')[0].string
    except KeyError:
        return "None"
    except IndexError:
        return "None"


def parse_textbox(css_id, my_soup):
    try:
        css_code = '#{}'.format(css_id)
        return my_soup.select(css_code)[0]['value']
    except KeyError:
        return "None"
    except IndexError:
        return "None"


"""Parsing Searchfield info"""


def build_basic_search_dict():
    search_fields_dict = None
    max_page = get_max_search_fields_page()
    for page_num in range(1, max_page + 1):
        search_fields_dict = get_search_fields_items(page_num, search_fields_dict)
    return search_fields_dict


def add_search_field_editfield_dict(search_fields_dict):
    for search_field in search_fields_dict:
        editfield_page = get_search_fields_editfield_page(search_field)
        editfield_soup = soup(editfield_page.content, 'lxml')
        if not search_fields_dict[search_field].get('EditField'):
            search_fields_dict[search_field]['EditField'] = dict()
        editfield_dict = {
            'descripton': editfield_soup.select('#description')[0].string,
            'hierarchy': parse_dropdown('hierarchy', editfield_soup),
            'fieldCodeType': parse_dropdown('fieldCodeType', editfield_soup),
            'indexed': parse_checkbox('indexed', editfield_soup),
            'normalizer': parse_dropdown('normalizer', editfield_soup),
            'dataType': parse_dropdown('dataType', editfield_soup),
            'sort': parse_dropdown('sort', editfield_soup),
            'repeatable': parse_checkbox('repeatable', editfield_soup),
            'splitonspace': parse_checkbox('splitonspace', editfield_soup),
            'facet': parse_checkbox('facet', editfield_soup),
            'exclusiveFacet': parse_checkbox('exclusiveFacet', editfield_soup),
            'displayFieldType': parse_dropdown('displayFieldType', editfield_soup),
            'hitlistAvail': parse_checkbox('hitlistAvail', editfield_soup),
            'detailAvail': parse_checkbox('detailAvail', editfield_soup),
            'detailTab': parse_dropdown('detailTab', editfield_soup),
            'specialProcessing': parse_dropdown('specialProcessing', editfield_soup),
        }
        search_fields_dict[search_field]['EditField'].update(editfield_dict)
    return search_fields_dict


def add_search_field_configuremarcmap_dict(search_fields_dict):
    for search_field in search_fields_dict:
        configuremarcmap_page = get_search_fields_marc_page(search_field)
        configuremarcmap_soup = soup(configuremarcmap_page.content, 'lxml')
        search_fields_dict[search_field]['ConfigureMarcMap'] = parse_dropdown('marcMap', configuremarcmap_soup)
    return search_fields_dict


"""Parsing MarcMap info"""


def parse_editmarcmap_soup(editmarcmap_soup):
    editmarcmap_dict = {
        'description': parse_textbox('description', editmarcmap_soup),
        'marc21Cond': parse_textbox('marc21Cond', editmarcmap_soup),
        'unimarcCond': parse_textbox('unimarcCond', editmarcmap_soup),
        'exclusiveValue': parse_checkbox('exclusiveValue', editmarcmap_soup),
    }
    return editmarcmap_dict


def parse_subfields(marc_item_index):
    subfields_page = get_marc_maps_subfields_page(marc_item_index)
    subfields_soup = soup(subfields_page.content, 'lxml')
    subfields_count = get_max_marc_maps_subfields(subfields_soup)
    subfields_dict = dict()
    for count in range(0, subfields_count):
        subfield_page = s.get('https://lsu.ent.sirsi.net/client/en_US/admin/search/managemarcsubfields.edit/{}'.format(count))
        subfield_page_soup = soup(subfield_page.content, 'lxml')
        subfield = parse_textbox('subfield', subfield_page_soup)
        subfield_marc_dict = {
            'subfield': subfield,
            'beginningPunct': parse_textbox('beginningPunct', subfield_page_soup),
            'endingPunct': parse_textbox('endingPunct', subfield_page_soup),
            'marcCond': parse_textbox('marcCond', subfield_page_soup),
        }
        subfields_dict[subfield] = subfield_marc_dict
    return subfields_dict


def get_marc_info(marc_code):
    print(marc_code)
    item_marc_dict = dict()
    editmarcmap_page = get_marc_maps_editfield_page(marc_code)
    editmarcmap_soup = soup(editmarcmap_page.content, 'lxml')
    editmarcmap_dict = parse_editmarcmap_soup(editmarcmap_soup)
    item_marc_dict.update(editmarcmap_dict)

    managemarcmaps_confmarc21tags_page = get_marc_maps_managemarcmaps_confmarc21tags_page(marc_code)
    fields = soup(managemarcmaps_confmarc21tags_page.content, 'lxml').select('#tagsTable tbody tr')
    for marc_item_index, _ in enumerate(fields):
        managemarctags_edit_page = s.get('https://lsu.ent.sirsi.net/client/en_US/admin/search/managemarctags.edit/{}'.format(marc_item_index))
        field_soup = soup(managemarctags_edit_page.content, 'lxml')
        tag = parse_textbox('tag', field_soup)
        field_marc_dict = {
            'tag': tag,
            'marcCond': parse_textbox('marcCond', field_soup),
            'firstPrefix': parse_textbox('firstPrefix', field_soup),
            'firstSuffix': parse_textbox('firstSuffix', field_soup),
            'otherPrefix': parse_textbox('otherPrefix', field_soup),
            'otherSuffix': parse_textbox('otherSuffix', field_soup),
            'concatSubfields': parse_checkbox('concatSubfields', field_soup),
            'concatTags': parse_checkbox('concatTags', field_soup),
            'fixedField': parse_checkbox('fixedField', field_soup),
            'offset': parse_textbox('offset', field_soup),
            'length': parse_textbox('length', field_soup),
        }
        item_marc_dict[tag] = field_marc_dict
        item_marc_dict[tag]['subfields'] = parse_subfields(marc_item_index)
    return item_marc_dict


def get_all_marc_codes():
    pages_of_marc_codes = get_max_marc_maps_page()
    marc_codes = set()
    for count in range(1, pages_of_marc_codes + 1):
        managemarcmaps_page = s.get('https://lsu.ent.sirsi.net/client/en_US/admin/search/managemarcmaps.grid.pager/{}'.format(count))
        managemarcmaps_soup = soup(managemarcmaps_page.content, 'lxml')
        marc_rows = managemarcmaps_soup.select('#marcMapTable tbody tr')
        for row in marc_rows:
            marc_codes.add(row.select('td')[0].string)
    return list(sorted(marc_codes))


if __name__ == '__main__':
    request_headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Cookie": "JSESSIONID=2F6E7BF66D9BAE0846E5313DBFDEA42B.tomcat-13409",
        "Host": "lsu.ent.sirsi.net",
        "Pragma": "no-cache",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
    }

    url = 'https://lsu.ent.sirsi.net/client/en_US/login.loginform'
    data = {
        'j_username': '',
        'j_password': '',
        't:formdata': '',
    }
    if not (data['j_username'] and data['j_password'] and data['t:formdata']):
        data['j_username'] = input('what is your Enterprise username? ')
        data['j_password'] = input('what is your Enterprise password? ')
        data['t:formdata'] = input('paste in a "t:formdata value"\nBefore you log into Enterprise, Ctrl-i - Network tab - *submit your login* - find login.loginform - copy from Form Data the t:formdata text')

    s = requests.Session()
    r = s.post(url, data=data)

    search_dict = build_basic_search_dict()
    search_dict = add_search_field_editfield_dict(search_dict)
    search_dict = add_search_field_configuremarcmap_dict(search_dict)
    with open('Enterprise_search_fields.json', 'w') as f:
        f.write(json.dumps(search_dict))

    # all_marc_codes = get_all_marc_codes()
    # all_marc_details_dict = dict()
    # for num, marc_code in enumerate(all_marc_codes):
    #     marc_info = get_marc_info(marc_code)
    #     all_marc_details_dict[marc_code] = marc_info
    # with open('Enterprise_marc_fields.json', 'w') as f:
    #     f.write(json.dumps(all_marc_details_dict))
