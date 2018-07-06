$J(document).ready(function() {
  doGenericTasks();
  if ($J('.detail_main').length) {
    doDetailViewTasks();
  } else if ($J('.searchView').length) {
    doResultsViewTasks();
  } else if ($J('.customAdvancedSearch').length) {
    doAdvancedSearchViewTasks();
  }
});

var doGenericTasks = function() {
  customSearchLink();    
}

var doDetailViewTasks = function() {
  detailViewIconReplace();
  changeToAccessThisItem();
  hideMissingDetailBookImage()
  ILLIfCheckedOut();
  createCitationButton();
  prepOpenAccordions();
}

var doResultsViewTasks = function() {
  changeToAccessThisItem();
  resultsViewIconReplace();    
}

var doAdvancedSearchViewTasks = function() {
  hideBasicSearch();    
}

/*
Starting custom functions.
*/

var createCitationButton = function() {
  var oclcNUM = $J('#detail0_OCLC .OCLC_value').text();
  var oclcISBN = $J('#detail0_ISBN .ISBN_value').text();
  var oclcISSN = $J('#detail0_ISSN .ISSN_value').text();
  if (oclcNUM || oclcISBN || oclcISSN) {
    var newButton = $J('<input>', {'class': 'button', title: 'Citation', value: 'Citation', type: 'button'})
      .click(function() {
        citationPopup(oclcNUM, oclcISBN, oclcISSN);
        });
    var newDiv = $J('<div>', {id: 'CitationButton'});
    $J('#detailActionsdetail0').append(newDiv.append(newButton));
  }
}

var citationPopup = function(oclcNUM, oclcISBN, oclcISSN) {
  if (oclcNUM != '') {
    var myURL = 'http://www.worldcat.org/oclc/'+ oclcNUM + '?page=citation';
  } else if (oclcISBN != '') {
    oclcISBN2 = oclcISBN.substr(0,13);
    var myURL = 'http://www.worldcat.org/isbn/'+ oclcISBN2 + '?page=citation';
  } else if (oclcISSN != '') {
    oclcISSN2 = oclcISSN.substr(0,8);
    var myURL = 'http://www.worldcat.org/issn/'+ oclcISSN2 + '?page=citation';
  }
  window.open("" + myURL, "mywindow", "location=1,scrollbars=1,resizable=1,width=800, height=400");
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
  var illiadNode = $J('<div>', {class: 'illiadLink'}).appendTo(dueElem);
  var illiadHref = $J('<a>', {href: illiadUrl, class: 'illiadLinkUrl', text: 'Request Interlibrary Loan'}).appendTo(illiadNode);
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
  var illiadUrl = encodeURI('https://louis.hosts.atlas-sys.com/illiad/LUU/illiad.dll?Action=10&Form=30&sid=CATALOG&genre=' + requestType + '&title=' + oslTitle + '++[owned+by+LSU+' + oslRecordID + ']&ISBN=' + oslISXN + '&aulast=' + oslAuthorLastName + '&date=' + oslPubDate + '&rft.pub=' + oslPublisher + '&rft.place=' + oslPubPlace);
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

var searchViewIconReplace = function() {
  var format_containerDiv = document.getElementsByClassName('format_container');
  for (var i = 0; i < format_containerDiv.length; i++) {
    var formatTypeDiv = format_containerDiv[i].firstElementChild;
    var iconText = formatTypeDiv.getAttribute('title');
    formatTypeDiv.textContent = iconText;
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
      .attr("href", "https://lsu.ent.sirsi.net/client/en_US/lsu/?rm=ADVANCED+SEARCH0%7C%7C%7C1%7C%7C%7C0%7C%7C%7Ctrue");
}

var changeToAccessThisItem = function() {
  $J('a')
     .each( function(i, elem) {
       if ($J(elem).text() == $J(elem).attr('href')) {
         $J(elem).text('Access This Item');
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
    mutationObserver.observe($J('#detailCover0').get(0), {attributes: true});
  }
}


var prepOpenAccordions = function() {
  setTimeout("openAccordions();",200);
}

var openAccordions = function() {
  $J('h3.ui-accordion-header').each(function(i, elem){
    $J(elem)
       .removeClass("ui-corner-all")
       .addClass("ui-corner-top")
       .attr("aria-expanded", "true")
       .attr("aria-selected", "true")
       .find('span.ui-icon')
           .removeClass("ui-icon-triangle-1-e")
           .addClass("ui-icon-triangle-1-s");
  });
  $J('div.ui-accordion-content').each(function(i, elem){
    $J(elem)
       .css("visibility", "visible")
       .css("display", "block");
  });
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