var BASEWSURL = 'https://lalu.sirsi.net/lalu_ilsws/';
var CLIENTID = 'DS_CLIENT';

/*
  Desktop Markup Outline
  <body class="nonmobile">
    <input value="false" id="fbAvailableHidden" type="hidden" >
    <div class="patronLogin hidden" id="loginModal">
    <div class="loginDiv loginMessages">
    <div class="header">
    <div class="bcolor-s4 bcolor nm-bgcolor-p3 searchBoxWrapper" id="searchBoxWrapper">
    <div class="quicksearchWrapper" id="quicksearchWrapper">	
    <div id="content" class="nonmobile">        
    <div class="footer_container bgcolor-p3 nm-bgcolor-p3 nm-ada-bgcolor-p3" id="footer">
    <div id="SMtooltip">
  </body>
  Mobile Markup Outline
  <body class="mobile bgcolor-s7 text-p">
    <input value="false" id="fbAvailableHidden" type="hidden">
    <div class="patronLogin hidden" id="loginModal">
    <div id="bodyWrapper">
      <div id="content" class="mobile">
        <div class="header">
        <div class="bcolor-s4 bcolor nm-bgcolor-p3 searchBoxWrapper" id="searchBoxWrapper">
        <div class="emailModalDialogContainer" id="emailModalDialogContainer">
        <div id="smsDialog">
        <div id="placeHoldDialog">			
        <div class="searchView bgcolor-s7" id="searchViewDISCOVERY_ALL">
        <div class="bgcolor-s7" id="footerWrapper">
      </div>
    </div>
  </body>		
*/



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
  replaceItemNote();
  replaceDetailGovDocsLabel();
  makePrecedingSucceedingLinks();
  deVSeriesLink();
  // ITEM_STATUS tasks
  renameDueStatus();
  // ITEM_HOLD_LINK tasks
  // elecAccessIfUnavailable();
  makeRequestItemColumn();

}


var scheduleConvertResultsStackMapToLink;
var schedulechangeAvailableAfterSpinner;

var doResultsViewTasks = function () {
  friendlyizeNoResults();
  resultsChangeToAccessThisItem();
  resultsViewIconReplace();
  classifyElecAccessLinks();
  replaceGovDocsLabel();
  scheduleConvertResultsStackMapToLink = setInterval(convertResultsStackMapToLink, 300);
  schedulechangeAvailableAfterSpinner = setInterval(changeAvailableAfterSpinner, 300);
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
/*
Purpose: Replaces the format image with words
Example URL: https://lsu.ent.sirsi.net/client/en_US/lsu/search/results?qu=turtles&te=

Desktop Incoming Markup: 
  <div id="formatContainer0" class="format_container">
    <div title="Book" class="formatType text-p">
      <span aria-hidden="true" style="" class="formatTypeIcon formatTypeIcon-BOOK icon-p"></span>
      <span class="formatText">Book</span>
    </div>
  </div>

Desktop Outgoing Markup:   
  <div id="formatContainer0" class="format_container">
    <div title="Book" class="formatType text-p">Book</div>
  </div>

Mobile Incoming Markup: TBD
Mobile Outgoing Markup: TBD
*/
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

/*
Purpose: Hide the default cover image; only shows the 
  image if it’s actually the book cover
Example URL: https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:18266/ada?qu=turtles

Desktop Incoming Markup w/ Image: 
  <div class="detail_cover_art_div">
    <img 
      src="https://secure.syndetics.com/index.aspx?type=xw12&amp;client=louislibnet&amp;upc=&amp;oclc=&amp;isbn=9781560983729/LC.JPG" 
      alt="Cover image for " 
      id="detailCover0" 
      title="Cover image for " 
      class="detail_cover_art">
  <div class="facebook_like_detail"></div>
  </div>

Desktop Outgoing Markup  w/ Image:   
  <div class="detail_cover_art_div">
    <img 
      src="https://secure.syndetics.com/index.aspx?type=xw12&amp;client=louislibnet&amp;upc=&amp;oclc=&amp;isbn=9781560983729/LC.JPG" 
      alt="Cover image for " 
      id="detailCover0" 
      title="Cover image for " 
      class="detail_cover_art">
    <div class="facebook_like_detail"></div>
    </div>

Desktop Incoming Markup  w/o Image: 
<div class="detail_cover_art_div">
  <img 
    src="/client/assets/5.523.17/ctx//client/images/no_image.png" 
    alt="Cover image for " 
    id="detailCover0" 
    title="Cover image for " 
    class="detail_cover_art">
  <div 
    style="display:none" 
    title="Cover image for " 
    class="no_image_text" 
    id="detailCover0Title"></div>
  <div class="facebook_like_detail"></div>
</div>

Desktop Outgoing Markup  w/o Image:   
<div class="detail_cover_art_div" style="display: none;">
  <img 
    src="/client/assets/5.523.17/ctx//client/images/no_image.png" 
    alt="Cover image for " 
    id="detailCover0" 
    title="Cover image for " 
    class="detail_cover_art">
  <div 
    style="display: block;" 
    title="Cover image for " 
    class="no_image_text" 
    id="detailCover0Title"></div>
  <div class="facebook_like_detail"></div>
</div>

Mobile Incoming Markup: TBD
Mobile Outgoing Markup: TBD
*/
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
  setTimeout("openAccordions();", 300);
}

