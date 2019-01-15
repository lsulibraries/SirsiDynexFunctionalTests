$J(document).ready(function () {
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
    //pass
  }
});

jQuery(document).ready(function () {
  if (window.location.href.indexOf("lsu.ent.sirsi.net") > -1) {
    jQuery('#frame_content').removeAttr('seamless');
    jQuery('#frame_content').attr('scrolling', 'yes');
  }
});

var doGenericTasks = function () {
  customSearchLink();
}

var doDetailViewTasks = function () {
  // Isolated tasks
  detailViewIconReplace();
  createCitationButton();
  hideMissingDetailBookImage();
  prepOpenAccordions();
  detailChangeToAccessThisItem();
  replaceAvailableStatus();
  renameItemNoteColumn();
  renameItemHoldsColumn();
  replaceCallNumChildwithCallNum();
  linkAvailableOnlineCallNumber();
  replaceItemNote();
  // ITEM_STATUS tasks
  ILLIfCheckedOut();
  renameDueStatus();
  // ITEM_HOLD_LINK tasks
  aeonRequest();
  elecAccessIfUnavailable();
  deUnavailablePermReserve();
}

var scheduleConvertResultsStackMapToLink;
var scheduleChangeAvailableIfZero;

var doResultsViewTasks = function () {
  friendlyizeNoResults();
  resultsChangeToAccessThisItem();
  resultsViewIconReplace();
  classifyElecAccessLinks();
  scheduleConvertResultsStackMapToLink = setInterval(convertResultsStackMapToLink, 100);
  scheduleChangeAvailableIfZero = setInterval(changeAvailableIfZero, 200);
}

var doAdvancedSearchViewTasks = function () {
  hideBasicSearch();
}

var doAccountPageTasks = function () {
  changeSMSText();
  changeSMSPopupLabel();
  changeSMSPopupTitle();
}

// Generic Tasks
var customSearchLink = function () {
  $J("#searchBoxAdvancedLink a")
    .attr("href", "https://lsu.ent.sirsi.net/client/en_US/lsu/?rm=MORE+SEARCH+OP0|||1|||0|||true")
    .text('More Search Options');
}

