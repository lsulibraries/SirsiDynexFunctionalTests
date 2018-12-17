function sendAeonRequestInline(rId) {
  jQuery(document).ready(function () {

    var baseURL = 'https://specialcollections.lib.lsu.edu/Logon/?Action=10&Form=20';

    var itemTitle = '&ItemTitle=' + encodeURIComponent(jQuery('#detail' + rId + '_TITLE .TITLE_value').first().text());
    var itemAuthor = '&ItemAuthor=' + encodeURIComponent(jQuery('#detail' + rId + '_INITIAL_AUTHOR_SRCH .INITIAL_AUTHOR_SRCH_value').text());
    var itemPubDate = '&ItemDate=' + encodeURIComponent(jQuery('#detail' + rId + '_PUBDATE_RANGE .PUBDATE_RANGE_value').text());
    var itemPub = '&ItemPublisher=' + encodeURIComponent(jQuery('#detail' + rId + '_PUBLISHER .PUBLISHER_value').first().text());
    var itemPlace = '&ItemPlace=' + encodeURIComponent(jQuery('#detail' + rId + '_PUBLICATION_INFO .PUBLICATION_INFO_value').first().text().split(':')[0]);
    var itemRefnum = '&ReferenceNumber=' + encodeURIComponent(jQuery('#detail' + rId + '_DOC_ID .DOC_ID_value').text().split(':')[1]);
    var itemEdition = '&ItemEdition=' + encodeURIComponent(jQuery('#detail' + rId + '_EDITION .EDITION_value').text());
    var itemInfo1 = '&ItemInfo1=' + encodeURIComponent(jQuery('#detail' + rId + '_ACCESSRESTRICTIONS .ACCESSRESTRICTIONS_value').text());

    setTimeout(function () {
      jQuery('.detailItemsDiv .detailItemTable > tbody > tr.detailItemsTableRow').each(function () {

        var libr = jQuery(this).find('.asyncFieldLIBRARY').first().text();
        var itemDocType = '&DocumentType=' + encodeURIComponent(jQuery(this).find('.detailItemsTable_ITYPE').text().replace(/\n/g, ''));
        var itemCall = '&CallNumber=' + encodeURIComponent(jQuery(this).find('.detailItemsTable_CALLNUMBER').text().replace(/\n/g, ''));
        var curLocation = jQuery(this).find('.asyncFieldSD_ITEM_STATUS').first().text();
        var itemLocation = '&Location=' + encodeURIComponent(curLocation);

        if (libr == "${SPEC_COLL}" || libr == "${ALT_SPEC_COLL}") {
          if (curLocation == "${REMOTE}") {
            baseURL += '&Value=GenericRequestAllIronMountain';
          } else {
            baseURL += '&Value=GenericRequestAll';
          }
          var aeonElem = $J('<td class="detailItemsAeonRequest"><a target="_blank" href="' + baseURL + itemRefnum + itemDocType + itemTitle + itemAuthor + itemEdition + itemCall + itemPub + itemPubDate + itemLocation + itemPlace + itemInfo1 + '">${REQUEST_MATERIAL}</a></td>');
          var destElem = $J(this).find('.detailItemsTable_SD_ITEM_HOLD_LINK')[0];
          replaceItemHoldsElem(aeonElem, destElem);
        }
      });
    }, 500);
  });
}

var replaceItemHoldsElem = function (aeonElem, destElem) {
  if (aeonElem.length) {
    $J(destElem).empty();
    $J(destElem).addClass($J(aeonElem).attr('class'));
    $J(destElem).append($J(aeonElem).children(":first-child"));
  }
}

var ALT_SPEC_COLL = "Special Collections, Hill Memorial Library";
var REMOTE = "LLMVC - Remote Storage";
var REQUEST_MATERIAL = "Request Item";
var SPEC_COLL = "Special Collections";