/*
Purpose: Opens both the Holdings and Available table
Example URL: https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:3568569/ada?qu=turtles&qf=FORMAT%09Format%09CR%09Print+Journal

Desktop Incoming Markup: 
  <div class="accordionHolder 
              border-t 
              bcolor-s4 
              bcolor 
              hidden 
              ui-accordion 
              bgcolor-white 
              text-h4 
              ui-widget 
              ui-helper-reset" 
    id="detail_accordion0" 
    role="tablist">
    <h3 
      class="detailAccordionHeader 
              items 
              result0 
              ui-accordion-header 
              nm-bgcolor-p5 
              nm-bgcolor-ada 
              ui-state-default 
              ui-accordion-header-active 
              ui-state-active" 
      role="tab" 
      id="ui-id-1" 
      aria-controls="detailItemsDiv0" 
      aria-selected="true" 
      aria-expanded="true" 
      tabindex="0">
      <i class="fa fa-caret-down"></i>
      <a href="#">
        <span class="availableLabel availableCountLabel">Available:</span>
      </a>
    </h3>    
    <div class="detailAccordionContent 
                items 
                result0 
                detailItemsDiv 
                ui-accordion-content 
                ui-corner-bottom 
                text-p ui-helper-reset 
                ui-widget-content 
                ui-accordion-content-active" 
      id="detailItemsDiv0" 
      aria-labelledby="ui-id-1" 
      role="tabpanel" 
      aria-hidden="false" 
      style="">
      <div class="detailItems ">
        ...
      </div>
    </div>
    ...
    
  </div>



Desktop Outgoing Markup:   
  <div class="accordionHolder 
              border-t 
              bcolor-s4 
              bcolor 
              ui-accordion 
              bgcolor-white 
              text-h4 
              ui-widget 
              ui-helper-reset" 
      id="detail_accordion0" 
      role="tablist">
    <h3 class="detailAccordionHeader 
              items 
              result0 
              ui-accordion-header 
              nm-bgcolor-p5 
              nm-bgcolor-ada 
              ui-state-default 
              ui-accordion-header-active 
              ui-state-active 
              ui-corner-top" 
      role="tab" 
      id="ui-id-1" 
      aria-controls="detailItemsDiv0" 
      aria-selected="true" 
      aria-expanded="true" 
      tabindex="0">
      <i class="fa fa-caret-down"></i>
      <a href="#">
        <span class="availableLabel availableCountLabel">Available:</span>
      </a>
    </h3>
    <div class="detailAccordionContent 
                items 
                result0  
                detailItemsDiv 
                ui-accordion-content 
                ui-corner-bottom 
                text-p 
                ui-helper-reset 
                ui-widget-content 
                ui-accordion-content-active" 
      id="detailItemsDiv0" 
      aria-labelledby="ui-id-1" 
      role="tabpanel" 
      aria-hidden="false" 
      style="visibility: visible; display: block;">
        <div class="detailItems ">
        ...
        </div>
    </div>
    ...
  </div>

Mobile Incoming Markup: TBD
Mobile Outgoing Markup: TBD
*/
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