//Detail View Tasks -- Independent
var detailViewIconReplace = function () {
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

var createCitationButton = function () {
  // shortcircuit if "Cite As" field in object body
  if ($J('.PREFCITE524').length) {
    return;
  }

  var oclcNUM, oclcISBN, oclcISSN;

  $J('#detail0_OCLC .OCLC_value').each(function () {
    var oclc_value = $J(this).text().replace('(OCoLC)', '');
    if (oclc_value.length && !isNaN(oclc_value)) {
      oclcNUM = oclc_value;
      return false;
    }
  });
  $J('#detail0_ISBN .ISBN_value').each(function () {
    var isbn_value = $J(this).text();
    if (isbn_value.length) {
      oclcISBN = isbn_value;
      return false;
    }
  });
  $J('#detail0_ISSN .ISSN_value').each(function () {
    var issn_value = $J(this).text();
    if (issn_value.length) {
      oclcISSN = issn_value;
      return false;
    }
  });

  if (oclcNUM || oclcISBN || oclcISSN) {
    var newButton = $J('<input>', { 'class': 'button', title: 'Citation', value: 'Citation', type: 'button' })
      .click(function () {
        citationPopup(oclcNUM, oclcISBN, oclcISSN);
      });
    var newDiv = $J('<div>', { id: 'CitationButton' });
    $J('#detailActionsdetail0').append(newDiv.append(newButton));
  }
}

var citationPopup = function (oclcNUM, oclcISBN, oclcISSN) {
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

var hideMissingDetailBookImage = function () {
  /* this function sets all detail cover art images hidden.
     then, when the anonymous function in Enterprise reassigns the image src
     an event listen is here in place to observe a change.
     A changed image_cover_art is then set to display.
  */
  if ($J('.detail_cover_art[src*="no_image.png"]').length) {
    $J('.detail_cover_art').parent().css('display', 'none');
    $J('.detail_biblio').css('width', '550px');
    var mutationObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
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

var prepOpenAccordions = function () {
  setTimeout("openAccordions();", 200);
}

var openAccordions = function () {
  $J('h3.ui-accordion-header').each(function (i, elem) {
    $J(elem)
      .removeClass("ui-corner-all")
      .addClass("ui-corner-top")
      .attr("aria-expanded", "true")
      .attr("aria-selected", "true")
      .find('span.ui-icon')
      .removeClass("ui-icon-triangle-1-e")
      .addClass("ui-icon-triangle-1-s");
  });
  $J('div.ui-accordion-content').each(function (i, elem) {
    $J(elem)
      .css("visibility", "visible")
      .css("display", "block");
  });
}

var detailChangeToAccessThisItem = function () {
  $J('.ELECTRONIC_ACCESS_label')
    .next()
    .each(function (i, elem) {
      if ($J(elem).attr('href') && $J(elem).attr('href').includes($J(elem).text())) {
        $J(elem).text('Access This Item');
        $J(elem).addClass('detail_access_link');
      }
    })
}

var replaceAvailableStatus = function () {
  $J(".detailItemTable_th:contains('Status')").text('Current Location')
}

var renameItemNoteColumn = function () {
  $J('thead tr .detailItemsTable_ITEMNOTE .detailItemTable_th').text('Item Note');
}

var renameItemHoldsColumn = function () {
  $J('.detailItemTable_th:contains("Item Holds")').text('Request Item');
  changeNamesAfterAjaxComplete();
}

var changeNamesAfterAjaxComplete = function () {
  $J(document).bind("ajaxComplete", function () {
    $J('.asyncFieldSD_ITEM_HOLD_LINK').each(function (iter, elem) {
      var childDiv = $J(elem).children(":first-child");
      if ($J(childDiv).text() == 'Reserve This Copy') {
        $J(childDiv).text('Place Hold');
      }
    })
  })
}

var replaceCallNumChildwithCallNum = function () {
  $J('.detailItemTable_th:contains("Call Number (Child)")').text('Call Number');
}

var linkAvailableOnlineCallNumber = function () {
  hrefElectronicAccess = $J('.ELECTRONIC_ACCESS_label').siblings('a:first').attr('href');
  if (!hrefElectronicAccess) {
    return;
  }
  $J('td.detailItemsTable_CALLNUMBER:contains("AVAILABLE ONLINE")')
    .each(function (i, elem) {
      elem.innerHTML = '';
      new_div = $J('<div>');
      new_p = $J('<p>', { text: 'Available Online' });
      new_href = $J('<a>', { text: 'Access this item', title: 'Access this item', href: hrefElectronicAccess });
      new_div.append(new_p);
      new_div.append(new_href);
      new_div.appendTo(elem);
    })
  $J('td.detailItemsTable_CALLNUMBER:contains("VETERINARY MEDICINE LIBRARY")')
    .each(function (i, elem) {
      elem.innerHTML = '';
      new_div = $J('<div>');
      new_p = $J('<p>', { text: 'Available Online' });
      new_href = $J('<a>', { text: 'Access this item', title: 'Access this item', href: hrefElectronicAccess });
      new_div.append(new_p);
      new_div.append(new_href);
      new_div.appendTo(elem);
    })
}

var titleInfoDict = {};
var scheduleReplacePubNoteCells;
var scheduleNewBookShelf;
var replaceItemNote = function () {
  getTitleInfo();
  scheduleReplacePubNoteCells = setInterval(replacePubNoteCells, 100);
  scheduleNewBookShelf = setInterval(fixNewBookShelf, 100);
}

var getTitleInfo = function () {
  var titleID = $J("#" + 'detail0' + "_DOC_ID .DOC_ID_value").text().split(":")[1];
  var titleInfoWsURL = BASEWSURL + "rest/standard/lookupTitleInfo?clientID=" + CLIENTID + "&titleID=" + titleID + "&includeMarcHoldings=true&includeCatalogingInfo=true&includeAvailabilityInfo=true&includeOrderInfo=true&includeBoundTogether=true&includeCallNumberSummary=true&marcEntryFilter=ALL&includeItemInfo=true&json=true&includeOPACInfo=true";
  $J.ajax({
    dataType: "json",
    url: titleInfoWsURL,
    success: function (data) {
      titleInfoDict = parseTitleInfo(data);
    }
  })
}

var parseTitleInfo = function (data) {
  var interestingData = {};
  var CallInfo = data["TitleInfo"][0]["CallInfo"];
  for (var i = 0; i < CallInfo.length; i++) {
    var callNumber = CallInfo[i]["callNumber"];
    interestingData[callNumber] = {};
    interestingData[callNumber]["libraryID"] = CallInfo[i]["libraryID"];
    interestingData[callNumber]["numberOfCopies"] = CallInfo[i]["numberOfCopies"];
    interestingData[callNumber]["callNumber"] = CallInfo[i]["callNumber"];
    interestingData[callNumber]["itemTypeID"] = CallInfo[i]["ItemInfo"][0]["itemTypeID"];
    interestingData[callNumber]["currentLocationID"] = CallInfo[i]["ItemInfo"][0]["currentLocationID"];
    interestingData[callNumber]["publicNote"] = CallInfo[i]["ItemInfo"][0]["publicNote"];
    interestingData[callNumber]["dueDate"] = parseDueDate(CallInfo[i]["ItemInfo"][0]["dueDate"]);
  };
  return interestingData;
}

var parseDueDate = function (reportedDate) {
  if (reportedDate) {
    var epochDue = new Date(reportedDate);
    var dueDate = epochDue.getMonth() + 1 + "/" + epochDue.getDate() + "/" + epochDue.getFullYear()
  } else {
    var dueDate = "";
  }
  return dueDate;
}

var replacePubNoteCells = function () {
  if (Object.keys(titleInfoDict).length && titleInfoDict.constructor === Object) {
    var hasValues = false;
    //  loop through the Available Table rows & replace PublicNote cell text    
    $J('tr.detailItemsTableRow').each(function (index, elem) {
      var isAvailTable = $J(elem).closest('#detailItemsDiv0').length;
      if (!isAvailTable) {
        return;
      }
      var callNoElem = $J(elem).find('.detailItemsTable_CALLNUMBER');
      if (callNoElem.length) {
        var callNo = $J(callNoElem).text().trim();
      } else {
        var callNo = ''
      }
      var correctItemDict = titleInfoDict[callNo];
      if (correctItemDict === undefined) {
        return;
      }
      if (Object.keys(correctItemDict).length) {
        var correctItemPubNote = correctItemDict['publicNote'];
        // check if any elems have any value for this key, else we later delete the whole column.
        if (correctItemPubNote) {
          hasValues = true;
        }
      } else {
        var correctItemPubNote = '';
      }
      var currentPubNote = $J(elem).find('.detailItemsTable_ITEMNOTE');
      currentPubNote.text(correctItemPubNote);
    })
    if (!hasValues) {
      $J('.detailItemsTable_ITEMNOTE').remove();
    }
    clearInterval(scheduleReplacePubNoteCells);
  }
}

var fixNewBookShelf = function () {
  if (Object.keys(titleInfoDict).length && titleInfoDict.constructor === Object) {
    //  loop through the Available Table rows & replace PublicNote cell text    
    $J('tr.detailItemsTableRow').each(function (index, elem) {
      var isAvailTable = $J(elem).closest('#detailItemsDiv0').length;
      if (!isAvailTable) {
        return;
      }
      var callNoElem = $J(elem).find('.detailItemsTable_CALLNUMBER');
      if (callNoElem.length) {
        var callNo = $J(callNoElem).text().trim();
      } else {
        var callNo = ''
      }
      var correctItemDict = titleInfoDict[callNo];
      if (correctItemDict === undefined) {
        return;
      }
      if (Object.keys(correctItemDict).length) {
        var correctLocation = correctItemDict['currentLocationID'];
        console.log(correctLocation);
        // check if any elems have any value for this key, else we later delete the whole column.
        if (correctLocation == "NEWBOOKS") {
          console.log($J(elem).find('.asyncFieldSD_ITEM_STATUS'));
          var locationCell = $J(elem).closest('tr').find('.detailItemsTable_SD_ITEM_STATUS');
          locationCell.empty().text('New Books Display');
          var holdsCell = $J(elem).closest('tr').find('.asyncFieldSD_ITEM_HOLD_LINK').not('.hidden');
          holdsCell.empty().text('Available');
          clearInterval(scheduleNewBookShelf);
        }
      }
    });
    clearInterval(scheduleNewBookShelf);
  }
}

//Detail View Tasks -- ITEM_STATUS tasks
var ILLIfCheckedOut = function () {
  $J('.asyncFieldSD_ITEM_STATUS').ajaxComplete(function () {
    var itemStati = ($J('.asyncFieldSD_ITEM_STATUS:contains("Due")'));
    if (!itemStati.length || $J('.illiadLinkUrl:contains("Request Interlibrary Loan")').length) {
      return;
    }
    var illiadUrl = buildIlliadRequest();
    addLinkILL(itemStati[0].id, illiadUrl)
  });
}

var buildIlliadRequest = function () {
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

var addLinkILL = function (itemId, illiadUrl) {
  var dueElem = $J('#' + itemId);
  if (dueElem.siblings('.illiadLink').length) {
    return;
  }
  var illiadNode = $J('<div>', { class: 'illiadLink' }).appendTo(dueElem);
  var illiadHref = $J('<a>', { href: illiadUrl, class: 'illiadLinkUrl', text: 'Request Interlibrary Loan' }).appendTo(illiadNode);
}

var renameDueStatus = function () {
  $J('.asyncFieldSD_ITEM_STATUS').ajaxComplete(function () {
    var itemStati = ($J('.asyncFieldSD_ITEM_STATUS:contains("Due")'));
    if (itemStati.length && itemStati[0].childNodes.length) {
      var newText = itemStati[0].childNodes[0].nodeValue.replace('Due ', 'Checked Out -- Due: ');
      itemStati[0].childNodes[0].nodeValue = newText;
    }
  });
}

//Detail View Tasks -- ITEM_HOLD_LINK tasks
var aeonRequest = function () {
  var SPEC_COLL = 'Special Collections';
  var ALT_SPEC_COLL = 'Special Collections, Hill Memorial Library';
  var REMOTE = 'LLMVC - Remote Storage';
  var REQUEST_MATERIAL = 'Request Item';
  var baseURL = 'https://specialcollections.lib.lsu.edu/Logon/?Action=10&Form=20';
  var itemTitle = '&ItemTitle=' + encodeURIComponent(jQuery('#detail0_TITLE .TITLE_value').first().text());
  var itemAuthor = '&ItemAuthor=' + encodeURIComponent(jQuery('#detail0_INITIAL_AUTHOR_SRCH .INITIAL_AUTHOR_SRCH_value').text());
  var itemPubDate = '&ItemDate=' + encodeURIComponent(jQuery('#detail0_PUBDATE_RANGE .PUBDATE_RANGE_value').text());
  var itemPub = '&ItemPublisher=' + encodeURIComponent(jQuery('#detail0_PUBLISHER .PUBLISHER_value').first().text());
  var itemPlace = '&ItemPlace=' + encodeURIComponent(jQuery('#detail0_PUBLICATION_INFO .PUBLICATION_INFO_value').first().text().split(':')[0]);
  var itemRefnum = '&ReferenceNumber=' + encodeURIComponent(jQuery('#detail0_DOC_ID .DOC_ID_value').text().split(':')[1]);
  var itemEdition = '&ItemEdition=' + encodeURIComponent(jQuery('#detail0_EDITION .EDITION_value').text());
  var itemInfo1 = '&ItemInfo1=' + encodeURIComponent(jQuery('#detail0_ACCESSRESTRICTIONS .ACCESSRESTRICTIONS_value').text());
  setTimeout(function () {
    jQuery('.detailItemsDiv .detailItemTable > tbody > tr.detailItemsTableRow').each(function () {
      var libr = jQuery(this).find('.asyncFieldLIBRARY').first().text();
      var itemDocType = '&DocumentType=' + encodeURIComponent(jQuery(this).find('.detailItemsTable_ITYPE').text().replace(/\n/g, ''));
      var itemCall = '&CallNumber=' + encodeURIComponent(jQuery(this).find('.detailItemsTable_CALLNUMBER').text().replace(/\n/g, ''));
      var curLocation = jQuery(this).find('.asyncFieldSD_ITEM_STATUS').first().text();
      var itemLocation = '&Location=' + encodeURIComponent(curLocation);
      if (libr == SPEC_COLL || libr == ALT_SPEC_COLL) {
        if (curLocation == REMOTE) {
          baseURL += '&Value=GenericRequestAllIronMountain';
        } else {
          baseURL += '&Value=GenericRequestAll';
        }
        var aeonElem = $J('<td class="detailItemsAeonRequest"><a target="_blank" href="' + baseURL + itemRefnum + itemDocType + itemTitle + itemAuthor + itemEdition + itemCall + itemPub + itemPubDate + itemLocation + itemPlace + itemInfo1 + '">' + REQUEST_MATERIAL + '</a></td>');
        var destElem = $J(this).find('.detailItemsTable_SD_ITEM_HOLD_LINK').not('.hidden');
        replaceItemHoldsElem(aeonElem, destElem);
      }
    });
  }, 500);
}

var replaceItemHoldsElem = function (aeonElem, destElem) {
  if (aeonElem.length) {
    $J(destElem).empty();
    $J(destElem).addClass($J(aeonElem).attr('class'));
    $J(destElem).append($J(aeonElem).children(":first-child"));
  }
}

var elecAccessIfUnavailable = function () {
  $J('.asyncFieldSD_ITEM_HOLD_LINK').not('.hidden').ajaxComplete(function () {
    $J('.asyncFieldSD_ITEM_HOLD_LINK').not('.hidden').each(function (i, elem) {
      var elecLink = $J(elem).closest('tr').find('.detailItemsTable_CALLNUMBER a').not('.hidden');
      if ($J(elem).text().trim() == 'Unavailable' && elecLink.length) {
        $J(elem)
          .text('')
          .append(elecLink);
      }
    })
  })
}

var deUnavailablePermReserve = function () {
  $J('.asyncFieldSD_ITEM_HOLD_LINK').not('.hidden').ajaxComplete(function () {
    $J('.asyncFieldSD_ITEM_HOLD_LINK').not('.hidden').each(function (i, elem) {
      var materialText = $J(elem).closest('tr').find('.detailItemsTable_ITYPE').not('.hidden').text();
      var itemHoldText = $J(elem).text();
      var isMatch = (materialText.trim() == 'Permanent Reserve') && (itemHoldText.trim() == 'Unavailable');
      if (isMatch) {
        $J(elem).text('Available');
      }
    })
  })
}

//Results View tasks
var friendlyizeNoResults = function () {
  var destElem = $J('#no_results_wrapper #searchResultText');
  destElem.text('');
  var firstLine = $J('<p>', { text: 'Your search returned no results. Please check your spelling and try again.' });
  var DiscLink = $J('<a>', { href: 'https://www.lib.lsu.edu', text: 'Discovery search' });
  var ILLLink = $J('<a>', { href: 'https://louis.hosts.atlas-sys.com/remoteauth/luu/illiad.dll', text: 'Interlibrary Loan' });
  var secondLine = $J('<p>', { text: 'If still not found, please use our ' })
    .append(DiscLink)
    .append(',');
  var thirdLine = $J('<p>', { text: 'or request the material through ' })
    .append(ILLLink)
    .append('.');
  destElem
    .append(firstLine)
    .append(secondLine)
    .append(thirdLine);
}

var resultsChangeToAccessThisItem = function () {
  $J('.ELECTRONIC_ACCESS').children()
    .each(function (i, elem) {
      if ($J(elem).attr('href') && $J(elem).attr('href').includes($J(elem).text())) {
        $J(elem).text('Access This Item');
      }
    })
}

var resultsViewIconReplace = function () {
  $J('.format_container .formatType')
    .each(function (i, elem) {
      var iconText = $J(elem).attr('title');
      $J(elem).text(iconText);
    })
}

var classifyElecAccessLinks = function () {
  var accessLinks = $J('.displayElementText.ELECTRONIC_ACCESS');
  $J(accessLinks).each(function () {
    var acceptableFormats = ['Electronic Resources', 'Audio disc'];
    var itemFormat = findFormatForElecAccessDiv(this);
    var hasText = doesElecAccessLinkHaveText(this);
    if (!hasText) {
      $J(this).addClass('access_button');
    }
  })
}

var findFormatForElecAccessDiv = function (elem) {
  var grandparentDiv = $J(elem).closest('span.thumb_hidden');
  var format = $J(grandparentDiv).siblings().find('.formatType').text();
  return format;
}

var doesElecAccessLinkHaveText = function (elem) {
  var firstChildNode = $J(elem).contents()[0]
  var firstChildNodeType = firstChildNode.nodeType;
  var firstChildNodeText = firstChildNode.nodeValue;
  if ((firstChildNodeType == '3') && (firstChildNodeText.trim().length == 0)) {
    return false;
  }
  return true;
}

var convertResultsStackMapToLink = function () {
  if ($J('td > .SMbutton').length) {
    $J('td > .SMbutton').each(function (i, elem) {
      var newHref = $J('<a />', {
        onclick: $J(elem).attr('onclick'),
        class: 'SMlink',
        text: 'Find in the Library',
        title: 'Find in the Library',
      });
      newHref.appendTo($J(elem).parent());
      $J(elem).remove();
    });
    clearInterval(scheduleConvertResultsStackMapToLink);
  }
}

var changeAvailableIfZero = function () {
  if ($J('.smallSpinner').length == 0) {
    $J('.availableNumber').each(function (i, elem) {
      if ($J(elem).text() == '0') {
        $J(elem.previous()).text('Currently Checked Out');
        $J(elem).text('');
      }
    });
    clearInterval(scheduleChangeAvailableIfZero);
  }
}

//Advanced Search Page tasks
var hideBasicSearch = function () {
  $J('#searchBoxWrapper').css('display', 'none');
}

//Accounts Page tasks
var changeSMSText = function () {
  $J('a:contains("SMS Notifications")').text('Text Notifications');
}

var changeSMSPopupLabel = function () {
  $J('#smsPhoneNameDiv label').text('Name This Notification');
}

var changeSMSPopupTitle = function () {
  $J('#ui-dialog-title-smsPrefDialog_0').text('Add Text Notification')
}


/* Default entrypoints */
/*
Use these two functions to call your custom functions.
  customJavaScript() is called on each page load.
  customDetailJavaScript() is called only on detail view pages.
Any code you want run, point to it from one of these two.
*/

function customJavaScript() {}

function customDetailJavaScript() {}