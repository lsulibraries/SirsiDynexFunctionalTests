$J(document).ready(function() {
  doGenericTasks();
  if ($J('.detail_main').length) {
    doDetailViewTasks();
  } else if ($J('.searchView').length) {
    doResultsViewTasks();
  } else if ($J('.customAdvancedSearch').length) {
    doAdvancedSearchViewTasks();
  } else if ($J('#myAccount').length) {
    doAccountPageTasks();
  } else if (jQuery('.framedPage').length) {
    // makeiframeNewTab();
  }
});

var doGenericTasks = function() {
  customSearchLink();
}

var scheduleStackMapToCurrentLocation;
var doDetailViewTasks = function() {
  detailViewIconReplace();
  detailChangeToAccessThisItem();
  hideMissingDetailBookImage();
  ILLIfCheckedOut();
  renameDueStatus();
  createCitationButton();
  prepOpenAccordions();
  linkAvailableOnlineCallNumber();
  replaceAvailableStatus();
  renameItemHoldsColumn();
  scheduleStackMapToCurrentLocation = setInterval(moveStackMapToCurrentLocation, 800);

}

var scheduleChangeAvailableIfZero;
var doResultsViewTasks = function() {
  resultsChangeToAccessThisItem();
  resultsViewIconReplace();
  classifyElecAccessLinks();
  scheduleChangeAvailableIfZero = setInterval(changeAvailableIfZero, 200);
}

var doAdvancedSearchViewTasks = function() {
  hideBasicSearch();
}

var doAccountPageTasks = function() {
  changeSMSText();
  changeSMSPopupLabel();
  changeSMSPopupTitle();
}

/*
Starting custom functions.
*/

var makeiframeNewTab = function() {
  // the iframe we're targetting doesn't have the $ or $J shortcut, use jQuery term.
  jQuery('.call_number_search_header').attr('target', '_blank');
}

var createCitationButton = function() {
  var oclcNUM = $J('#detail0_OCLC .OCLC_value').text();
  var oclcISBN = $J('#detail0_ISBN .ISBN_value').text();
  var oclcISSN = $J('#detail0_ISSN .ISSN_value').text();
  if (oclcNUM || oclcISBN || oclcISSN) {
    var newButton = $J('<input>', { 'class': 'button', title: 'Citation', value: 'Citation', type: 'button' })
      .click(function() {
        citationPopup(oclcNUM, oclcISBN, oclcISSN);
      });
    var newDiv = $J('<div>', { id: 'CitationButton' });
    $J('#detailActionsdetail0').append(newDiv.append(newButton));
  }
}

var citationPopup = function(oclcNUM, oclcISBN, oclcISSN) {
  if (oclcNUM != '') {
    var myURL = 'http://www.worldcat.org/oclc/' + oclcNUM + '?page=citation';
  } else if (oclcISBN != '') {
    oclcISBN2 = oclcISBN.substr(0, 13);
    var myURL = 'http://www.worldcat.org/isbn/' + oclcISBN2 + '?page=citation';
  } else if (oclcISSN != '') {
    oclcISSN2 = oclcISSN.substr(0, 8);
    var myURL = 'http://www.worldcat.org/issn/' + oclcISSN2 + '?page=citation';
  }
  window.open("" + myURL, "mywindow", "location=1,scrollbars=1,resizable=1,width=800, height=400");
}

var renameDueStatus = function() {
  $J('.asyncFieldSD_ITEM_STATUS').ajaxComplete(function() {
    var itemStati = ($J('.asyncFieldSD_ITEM_STATUS:contains("Due")'));
    if (itemStati.length && itemStati[0].childNodes.length) {
      var newText = itemStati[0].childNodes[0].nodeValue.replace('Due ', 'Checked Out -- Due: ');
      itemStati[0].childNodes[0].nodeValue = newText;
    }
  });
}

var ILLIfCheckedOut = function() {
  $J('.asyncFieldSD_ITEM_STATUS').ajaxComplete(function() {
    var itemStati = ($J('.asyncFieldSD_ITEM_STATUS:contains("Due")'));
    if (!itemStati.length || $J('.illiadLinkUrl.illiadLinkUrl:contains("Request Interlibrary Loan")').length) {
      return;
    }
    var illiadUrl = buildIlliadRequest();
    addLinkILL(itemStati[0].id, illiadUrl)
  });
}