/*
Purpose: Replaces Full path URL linke with “Access This Item”, and adds class to the A tag
Example URL: https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:1631073/ada?qu=turtles

Desktop Incoming Markup: 
  <div class="displayElementWrapper"
    <div class="displayElementLabel text-h5 ELECTRONIC_ACCESS ELECTRONIC_ACCESS_label">
      Electronic Access:
    </div>
    <a 
      target="_blank"  
      href="https://utils.louislibraries.org/cgi-bin/lz0050.x?sitecode=LALUelib?http://utils.louislibraries.org/cgi-bin/lz0050.x?sitecode=LALU?http://purl.access.gpo.gov/GPO/LPS55182?catkey=1631073">
      http://utils.louislibraries.org/cgi-bin/lz0050.x?sitecode=LALU?http://purl.access.gpo.gov/GPO/LPS55182
    </a>
  </div>


Desktop Outgoing Markup: 
  <div class="displayElementWrapper">
    <div class="displayElementLabel text-h5 ELECTRONIC_ACCESS ELECTRONIC_ACCESS_label">
      Electronic Access:
    </div>
    <a 
      target="_blank" 
      href="https://utils.louislibraries.org/cgi-bin/lz0050.x?sitecode=LALUelib?http://utils.louislibraries.org/cgi-bin/lz0050.x?sitecode=LALU?http://purl.access.gpo.gov/GPO/LPS55182?catkey=1631073" 
      class="detail_access_link">
      Access This Item
    </a>
  </div>

Mobile Incoming Markup: TBD
Mobile Outgoing Markup: TBD

*/
var detailChangeToAccessThisItem = function () {
  $J('.ELECTRONIC_ACCESS_label')
    .siblings()
    .each(function (i, elem) {
      if ($J(elem).attr('href') && $J(elem).attr('href').includes($J(elem).text())) {
        $J(elem).text('Access This Item');
        $J(elem).addClass('detail_access_link');
      }
    })
}

/*
Purpose: Replaces Column header “Status” with “Current Location”
Example URL: https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:1631073/ada?qu=turtles

Desktop Incoming Markup: 
  <th class="detailItemsTable_SD_ITEM_STATUS">
    <div class="detailItemTable_th">Status</div>
    <span class="sorttable_sortAnyInd">
      <img src="/client/images/account-icons/sortable.png" class="checkoutsIcons" alt="Click to Sort">
    </span>
  </th>

Desktop Outgoing Markup: 
  <th class="detailItemsTable_SD_ITEM_STATUS">
    <div class="detailItemTable_th">Current Location</div>
    <span class="sorttable_sortAnyInd"><img src="/client/images/account-icons/sortable.png" class="checkoutsIcons" alt="Click to Sort"></span>
  </th>


Mobile Incoming Markup: TBD
Mobile Outgoing Markup: TBD
*/
var replaceAvailableStatus = function () {
  $J(".detailItemTable_th:contains('Status')").text('Current Location')
}

/*
Purpose: Renames item  Note Column Header
Example URL: ???

Desktop Incoming Markup: TBD
Desktop Outgoing Markup: TBD
Mobile Incoming Markup: TBD
Mobile Outgoing Markup: TBD

// Is this needed? Potentially remove
*/
var renameItemNoteColumn = function () {
  $J('thead tr .detailItemsTable_ITEMNOTE .detailItemTable_th').text('Item Note');
}

/*
Purpose: Part of replacing holds with ILL feature
Example URL: https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:1836309/ada?qu=turtle

Desktop Incoming Markup:
  <td class="detailItemsTable_SD_ITEM_HOLD_LINK">
    <div class="asyncFieldSD_ITEM_HOLD_LINK" id="asyncFielddetailItemsDiv0SD_ITEM_HOLD_LINK31518102334558">
      <a href="javascript:com_sirsi_ent_login.loginFirst(function(reload){placeItemHold(reload, '/client/en_US/lsu/search/placehold/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:5331702/31518102334558/item_hold?qu=Hold&amp;d=ent%3A%2F%2FSD_LSU%2F0%2FSD_LSU%3A5331702%7E%7E0');});">
        Reserve This Copy
      </a>
    </div>
    <div class="asyncFieldSD_ITEM_HOLD_LINK hidden" id="asyncFieldDefaultdetailItemsDiv0SD_ITEM_HOLD_LINK31518102334558">
      Unavailable
    </div>
  +</td>

Desktop Outgoing Markup:
  <td class="detailItemsTable_SD_ITEM_HOLD_LINK">
    <div class="asyncFieldSD_ITEM_HOLD_LINK" id="asyncFielddetailItemsDiv0SD_ITEM_HOLD_LINK31518102334558">
      <a href="javascript:com_sirsi_ent_login.loginFirst(function(reload){placeItemHold(reload, '/client/en_US/lsu/search/placehold/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:5331702/31518102334558/item_hold?qu=Hold&amp;d=ent%3A%2F%2FSD_LSU%2F0%2FSD_LSU%3A5331702%7E%7E0');});">
        Place Hold
      </a>
    </div>
    <div class="asyncFieldSD_ITEM_HOLD_LINK hidden" id="asyncFieldDefaultdetailItemsDiv0SD_ITEM_HOLD_LINK31518102334558">
      Unavailable
    </div>
  </td>
Mobile Incoming Markup: TBD
Mobile Outgoing Markup: TBD
*/
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

/*
Purpose: Wording change
Example URL: ????

Desktop Incoming Markup:
  <th class="detailItemsTable_CALLNUMBER">
    <div class="detailItemTable_th">
      Call Number (Child)
    </div>
    <span class="sorttable_sortAnyInd">
      <img src="/client/images/account-icons/sortable.png" class="checkoutsIcons" alt="Click to Sort">
    </span>
  </th>

Desktop Outgoing Markup:
  <th class="detailItemsTable_CALLNUMBER">
    <div class="detailItemTable_th">
      Call Number
    </div>
    <span class="sorttable_sortAnyInd">
      <img src="/client/images/account-icons/sortable.png" class="checkoutsIcons" alt="Click to Sort">
    </span>
  </th>

Mobile Incoming Markup: TBD
Mobile Outgoing Markup: TBD
*/
var replaceCallNumChildwithCallNum = function () {
  $J('.detailItemTable_th:contains("Call Number (Child)")').text('Call Number');
}

/*
Covers next set of methods through fixNewBookShelf
Purpose: Gets title and item data from API / Enables custom display of item info
Example URL: ????

Desktop Incoming Markup: TBD
Desktop Outgoing Markup: TBD

Mobile Incoming Markup: TBD
Mobile Outgoing Markup: TBD
*/

var titleInfoDict = {};
var scheduleReplacePubNoteCells;
var scheduleNewBookShelf;
var replaceItemNote = function () {
  getTitleInfo();
  scheduleReplacePubNoteCells = setInterval(replacePubNoteCells, 300);
  scheduleNewBookShelf = setInterval(fixNewBookShelf, 300);
}