var addLinkILL = function(itemId, illiadUrl) {
  var dueElem = $J('#' + itemId);
  if (dueElem.siblings('.illiadLink').length) {
    return;
  }
  var illiadNode = $J('<div>', { class: 'illiadLink' }).appendTo(dueElem);
  var illiadHref = $J('<a>', { href: illiadUrl, class: 'illiadLinkUrl', text: 'Request Interlibrary Loan' }).appendTo(illiadNode);
}

var buildIlliadRequest = function() {
  var oslFormat = $J('#detail0_FORMAT .FORMAT_value').text();
  var oslTitle = $J('#detail0_TITLE .TITLE_value').text();
  var oslRecordID = $J('#detail0_OCLC .OCLC_value').text();
  var oslISBN = $J('#detail0_ISBN .ISBN_value:first-child').text();
  var oslISSN = $J('#detail0_ISSN .ISSN_value').text();
  var oslAuthorLastName = $J('#detail0_INITIAL_AUTHOR_SRCH .INITIAL_AUTHOR_SRCH_value').text().split(',')[0];
  var oslPubDate = $J('#detail0_PUBDATE_RANGE .PUBDATE_RANGE_value').text();
  var oslPublisher = $J('#detail0_PUBLISHER .PUBLISHER_value').text();
  var oslPubPlace = $J('#detail0_PUBLICATION_INFO .PUBLICATION_INFO_value').text().split(':')[0];
  if (oslFormat == 'Continuing Resources') {
    var requestType = 'article';
    var oslISXN = oslISSN;
  } else {
    var requestType = 'loan';
    var oslISXN = oslISBN;
  }
  var illiadUrl = encodeURI('https://louis.hosts.atlas-sys.com/remoteauth/LUU/illiad.dll?Action=10&Form=30&sid=CATALOG&genre=' + requestType + '&title=' + oslTitle + '++[owned+by+LSU+' + oslRecordID + ']&ISBN=' + oslISXN + '&aulast=' + oslAuthorLastName + '&date=' + oslPubDate + '&rft.pub=' + oslPublisher + '&rft.place=' + oslPubPlace);
  return illiadUrl;
}

var detailViewIconReplace = function() {
  var format_containerDiv = document.getElementsByClassName('format_container');
  var iconTexts = Array();
  for (var i = 0; i < format_containerDiv.length; i++) {
    var formatTypeDiv = format_containerDiv[i].firstElementChild;
    var iconText = formatTypeDiv.getAttribute('title');
    if (iconText && iconText != 'Other') {
      iconTexts.push(iconText);
    }
    formatTypeDiv.textContent = '';
    if (i == format_containerDiv.length - 1) {
      var iconString = iconTexts.join(', ');
      format_containerDiv[0].firstElementChild.textContent = iconString;
    }
  }
}

var resultsViewIconReplace = function() {
  $J('.format_container .formatType')
    .each(function(i, elem) {
      var iconText = $J(elem).attr('title');
      $J(elem).text(iconText);
    })
}

var customSearchLink = function() {
  $J("#searchBoxAdvancedLink a")
    .attr("href", "https://lsu.ent.sirsi.net/client/en_US/lsu/?rm=MORE+SEARCH+OP0|||1|||0|||true")
    .text('More Search Options');
}

var resultsChangeToAccessThisItem = function() {
  $J('.ELECTRONIC_ACCESS').children()
    .each(function(i, elem) {
      if ($J(elem).attr('href') && $J(elem).attr('href').includes($J(elem).text())) {
        $J(elem).text('Access This Item');
      }
    })
}

var detailChangeToAccessThisItem = function() {
  $J('.ELECTRONIC_ACCESS_label')
    .next()
    .each(function(i, elem) {
      if ($J(elem).attr('href') && $J(elem).attr('href').includes($J(elem).text())) {
        $J(elem).text('Access This Item');
        $J(elem).addClass('detail_access_link');
      }
    })
}

var hideBasicSearch = function() {
  $J('#searchBoxWrapper').css('display', 'none');
}