var getTitleInfo = function () {
  var titleID = $J("#" + 'detail0' + "_DOC_ID .DOC_ID_value").text().split(":")[1];
  var titleInfoWsURL = BASEWSURL + "rest/standard/lookupTitleInfo?clientID=" + CLIENTID + "&titleID=" + titleID + "&includeItemInfo=true&json=true";
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
        var correctItemPubNote = correctItemDict['publicNote'] || '';
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
        // check if any elems have any value for this key, else we later delete the whole column.
        if (correctLocation == "NEWBOOKS") {
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

/*
  End Title Info Update methods
*/

var replaceDetailGovDocsLabel = function () {
  $J('.asyncFieldLIBRARY').ajaxComplete(function () {
    $J('.asyncFieldLIBRARY:contains("Government Documents/Microforms")').text("Government Documents - (Currently Closed to Public - See Access Services)");
  })
}

var makePrecedingSucceedingLinks = function () {
  var succeedingEntryElem = $J('.displayElementText.SUCCENTRY');
  var precedingEntryElem = $J('.displayElementText.PRECENTRY');
  replaceEntryWithLink(succeedingEntryElem);
  replaceEntryWithLink(precedingEntryElem);
}

var replaceEntryWithLink = function (entryElem) {
  var formattedText = entryElem.text().strip();
  while (formattedText.includes(' ')) {
    formattedText = formattedText.replace(' ', '+');
  }
  var entryLink = $J("<a />", {
    class: "EntryLink",
    alt: entryElem.text(),
    title: entryElem.text(),
    href: "/client/en_US/lsu/search/results?rt=false%7C%7C%7CUNIFORM_TITLE_LSU%7C%7C%7CUniform+Title+LSU&qu=" + entryElem.text().replace(' ', '+'),
    text: entryElem.text()
  });
  entryElem.text('')
  entryElem.append(entryLink);
}

var deVSeriesLink = function () {
  var origLink = $J('.displayElementText.SERIES a').attr('href');
  if (origLink && origLink.length) {
    var newLink = origLink.split('+%3B+')[0];
    $J('.displayElementText.SERIES a').attr('href', newLink);
  };
}

//Detail View Tasks -- ITEM_STATUS tasks


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

var makeRequestItemColumn = function () {
  $availableTable = $J('.detailItemsTable_SD_ITEM_STATUS').first().parentsUntil('div .detailItems').filter('table');
  $header = $availableTable.children('thead');
  $rows = $availableTable.children('tbody');
  makeRequestItemHeader($header);
  makeRequestItemCells($rows);
}

var makeRequestItemHeader = function ($header) {
  $newHeader = $J('<th>', { class: "detailItemsTable_SD_ITEM_HOLD_LINK" });
  $newHeaderChild = $J('<div>', { class: "detailItemTable_th", text: "Request Item" });
  $newHeader.append($newHeaderChild);
  $sortButton = $J('<span>', { class: "sortable_sortAnyInd" })
    .append($J('<img>', { src: "/client/images/account-icons/sortable.png", class: "checkoutsIcons", alt: "Click to Sort" }));
  $newHeader.append($sortButton);
  $header.children().filter('tr').append($newHeader);
}

var makeRequestItemCells = function ($rows) {
  $rows.children('tr').each(function (i, row) {
    $J(row).find('.asyncFieldSD_ITEM_STATUS').ajaxComplete(function () {
      var callNumber = $J(row).find('.detailItemsTable_CALLNUMBER').text().replace(/\n/g, '');
      var curLocation = $J(row).find('.asyncFieldSD_ITEM_STATUS').first().text().replace(/\n/g, '');
      var matType = $J(row).find('.detailItemsTable_ITYPE').text().replace(/\n/g, '')
      var itemType = $J(row).find('.detailItemsTable_ITYPE').text().replace(/\n/g, '');
      var libz = $J(row).find('.asyncFieldLIBRARY').not('.hidden');
      var library = libz.text().replace(/\n/g, '');
      var fakeCheckout = isFakeCheckout(callNumber, curLocation, matType);
      var elecAccessLink = hasElecAccess(row, callNumber);
      if (elecAccessLink && elecAccessLink.length) {
        makeElecAccess(row, elecAccessLink);
        removeCallNumAccessthisitem(row);
      } else if (fakeCheckout === true) {
        makeFakeAvailable(row);
      } else {
        if (library == 'Special Collections') {
          var url = buildAeonRequest(callNumber, curLocation, itemType, library);
        } else {
          var url = buildIlliadRequest(callNumber);
        }
        replaceOrCreate(row, url);
      };
    })
  })
}

var hasElecAccess = function (row, callNumber) {
  var link = $J('.ELECTRONIC_ACCESS_label').siblings('a:first').attr('href');
  var is_actionable = (callNumber.indexOf('AVAILABLE ONLINE') > -1) || (callNumber.indexOf('VETERINARY MEDICINE LIBRARY') > -1) || (callNumber.indexOf('AUTO') > -1);
  if (link && is_actionable) {
    return link;
  }
  return false;
}

var makeElecAccess = function (row, link) {
  console.log(link);
  $elem = $J('<td>', { class: "detailItemsTable_SD_ITEM_HOLD_LINK" })
    .append($J('<div>', { class: "asyncFieldSD_ITEM_HOLD_LINK" })
      .append($J('<a>', { href: link, class: 'RequestLinkUrl', text: 'Access Online' })));
  $existingElem = $J(row).find('.detailItemsTable_SD_ITEM_HOLD_LINK .asyncFieldSD_ITEM_HOLD_LINK a');
  if ($existingElem.length) {
    $existingElem.attr('href', link.attr('href'));  // replace
  } else {
    row.append($elem[0]);  //create
  }
}

var removeCallNumAccessthisitem = function (row) {
  $J(row).find('.detailItemsTable_CALLNUMBER a').remove()
}

var isFakeCheckout = function (callNumber, curLocation, matType) {
  // libraries are using checkout to move items to reserves
  // instead of creating new locations like "Reserves".
  // These 'callNumbers' items are actually probably
  // in the library, so we hack them to report "Available"
  // They lost the ability to track items checked out from
  // reserve locations, so we have to pretend the item
  // is probably present in the reserve location with this hack.
  if (callNumber == 'WHITE RESV.') {
    return true;
  }
  if (matType == 'Reference Material') {
    return true;
  }
  if (matType == 'Permanent Reserve') {
    return true;
  }
  if (curLocation.indexOf('Middleton Library Reserve Desk') > -1) {
    return true;
  }
  return false;
}

var makeFakeAvailable = function (row) {
  $elem = $J('<td>', { class: "detailItemsTable_SD_ITEM_HOLD_LINK" })
    .append($J('<div>', { class: "asyncFieldSD_ITEM_HOLD_LINK", text: "Ask the Reserve Desk" }));
  $existingElem = $J(row).find('.detailItemsTable_SD_ITEM_HOLD_LINK .asyncFieldSD_ITEM_HOLD_LINK');
  if ($existingElem.length) {
    $existingElem.text("Ask the Reserve Desk");  // replace
  } else {
    row.append($elem[0]);  //create
  }
}

var replaceOrCreate = function (row, url) {
  $elem = $J('<td>', { class: "detailItemsTable_SD_ITEM_HOLD_LINK" })
    .append($J('<div>', { class: "asyncFieldSD_ITEM_HOLD_LINK" })
      .append($J('<a>', { href: url, class: 'RequestLinkUrl', text: 'Request Item' })));
  $existingElem = $J(row).find('.detailItemsTable_SD_ITEM_HOLD_LINK .asyncFieldSD_ITEM_HOLD_LINK a');
  if ($existingElem.length) {
    $existingElem.attr('href', url);  // replace
  } else {
    row.append($elem[0]);  //create
  }
}

var buildIlliadRequest = function (callNumber) {
  var oslFormat = $J('#detail0_FORMAT .FORMAT_value').text();
  var oslTitle = $J('.TITLE_MAIN').not('.TITLE_MAIN_label').first().text().slice(0, 750);
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
  var illiadUrl = encodeURI('https://louis.hosts.atlas-sys.com/remoteauth/LUU/illiad.dll?Action=10&Form=30&sid=CATALOG&genre=' + requestType + '&title=' + oslTitle + '++[owned+by+LSU+' + oslRecordID + ']&ISBN=' + oslISXN + '&aulast=' + oslAuthorLastName + '&date=' + oslPubDate + '&rft.pub=' + oslPublisher + '&rft.place=' + oslPubPlace + '&Notes=' + callNumber + '&CallNumber' + 'testingtesting');
  return illiadUrl;
}

var buildAeonRequest = function (callNumber, curLocation, itemType, library) {
  var SPEC_COLL = 'Special Collections';
  var ALT_SPEC_COLL = 'Special Collections, Hill Memorial Library';
  var REMOTE = 'LLMVC - Remote Storage';
  var REQUEST_MATERIAL = 'Request Item';
  var itemTitle = $J('.TITLE_MAIN').not('.TITLE_MAIN_label').first().text().slice(0, 750);
  var itemAuthor = $J('#detail0_INITIAL_AUTHOR_SRCH .INITIAL_AUTHOR_SRCH_value').text();
  var itemPubDate = $J('#detail0_PUBDATE_RANGE .PUBDATE_RANGE_value').text();
  var itemPub = $J('#detail0_PUBLISHER .PUBLISHER_value').first().text();
  var itemPlace = $J('#detail0_PUBLICATION_INFO .PUBLICATION_INFO_value').first().text().split(':')[0];
  var itemRefnum = $J('#detail0_DOC_ID .DOC_ID_value').text().split(':')[1];
  var itemEdition = $J('#detail0_EDITION .EDITION_value').text();
  var itemInfo1 = $J('#detail0_ACCESSRESTRICTIONS .ACCESSRESTRICTIONS_value').text();
  var requestType;
  if (curLocation == REMOTE) {
    requestType = 'GenericRequestAllIronMountain';
  } else {
    requestType = 'GenericRequestAll';
  };
  var aeonUrl = encodeURI('https://specialcollections.lib.lsu.edu/Logon/?Action=10&Form=20' + '&Value=' + requestType + '&ReferenceNumber=' + itemRefnum + '&DocumentType=' + itemType + '&ItemTitle=' + itemTitle + '&ItemAuthor=' + itemAuthor + '&ItemEdition=' + itemEdition + '&CallNumber=' + callNumber + '&ItemPublisher=' + itemPub + '&ItemDate=' + itemPubDate + '&Location=' + curLocation + '&ItemPlace=' + itemPlace + '&ItemInfo1=' + itemInfo1);
  return aeonUrl;
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

var replaceGovDocsLabel = function () {
  $J('div.LIBRARY:contains(" Government Documents/Microforms")').text("Government Documents - (Currently Closed to Public - See Access Services)");
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

var changeAvailableAfterSpinner = function () {
  if ($J('.smallSpinner').length == 0) {
    changeAvailableToZero();
    changeAvailableIfWhiteResv();
    clearInterval(schedulechangeAvailableAfterSpinner);
  }
}

var changeAvailableToZero = function () {
  $J('.availableNumber').each(function (i, elem) {
    if ($J(elem).text() == '0') {
      $J(elem.previous()).text('Currently Checked Out');
      $J(elem).text('');
    }
  })
}

var changeAvailableIfWhiteResv = function () {
  $J('.results_bio .thumb_hidden .displayElementText.CALLNUMBER').each(function (i, elem) {
    if ($J(elem).text().trim() == 'WHITE RESV.') {
      $J(elem).closest('.results_bio').find('.availableLabel').text('Available: 1');
    }
  })
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