var hideMissingDetailBookImage = function() {
  /* this function sets all detail cover art images hidden.
     then, when the anonymous function in Enterprise reassigns the image src
     an event listen is here in place to observe a change.
     A changed image_cover_art is then set to display.
  */
  if ($J('.detail_cover_art[src*="no_image.png"]').length) {
    $J('.detail_cover_art').parent().css('display', 'none');
    $J('.detail_biblio').css('width', '550px');
    var mutationObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type == 'attributes' && mutation.target.className == 'detail_cover_art') {
          mutationObserver.disconnect();
          $J('.detail_cover_art').parent().css('display', '');
          $J('.detail_biblio').css('width', '');
        }
      });
    });
    mutationObserver.observe($J('#detailCover0').get(0), { attributes: true });
  }
}


var prepOpenAccordions = function() {
  setTimeout("openAccordions();", 200);
}

var openAccordions = function() {
  $J('h3.ui-accordion-header').each(function(i, elem) {
    $J(elem)
      .removeClass("ui-corner-all")
      .addClass("ui-corner-top")
      .attr("aria-expanded", "true")
      .attr("aria-selected", "true")
      .find('span.ui-icon')
      .removeClass("ui-icon-triangle-1-e")
      .addClass("ui-icon-triangle-1-s");
  });
  $J('div.ui-accordion-content').each(function(i, elem) {
    $J(elem)
      .css("visibility", "visible")
      .css("display", "block");
  });
}


var linkAvailableOnlineCallNumber = function() {
  hrefElectronicAccess = $J('.ELECTRONIC_ACCESS_label').siblings('a:first').attr('href');
  if (!hrefElectronicAccess) {
    return;
  }
  $J('td.detailItemsTable_CALLNUMBER:contains("AVAILABLE ONLINE")')
    .each(function(i, elem) {
      elem.innerHTML = '';
      new_div = $J('<div>');
      new_p = $J('<p>', {
        text: 'Available Online',
      });
      new_href = $J('<a>', {
        text: 'Access this item',
        title: 'Access this item',
        href: hrefElectronicAccess,
      });
      new_div.append(new_p);
      new_div.append(new_href);
      new_div.appendTo(elem);
    })
}

var replaceAvailableStatus = function() {
  $J(".detailItemTable_th:contains('Status')").text('Current Location')
}

var renameItemHoldsColumn = function() {
  $J('.detailItemTable_th:contains("Item Holds")').text('Request Item');
  changeNamesAfterAjaxComplete();
}

var changeNamesAfterAjaxComplete = function() {
  $J(document).bind("ajaxComplete", function() {
    $J('.asyncFieldSD_ITEM_HOLD_LINK').each(function(iter, elem) {
      var childDiv = $J(elem).children(":first-child");
      if ($J(childDiv).text() == 'Reserve This Copy') {
        $J(childDiv).text('Place Hold');
      }
    })
  })
}

var lsuHasUrlSwap = function() {
  while ($J('.HOLDING:contains("<COM.SIRSIDYNIX.DISCOVERY.SEARCH.LIB")').length) {
    $J('.HOLDING:contains("<COM.SIRSIDYNIX.DISCOVERY.SEARCH.LIB")').text(function() {
      return $J(this).text()
        .replace('<COM.SIRSIDYNIX.DISCOVERY.SEARCH.LIB.INDEX>', 'Index:')
        .replace('<COM.SIRSIDYNIX.DISCOVERY.SEARCH.LIB.SUPPLEMENT>', 'Supplement:');
    });
  }
}

var classifyElecAccessLinks = function() {
  var accessLinks = $J('.displayElementText.ELECTRONIC_ACCESS');
  $J(accessLinks).each(function() {
    var acceptableFormats = ['Electronic Resources', 'Audio disc'];
    var itemFormat = findFormatForElecAccessDiv(this);
    var hasText = doesElecAccessLinkHaveText(this);
    if (!hasText) {
      $J(this).addClass('access_button');
    }
  })
}

var findFormatForElecAccessDiv = function(elem) {
  var grandparentDiv = $J(elem).closest('span.thumb_hidden');
  var format = $J(grandparentDiv).siblings().find('.formatType').text();
  return format;
}

var doesElecAccessLinkHaveText = function(elem) {
  var firstChildNode = $J(elem).contents()[0]
  var firstChildNodeType = firstChildNode.nodeType;
  var firstChildNodeText = firstChildNode.nodeValue;
  if ((firstChildNodeType == '3') && (firstChildNodeText.trim().length == 0)) {
    return false;
  }
  return true;
}

var changeSMSText = function() {
  $J('a:contains("SMS Notifications")').text('Text Notifications');
}

var changeSMSPopupLabel = function() {
  $J('#smsPhoneNameDiv label').text('Name This Notification');
}

var changeSMSPopupTitle = function() {
  $J('#ui-dialog-title-smsPrefDialog_0').text('Add Text Notification')
}

var removeSomePubDates = function() {
  $J('.format_container .formatType:contains("Electronic Resources")')
    .closest('.results_bio ')
    .find('.PUBDATE_RANGE')
    .closest('.displayElementWrapper')
    .remove();
}

var moveStackMapToCurrentLocation = function() {
  var availableItemsCount = $J('.detailItemsDiv > div > table > tbody > tr').length;
  var stackMapLoopsDone = 0;
  if ($J('.SMbutton').length) {
    $J('.detailItemsTableRow').each(function(id, elem) {
      smbutton = $J(elem).find('.SMbutton');
      if (smbutton.length) {
        stacksDiv = $J(elem).find('.asyncFieldSD_ITEM_STATUS').not('.hidden');
        var newHref = $J('<a />', {
          onclick: smbutton.attr('onclick'),
          class: 'SMlink',
          text: 'Find in the Library',
          title: 'Find in the Library',
        });
        stacksDiv.text('');
        newHref.appendTo(stacksDiv);
        smbutton.parent().remove();
      };
    })
    stackMapLoopsDone += 1;
    if (availableItemsCount / (stackMapLoopsDone * 30) < 1) {
      clearInterval(scheduleStackMapToCurrentLocation);
    }
  };
}

var changeAvailableIfZero = function() {
  if ($J('.smallSpinner').length == 0) {
    $J('.availableNumber').each(function(i, elem) {
      if ($J(elem).text() == '0') {
        $J(elem.previous()).text('Currently Checked Out');
        $J(elem).text('');
      }
    });
    clearInterval(scheduleChangeAvailableIfZero);
  }
}


/* Default entrypoints */
/*
Use these two functions to call your custom functions.
  customJavaScript() is called on each page load.
  customDetailJavaScript() is called only on detail view pages.
Any code you want run, point to it from one of these two.
*/

function customJavaScript() {
  //   setTimeout("addContinueSearchLink();", 100);
  // }

  // function addContinueSearchLink() {
  //   var language = com_sirsi_ent_page.localeCode;
  //   if (language === "fr_CA" || language === "fr_FR") {
  //     var continueText = 'Continuer la recherche dans: ';
  //     //Update quicksearch buttons
  //     jQuery('.quicksearch_display_button a').each(function() {
  //       var newLang = jQuery(this).attr('href').replace("ENTENG", "ENTFRE");
  //       var newLang = jQuery(this).attr('href').replace("ENTSPA", "ENTFRE");
  //       jQuery(this).attr('href', newLang);
  //     });
  //   } else if (language === "es_ES" || language === "es_CH") {
  //     var continueText = 'Continuar la búsqueda en: ';
  //     //Update quicksearch buttons
  //     jQuery('.quicksearch_display_button a').each(function() {
  //       var newLang = jQuery(this).attr('href').replace("ENTENG", "ENTSPA");
  //       var newLang = jQuery(this).attr('href').replace("ENTFRE", "ENTSPA");
  //       jQuery(this).attr('href', newLang);
  //     });
  //   } else {
  //     var continueText = 'Continue the search in: ';
  //     //Update quicksearch buttons
  //     jQuery('.quicksearch_display_button a').each(function() {
  //       var newLang = jQuery(this).attr('href').replace("ENTFRE", "ENTENG");
  //       var newLang = jQuery(this).attr('href').replace("ENTSPA", "ENTENG");
  //       jQuery(this).attr('href', newLang);
  //     });
  //   }
}

function customDetailJavaScript() {
}
