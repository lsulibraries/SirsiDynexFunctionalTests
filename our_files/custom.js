var BASEWSURL = "https://lalutest.sirsi.net/lalu_ilsws/";
var CLIENTID = "DS_CLIENT";

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

$J(document).ready(function() {
  doGenericTasks();
  if ($J(".detail_main").length) {
    doDetailViewTasks();
  } else if ($J(".searchView").length) {
    doResultsViewTasks();
  } else if ($J(".customAdvancedSearch").length) {
    doAdvancedSearchViewTasks();
  } else if ($J("#myAccount").length) {
    doAccountPageTasks();
  } else if (jQuery(".framedPage").length) {
    //pass
  }
});

jQuery(document).ready(function() {
  if (window.location.href.indexOf("lsu.ent.sirsi.net") > -1) {
    jQuery("#frame_content").removeAttr("seamless");
    jQuery("#frame_content").attr("scrolling", "yes");
  }
});

var doGenericTasks = function() {
  customSearchLink();
};

var doDetailViewTasks = function() {
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
  replaceDetailGovDocsLabel();
  makePrecedingSucceedingLinks();
  deVSeriesLink();
  // ITEM_STATUS tasks
  ILLIfCheckedOut();
  renameDueStatus();
  // ITEM_HOLD_LINK tasks
  aeonRequest();
  elecAccessIfUnavailable();
  deUnavailablePermReserve();
  DetaildeUnavailableWhiteReserve();
  deUnavailableReferenceMaterial();
  deUnavailableReserveDesk();
};

var scheduleConvertResultsStackMapToLink;
var schedulechangeAvailableAfterSpinner;

var doResultsViewTasks = function() {
  friendlyizeNoResults();
  resultsChangeToAccessThisItem();
  resultsViewIconReplace();
  classifyElecAccessLinks();
  replaceGovDocsLabel();
  scheduleConvertResultsStackMapToLink = setInterval(
    convertResultsStackMapToLink,
    300
  );
  schedulechangeAvailableAfterSpinner = setInterval(
    changeAvailableAfterSpinner,
    300
  );
};

var doAdvancedSearchViewTasks = function() {
  hideBasicSearch();
};

var doAccountPageTasks = function() {
  changeSMSText();
  changeSMSPopupLabel();
  changeSMSPopupTitle();
};

// Generic Tasks
var customSearchLink = function() {
  $J("#searchBoxAdvancedLink a")
    .attr(
      "href",
      "https://lsu.ent.sirsi.net/client/en_US/lsu/?rm=MORE+SEARCH+OP0|||1|||0|||true"
    )
    .text("More Search Options");
};

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
var detailViewIconReplace = function() {
  var format_containerDiv = document.getElementsByClassName("format_container");
  var iconTexts = Array();
  for (var i = 0; i < format_containerDiv.length; i++) {
    var formatTypeDiv = format_containerDiv[i].firstElementChild;
    var iconText = formatTypeDiv.getAttribute("title");
    if (iconText && iconText != "Other") {
      iconTexts.push(iconText);
    }
    formatTypeDiv.textContent = "";
    if (i == format_containerDiv.length - 1) {
      var iconString = iconTexts.join(", ");
      format_containerDiv[0].firstElementChild.textContent = iconString;
    }
  }
};

var createCitationButton = function() {
  // shortcircuit if "Cite As" field in object body
  if ($J(".PREFCITE524").length) {
    return;
  }

  var oclcNUM, oclcISBN, oclcISSN;

  $J("#detail0_OCLC .OCLC_value").each(function() {
    var oclc_value = $J(this)
      .text()
      .replace("(OCoLC)", "");
    if (oclc_value.length && !isNaN(oclc_value)) {
      oclcNUM = oclc_value;
      return false;
    }
  });
  $J("#detail0_ISBN .ISBN_value").each(function() {
    var isbn_value = $J(this).text();
    if (isbn_value.length) {
      oclcISBN = isbn_value;
      return false;
    }
  });
  $J("#detail0_ISSN .ISSN_value").each(function() {
    var issn_value = $J(this).text();
    if (issn_value.length) {
      oclcISSN = issn_value;
      return false;
    }
  });

  if (oclcNUM || oclcISBN || oclcISSN) {
    var newButton = $J("<input>", {
      class: "button",
      title: "Citation",
      value: "Citation",
      type: "button"
    }).click(function() {
      citationPopup(oclcNUM, oclcISBN, oclcISSN);
    });
    var newDiv = $J("<div>", { id: "CitationButton" });
    $J("#detailActionsdetail0").append(newDiv.append(newButton));
  }
};

var citationPopup = function(oclcNUM, oclcISBN, oclcISSN) {
  if (oclcNUM != "") {
    var myURL = "http://www.worldcat.org/oclc/" + oclcNUM + "?page=citation";
  } else if (oclcISBN != "") {
    oclcISBN2 = oclcISBN.substr(0, 13);
    var myURL = "http://www.worldcat.org/isbn/" + oclcISBN2 + "?page=citation";
  } else if (oclcISSN != "") {
    oclcISSN2 = oclcISSN.substr(0, 8);
    var myURL = "http://www.worldcat.org/issn/" + oclcISSN2 + "?page=citation";
  }
  window.open(
    "" + myURL,
    "mywindow",
    "location=1,scrollbars=1,resizable=1,width=800, height=400"
  );
};

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
var hideMissingDetailBookImage = function() {
  /* this function sets all detail cover art images hidden.
     then, when the anonymous function in Enterprise reassigns the image src
     an event listen is here in place to observe a change.
     A changed image_cover_art is then set to display.
  */
  if ($J('.detail_cover_art[src*="no_image.png"]').length) {
    $J(".detail_cover_art")
      .parent()
      .css("display", "none");
    $J(".detail_biblio").css("width", "550px");
    var mutationObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (
          mutation.type == "attributes" &&
          mutation.target.className == "detail_cover_art"
        ) {
          mutationObserver.disconnect();
          $J(".detail_cover_art")
            .parent()
            .css("display", "");
          $J(".detail_biblio").css("width", "");
        }
      });
    });
    mutationObserver.observe($J("#detailCover0").get(0), { attributes: true });
  }
};

var prepOpenAccordions = function() {
  setTimeout("openAccordions();", 300);
};

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

Mobile Incoming Markup:
  <h3 class="detailAccordionHeader 
              items 
              result0 
              ui-accordion-header 
              nm-bgcolor-p5 
              nm-bgcolor-ada 
              ui-state-default 
              ui-corner-top 
              ui-accordion-header-collapsed 
              ui-corner-all" 
      role="tab" 
      id="ui-id-1" 
      aria-controls="detailItemsDiv0" 
      aria-selected="false" 
      aria-expanded="false" 
      tabindex="-1">
        <i class="fa fa-caret-right"></i>
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
              ui-widget-content" 
    id="detailItemsDiv0" 
    aria-labelledby="ui-id-1" 
    role="tabpanel" 
    aria-hidden="true" 
    style="display: none; visibility: visible;"
    >
    ...
</div>

Mobile Outgoing Markup:
  <h3 class="detailAccordionHeader 
            items 
            result0 
            ui-accordion-header 
            nm-bgcolor-p5 
            nm-bgcolor-ada 
            ui-state-default 
            ui-corner-top 
            ui-state-hover 
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
              text-p 
              ui-helper-reset 
              ui-widget-content 
              ui-accordion-content-active" 
        id="detailItemsDiv0" 
        aria-labelledby="ui-id-1" 
        role="tabpanel" 
        aria-hidden="false" 
        style="display: block; visibility: visible;"
      > 
      ...
  </div>
*/
var openAccordions = function() {
  $J("h3.ui-accordion-header").each(function(i, elem) {
    $J(elem)
      .removeClass("ui-corner-all")
      .addClass("ui-corner-top")
      .removeClass("ui-accordion-header-collapsed")
      .addClass("ui-accordion-header-active")
      .attr("aria-expanded", "true")
      .attr("aria-selected", "true");

    $J(elem)
      .find("i.fa")
      .removeClass("fa-caret-right")
      .addClass("fa-caret-down");

    $J(elem)
      .find("span.ui-icon")
      .removeClass("ui-icon-triangle-1-e")
      .addClass("ui-icon-triangle-1-s");
  });
  $J("div.ui-accordion-content").each(function(i, elem) {
    $J(elem)
      .addClass("ui-accordion-content-active")
      .attr("aria-hidden", "false")
      .css("visibility", "visible")
      .css("display", "block");
  });
};

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
var detailChangeToAccessThisItem = function() {
  $J(".ELECTRONIC_ACCESS_label")
    .siblings()
    .each(function(i, elem) {
      if (
        $J(elem).attr("href") &&
        $J(elem)
          .attr("href")
          .includes($J(elem).text())
      ) {
        $J(elem).text("Access This Item");
        $J(elem).addClass("detail_access_link");
      }
    });
};
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
var replaceAvailableStatus = function() {
  $J(".detailItemTable_th:contains('Status')").text("Current Location");
};

/*
Purpose: Renames item  Note Column Header
Example URL: ???

Desktop Incoming Markup: TBD
Desktop Outgoing Markup: TBD
Mobile Incoming Markup: TBD
Mobile Outgoing Markup: TBD

// Is this needed? Potentially remove
*/
var renameItemNoteColumn = function() {
  $J("thead tr .detailItemsTable_ITEMNOTE .detailItemTable_th").text(
    "Item Note"
  );
};

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
Mobile Incoming Markup: 
<div class="detailItems ">
  <div class="detailItemTable borderSection bcolor-s4 bcolor" id="detailItemTabledetailItemsDiv00">
    <div class="detailChildRecord border-v" id="childRecorddetailItemsDiv00_0">
      ...
      <div class="detailChildField field">
        <div class="detailChildFieldLabel label text-h5 detailItemsTable_SD_ITEM_HOLD_LINK">Item Holds</div>
      </div>
    </div>
  </div>
</div>

Mobile Outgoing Markup: TBD
*/
var renameItemHoldsColumn = function() {
  $J('.detailItemTable_th:contains("Item Holds")')
    .add(".detailItems .detailItemsTable_SD_ITEM_HOLD_LINK.label")
    .text("Request Item");
  changeNamesAfterAjaxComplete();
};

var changeNamesAfterAjaxComplete = function() {
  $J(document).bind("ajaxComplete", function() {
    $J(".asyncFieldSD_ITEM_HOLD_LINK").each(function(iter, elem) {
      var childDiv = $J(elem).children(":first-child");
      if ($J(childDiv).text() == "Reserve This Copy") {
        $J(childDiv).text("Place Hold");
      }
    });
  });
};

/*
Purpose: Wording change
Example URL: ???

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
var replaceCallNumChildwithCallNum = function() {
  $J('.detailItemTable_th:contains("Call Number (Child)")').text("Call Number");
};

/*
Purpose: Adds link to page if available online
Example URL: https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:2795182/ada?qu=hello+again
Test: test_detail_page.py > test_linkAvailableOnlineCallNumber

Desktop Incoming Markup:
  <div class="displayElementWrapper">
    <div class="displayElementLabel text-h5 ELECTRONIC_ACCESS ELECTRONIC_ACCESS_label">
      Electronic Access:
    </div> 
    <a target="_blank" href="https://utils.louislibraries.org/cgi-bin/lz0050.x?sitecode=LALUelib?http://libezp.lib.lsu.edu/login?url=http://LSU.NaxosMusicLibrary.com/streamcat.asp?s=98938%2fLSUNML01&amp;item%5Fcode=8.880030?catkey=2795182" class="detail_access_link">Access This Item</a>
  </div>
  ...
  <div class="detailItems ">
    <table class="detailItemTable sortable0 sortable">
      ...
      <tbody>
        <tr class="detailItemsTableRow ">
          ...  
          <td class="detailItemsTable_CALLNUMBER">
            AVAILABLE ONLINE
          </td>
          OR
          <td class="detailItemsTable_CALLNUMBER">
            VETERINARY MEDICINE LIBRARY
          </td>

          ...
        </tr>
      </tbody>
      ...
    </table>
  </div>


Desktop Outgoing Markup:
  <div class="displayElementWrapper">
    <div class="displayElementLabel text-h5 ELECTRONIC_ACCESS ELECTRONIC_ACCESS_label">
      Electronic Access:
    </div> 
    <a target="_blank" href="https://utils.louislibraries.org/cgi-bin/lz0050.x?sitecode=LALUelib?http://libezp.lib.lsu.edu/login?url=http://LSU.NaxosMusicLibrary.com/streamcat.asp?s=98938%2fLSUNML01&amp;item%5Fcode=8.880030?catkey=2795182" class="detail_access_link">Access This Item</a>
  </div>
  ...
  <div class="detailItems ">
    <table class="detailItemTable sortable0 sortable">
      <tbody>
        <tr class="detailItemsTableRow  sm-checked">
          ...  
          <td class="detailItemsTable_CALLNUMBER">
            <div>
              <p>Available Online</p>
              <a title="Access this item" href="https://utils.louislibraries.org/cgi-bin/lz0050.x?sitecode=LALUelib?http://libezp.lib.lsu.edu/login?url=http://LSU.NaxosMusicLibrary.com/streamcat.asp?s=98938%2fLSUNML01&amp;item%5Fcode=8.880030?catkey=2795182">Access this item</a>
            </div>
          </td>
          ...
        </tr>
      </tbody>
      ...
    </table>
  </div>

Mobile Incoming Markup: 
  <div class="displayElementWrapper">
    <div class="displayElementLabel text-h5 ELECTRONIC_ACCESS ELECTRONIC_ACCESS_label">
      Electronic Access:
    </div>
    <a target="_blank" href="http://libezp.lib.lsu.edu/login?url=http://LSU.NaxosMusicLibrary.com/streamcat.asp?s=98938%2fLSUNML01&amp;item%5Fcode=8.880030" class="detail_access_link">Access This Item</a>
  </div>
  ...
  <div class="detailChildField field">
    <div class="detailChildFieldLabel label text-h5 detailItemsTable_CALLNUMBER">
      Call Number
    </div>
    <div class="detailChildFieldValue fieldValue text-p detailItemsTable_CALLNUMBER">
      AVAILABLE ONLINE 
    </div>
    OR
    <div class="detailChildFieldValue fieldValue text-p detailItemsTable_CALLNUMBER">
      VETERINARY MEDICINE LIBRARY
    </div>
  </div>

Mobile Outgoing Markup: 
  <div class="displayElementWrapper">
    <div class="displayElementLabel text-h5 ELECTRONIC_ACCESS ELECTRONIC_ACCESS_label">
      Electronic Access:
    </div>
    <a target="_blank" href="http://libezp.lib.lsu.edu/login?url=http://LSU.NaxosMusicLibrary.com/streamcat.asp?s=98938%2fLSUNML01&amp;item%5Fcode=8.880030" class="detail_access_link">Access This Item</a>
  </div>
  ...
  <div class="detailChildField field">
    <div class="detailChildFieldLabel label text-h5 detailItemsTable_CALLNUMBER">
      Call Number
    </div>
    <div class="detailChildFieldValue fieldValue text-p detailItemsTable_CALLNUMBER">
      AVAILABLE ONLINE
    </div>
  </div>
*/
var linkAvailableOnlineCallNumber = function() {
  hrefElectronicAccess = $J(".ELECTRONIC_ACCESS_label")
    .siblings("a:first")
    .attr("href");
  if (!hrefElectronicAccess) {
    return;
  }
  $J('.detailItemsTable_CALLNUMBER:contains("AVAILABLE ONLINE")')
    .add('.detailItemsTable_CALLNUMBER:contains("VETERINARY MEDICINE LIBRARY")')
    .each(function(i, elem) {
      elem.innerHTML = "";
      new_div = $J("<div>");
      new_p = $J("<p>", { text: "Available Online" });
      new_href = $J("<a>", {
        text: "Access this item",
        title: "Access this item",
        href: hrefElectronicAccess
      });
      new_div.append(new_p);
      new_div.append(new_href);
      new_div.appendTo(elem);
    });
};

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
var replaceItemNote = function() {
  getTitleInfo();
  scheduleReplacePubNoteCells = setInterval(replacePubNoteCells, 300);
  scheduleNewBookShelf = setInterval(fixNewBookShelf, 300);
};

var getTitleInfo = function() {
  var titleID = $J("#" + "detail0" + "_DOC_ID .DOC_ID_value")
    .text()
    .split(":")[1];
  var titleInfoWsURL =
    BASEWSURL +
    "rest/standard/lookupTitleInfo?clientID=" +
    CLIENTID +
    "&titleID=" +
    titleID +
    "&includeItemInfo=true&json=true";
  $J.ajax({
    dataType: "json",
    url: titleInfoWsURL,
    success: function(data) {
      titleInfoDict = parseTitleInfo(data);
    }
  });
};

var parseTitleInfo = function(data) {
  var interestingData = {};
  var CallInfo = data["TitleInfo"][0]["CallInfo"];
  for (var i = 0; i < CallInfo.length; i++) {
    var callNumber = CallInfo[i]["callNumber"];
    interestingData[callNumber] = {};
    interestingData[callNumber]["libraryID"] = CallInfo[i]["libraryID"];
    interestingData[callNumber]["numberOfCopies"] =
      CallInfo[i]["numberOfCopies"];
    interestingData[callNumber]["callNumber"] = CallInfo[i]["callNumber"];
    interestingData[callNumber]["itemTypeID"] =
      CallInfo[i]["ItemInfo"][0]["itemTypeID"];
    interestingData[callNumber]["currentLocationID"] =
      CallInfo[i]["ItemInfo"][0]["currentLocationID"];
    interestingData[callNumber]["publicNote"] =
      CallInfo[i]["ItemInfo"][0]["publicNote"];
    interestingData[callNumber]["dueDate"] = parseDueDate(
      CallInfo[i]["ItemInfo"][0]["dueDate"]
    );
  }
  return interestingData;
};

var parseDueDate = function(reportedDate) {
  if (reportedDate) {
    var epochDue = new Date(reportedDate);
    var dueDate =
      epochDue.getMonth() +
      1 +
      "/" +
      epochDue.getDate() +
      "/" +
      epochDue.getFullYear();
  } else {
    var dueDate = "";
  }
  return dueDate;
};

var replacePubNoteCells = function() {
  if (
    Object.keys(titleInfoDict).length &&
    titleInfoDict.constructor === Object
  ) {
    var hasValues = false;
    //  loop through the Available Table rows & replace PublicNote cell text
    $J("tr.detailItemsTableRow").each(function(index, elem) {
      var isAvailTable = $J(elem).closest("#detailItemsDiv0").length;
      if (!isAvailTable) {
        return;
      }
      var callNoElem = $J(elem).find(".detailItemsTable_CALLNUMBER");
      if (callNoElem.length) {
        var callNo = $J(callNoElem)
          .text()
          .trim();
      } else {
        var callNo = "";
      }
      var correctItemDict = titleInfoDict[callNo];
      if (correctItemDict === undefined) {
        return;
      }
      if (Object.keys(correctItemDict).length) {
        var correctItemPubNote = correctItemDict["publicNote"] || "";
        // check if any elems have any value for this key, else we later delete the whole column.
        if (correctItemPubNote) {
          hasValues = true;
        }
      } else {
        var correctItemPubNote = "";
      }
      var currentPubNote = $J(elem).find(".detailItemsTable_ITEMNOTE");
      currentPubNote.text(correctItemPubNote);
    });
    if (!hasValues) {
      $J(".detailItemsTable_ITEMNOTE").remove();
    }
    clearInterval(scheduleReplacePubNoteCells);
  }
};

var fixNewBookShelf = function() {
  if (
    Object.keys(titleInfoDict).length &&
    titleInfoDict.constructor === Object
  ) {
    //  loop through the Available Table rows & replace PublicNote cell text
    $J("tr.detailItemsTableRow").each(function(index, elem) {
      var isAvailTable = $J(elem).closest("#detailItemsDiv0").length;
      if (!isAvailTable) {
        return;
      }
      var callNoElem = $J(elem).find(".detailItemsTable_CALLNUMBER");
      if (callNoElem.length) {
        var callNo = $J(callNoElem)
          .text()
          .trim();
      } else {
        var callNo = "";
      }
      var correctItemDict = titleInfoDict[callNo];
      if (correctItemDict === undefined) {
        return;
      }
      if (Object.keys(correctItemDict).length) {
        var correctLocation = correctItemDict["currentLocationID"];
        // check if any elems have any value for this key, else we later delete the whole column.
        if (correctLocation == "NEWBOOKS") {
          var locationCell = $J(elem)
            .closest("tr")
            .find(".detailItemsTable_SD_ITEM_STATUS");
          locationCell.empty().text("New Books Display");
          var holdsCell = $J(elem)
            .closest("tr")
            .find(".asyncFieldSD_ITEM_HOLD_LINK")
            .not(".hidden");
          holdsCell.empty().text("Available");
          clearInterval(scheduleNewBookShelf);
        }
      }
    });
    clearInterval(scheduleNewBookShelf);
  }
};

/*
  End Title Info Update methods
*/

/*
Purpose: Updates location text for Government Docs on detail page
Example URL: https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:1237088/one
Test: None

Desktop Incoming Markup: 
  <div class="detailItems ">
    <table class="detailItemTable sortable0 sortable" id="detailItemTable0">
    ...
      <tbody>
        <tr class="detailItemsTableRow ">
          <td class="detailItemsTable_LIBRARY">
            {ON LOAD}<div class="asyncFieldLIBRARY asyncInProgressLIBRARY" id="asyncFielddetailItemsDiv0LIBRARY31518024900072">Searching...</div>
            {AFTER AJAX}<div class="asyncFieldLIBRARY" id="asyncFielddetailItemsDiv0LIBRARY31518024900072">Government Documents/Microforms</div>
            <div class="asyncFieldLIBRARY hidden" id="asyncFieldDefaultdetailItemsDiv0LIBRARY31518024900072">Government Documents/Microforms</div>
          </td>
          ...
        </tr>
      </tbody>
    ...
    </table>
  </div>


  <div class="detailItems ">
    <table class="detailItemTable sortable0 sortable">
      ...
      <tbody>
        <tr class="detailItemsTableRow ">
          <td class="detailItemsTable_LIBRARY">
            {ON LOAD}<div class="asyncFieldLIBRARY asyncInProgressLIBRARY" id="asyncFielddetailItemsDiv0LIBRARY31518024900072">Searching...</div>
            {AFTER AJAX}<div class="asyncFieldLIBRARY" id="asyncFielddetailItemsDiv0LIBRARY31518024900072">Government Documents/Microforms</div>
            <div class="asyncFieldLIBRARY hidden" id="asyncFieldDefaultdetailItemsDiv0LIBRARY31518024900072">Government Documents/Microforms</div>
          </td>
          ...
        </tr>
      </tbody>
    ...
    </table>


Desktop Outgoing Markup: 
  <div class="detailItems ">
    <table class="detailItemTable sortable0 sortable" id="detailItemTable0">
    ...
      <tbody>
        <tr class="detailItemsTableRow ">
          <td class="detailItemsTable_LIBRARY">
            <div class="asyncFieldLIBRARY" id="asyncFielddetailItemsDiv0LIBRARY31518025086939">Government Documents - (Currently Closed to Public - See Access Services)</div>
            <div class="asyncFieldLIBRARY hidden" id="asyncFieldDefaultdetailItemsDiv0LIBRARY31518025086939">Government Documents - (Currently Closed to Public - See Access Services)</div>
          </td>
          ...
        </tr>
      </tbody>
    ...
    </table>
  </div>

Mobile Incoming Markup:
  <div class="detailItems ">
    <div class="detailItemTable borderSection bcolor-s4 bcolor" id="detailItemTabledetailItemsDiv00">
      <div class="detailChildRecord border-v" id="childRecorddetailItemsDiv00_0">
        <div class="detailChildField field">
          <div class="detailChildFieldLabel label text-h5 detailItemsTable_LIBRARY">Library</div>
          <div class="detailChildFieldValue fieldValue text-p detailItemsTable_LIBRARY">
            <div class="asyncFieldLIBRARY asyncInProgressLIBRARY" id="asyncFielddetailItemsDiv0LIBRARY31518024900072">Searching...</div>
            <div class="asyncFieldLIBRARY hidden" id="asyncFieldDefaultdetailItemsDiv0LIBRARY31518024900072">Government Documents/Microforms</div>
          </div>
        </div>
        ...
        </div>
      </div>
      ...
    </div>
  </div>

Mobile Outgoing Markup: 
  <div class="detailItems ">
    <div class="detailItemTable borderSection bcolor-s4 bcolor" id="detailItemTabledetailItemsDiv00">
      <div class="detailChildRecord border-v" id="childRecorddetailItemsDiv00_0">
        <div class="detailChildField field">
          <div class="detailChildFieldLabel label text-h5 detailItemsTable_LIBRARY">Library</div>
          <div class="detailChildFieldValue fieldValue text-p detailItemsTable_LIBRARY">
            <div class="asyncFieldLIBRARY" id="asyncFielddetailItemsDiv0LIBRARY31518024900072">Government Documents - (Currently Closed to Public - See Access Services)</div>
            <div class="asyncFieldLIBRARY hidden" id="asyncFieldDefaultdetailItemsDiv0LIBRARY31518024900072">Government Documents - (Currently Closed to Public - See Access Services)</div>
          </div>
        </div>
        ...
        </div>
      </div>
      ...
    </div>
  </div>
*/
var replaceDetailGovDocsLabel = function() {
  $J(document).ajaxComplete(function() {
    $J('.asyncFieldLIBRARY:contains("Government Documents/Microforms")').text(
      "Government Documents - (Currently Closed to Public - See Access Services)"
    );
  });
};

var makePrecedingSucceedingLinks = function() {
  var succeedingEntryElem = $J(".displayElementText.SUCCENTRY");
  var precedingEntryElem = $J(".displayElementText.PRECENTRY");
  replaceEntryWithLink(succeedingEntryElem);
  replaceEntryWithLink(precedingEntryElem);
};

var replaceEntryWithLink = function(entryElem) {
  var formattedText = entryElem.text().strip();
  while (formattedText.includes(" ")) {
    formattedText = formattedText.replace(" ", "+");
  }
  var entryLink = $J("<a />", {
    class: "EntryLink",
    alt: entryElem.text(),
    title: entryElem.text(),
    href:
      "/client/en_US/lsu/search/results?rt=false%7C%7C%7CUNIFORM_TITLE_LSU%7C%7C%7CUniform+Title+LSU&qu=" +
      entryElem.text().replace(" ", "+"),
    text: entryElem.text()
  });
  entryElem.text("");
  entryElem.append(entryLink);
};

var deVSeriesLink = function() {
  var origLink = $J(".displayElementText.SERIES a").attr("href");
  if (origLink && origLink.length) {
    var newLink = origLink.split("+%3B+")[0];
    $J(".displayElementText.SERIES a").attr("href", newLink);
  }
};

//Detail View Tasks -- ITEM_STATUS tasks
var ILLIfCheckedOut = function() {
  $J(".asyncFieldSD_ITEM_STATUS").ajaxComplete(function() {
    var itemStati = $J('.asyncFieldSD_ITEM_STATUS:contains("Due")');
    if (
      !itemStati.length ||
      $J('.illiadLinkUrl:contains("Request Interlibrary Loan")').length
    ) {
      return;
    }
    var illiadUrl = buildIlliadRequest();
    addLinkILL(itemStati[0].id, illiadUrl);
  });
};

var buildIlliadRequest = function() {
  var oslFormat = $J("#detail0_FORMAT .FORMAT_value").text();
  var oslTitle = $J(".TITLE_MAIN")
    .not(".TITLE_MAIN_label")
    .first()
    .text()
    .slice(0, 750);
  var oslRecordID = $J("#detail0_OCLC .OCLC_value").text();
  var oslISBN = $J("#detail0_ISBN .ISBN_value:first-child").text();
  var oslISSN = $J("#detail0_ISSN .ISSN_value").text();
  var oslAuthorLastName = $J(
    "#detail0_INITIAL_AUTHOR_SRCH .INITIAL_AUTHOR_SRCH_value"
  )
    .text()
    .split(",")[0];
  var oslPubDate = $J("#detail0_PUBDATE_RANGE .PUBDATE_RANGE_value").text();
  var oslPublisher = $J("#detail0_PUBLISHER .PUBLISHER_value").text();
  var oslPubPlace = $J("#detail0_PUBLICATION_INFO .PUBLICATION_INFO_value")
    .text()
    .split(":")[0];
  if (oslFormat == "Continuing Resources") {
    var requestType = "article";
    var oslISXN = oslISSN;
  } else {
    var requestType = "loan";
    var oslISXN = oslISBN;
  }
  var illiadUrl = encodeURI(
    "https://louis.hosts.atlas-sys.com/remoteauth/LUU/illiad.dll?Action=10&Form=30&sid=CATALOG&genre=" +
      requestType +
      "&title=" +
      oslTitle +
      "++[owned+by+LSU+" +
      oslRecordID +
      "]&ISBN=" +
      oslISXN +
      "&aulast=" +
      oslAuthorLastName +
      "&date=" +
      oslPubDate +
      "&rft.pub=" +
      oslPublisher +
      "&rft.place=" +
      oslPubPlace
  );
  return illiadUrl;
};

var addLinkILL = function(itemId, illiadUrl) {
  var dueElem = $J("#" + itemId);
  if (dueElem.siblings(".illiadLink").length) {
    return;
  }
  var illiadNode = $J("<div>", { class: "illiadLink" }).appendTo(dueElem);
  var illiadHref = $J("<a>", {
    href: illiadUrl,
    class: "illiadLinkUrl",
    text: "Request Interlibrary Loan"
  }).appendTo(illiadNode);
};

var renameDueStatus = function() {
  $J(".asyncFieldSD_ITEM_STATUS").ajaxComplete(function() {
    var itemStati = $J('.asyncFieldSD_ITEM_STATUS:contains("Due")');
    if (itemStati.length && itemStati[0].childNodes.length) {
      var newText = itemStati[0].childNodes[0].nodeValue.replace(
        "Due ",
        "Checked Out -- Due: "
      );
      itemStati[0].childNodes[0].nodeValue = newText;
    }
  });
};

//Detail View Tasks -- ITEM_HOLD_LINK tasks
/*
Purpose: Built the request item link for items in Special Collections
Example URL: https://lsu.ent.sirsi.net/client/en_US/lsu/search/detailnonmodal/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:2805471/ada?qu=gay+family
Test: test_detail_page.py -> test_aeonLink

Desktop Incoming Markup:
<div class="detailItems ">
  <table class="detailItemTable sortable0 sortable" id="detailItemTable0">
    ...
    <tbody>
      <tr class="detailItemsTableRow ">
        <td class="detailItemsTable_LIBRARY">
          <div class="asyncFieldLIBRARY" id="asyncFielddetailItemsDiv0LIBRARY2805471-1001">Special Collections</div>
          <div class="asyncFieldLIBRARY hidden" id="asyncFieldDefaultdetailItemsDiv0LIBRARY2805471-1001">Special Collections</div
        </td>
        ...
        <td class="detailItemsTable_SD_ITEM_HOLD_LINK">
          <div 
            class="asyncFieldSD_ITEM_HOLD_LINK asyncInProgressSD_ITEM_HOLD_LINK" 
            id="asyncFielddetailItemsDiv0SD_ITEM_HOLD_LINK2805471-1001">
              Unavailable
          </div>
          <div 
            class="asyncFieldSD_ITEM_HOLD_LINK hidden" 
            id="asyncFieldDefaultdetailItemsDiv0SD_ITEM_HOLD_LINK2805471-1001">
              Unavailable
          </div>
        </td>
      </tr>
      ...
    </tbody>
    ...
  </table>
</div>

Desktop Outgoing Markup:
<div class="detailItems ">
  <table class="detailItemTable sortable0 sortable" id="detailItemTable0">
    <tbody>
      <tr class="detailItemsTableRow  sm-checked">
        <td class="detailItemsTable_LIBRARY">
          <div class="asyncFieldLIBRARY" id="asyncFielddetailItemsDiv0LIBRARY2805471-1001">Special Collections</div>
          <div class="asyncFieldLIBRARY hidden" id="asyncFieldDefaultdetailItemsDiv0LIBRARY2805471-1001">Special Collections</div>
        </td>
        ...
        <td class="detailItemsTable_SD_ITEM_HOLD_LINK detailItemsAeonRequest">
          <a target="_blank" href="https://specialcollections.lib.lsu.edu/Logon/?Action=10&amp;Form=20&amp;Value=GenericRequestAll&amp;ReferenceNumber=2805471&amp;DocumentType=Archive%2FManuscript&amp;ItemTitle=Gay-Butler-Plater%20family%20papers%2C&amp;ItemAuthor=Gay%20family.&amp;ItemEdition=&amp;CallNumber=G%3A43-85&amp;ItemPublisher=&amp;ItemDate=&amp;Location=Louisiana%20and%20Lower%20Mississippi%20Valley%20Collections&amp;ItemPlace=&amp;ItemInfo1=Some%20items%20have%20been%20removed%20due%20to%20restrictions%20placed%20by%20the%20donor%20and%20are%20available%20only%20to%20predetermined%20family%20members%20until%20such%20time%20as%20the%20restrictions%20expire.%20Access%20to%20photographic%20negatives%20requires%20permission%20of%20the%20curator.">Request Item</a>
        </td>
      </tr>
      ...
    </tbody>
  </table>
</div>

Mobile Incoming Markup: 
<div class="detailItems ">
  <div class="detailItemTable borderSection bcolor-s4 bcolor" id="detailItemTabledetailItemsDiv00">
    <div class="detailChildRecord border-v" id="childRecorddetailItemsDiv00_0">
      ...
      <div class="detailChildField field">
        <div class="detailChildFieldLabel label text-h5 detailItemsTable_SD_ITEM_HOLD_LINK">Item Holds</div>
        <div class="detailChildFieldValue fieldValue text-p detailItemsTable_SD_ITEM_HOLD_LINK">
          <div 
            class="asyncFieldSD_ITEM_HOLD_LINK asyncInProgressSD_ITEM_HOLD_LINK" 
            id="asyncFielddetailItemsDiv0SD_ITEM_HOLD_LINK2805471-2001">
            Unavailable
          </div>
          <div 
            class="asyncFieldSD_ITEM_HOLD_LINK hidden" 
            id="asyncFieldDefaultdetailItemsDiv0SD_ITEM_HOLD_LINK2805471-2001">
            Unavailable
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

Mobile Outgoing Markup: 
<div class="detailItems ">
  <div class="detailItemTable borderSection bcolor-s4 bcolor" id="detailItemTabledetailItemsDiv00">
    <div class="detailChildRecord border-v" id="childRecorddetailItemsDiv00_0">
      ...
      <div class="detailChildField field">
        <div class="detailChildFieldLabel label text-h5 detailItemsTable_SD_ITEM_HOLD_LINK">Item Holds</div>
        <div class="detailChildFieldValue fieldValue text-p detailItemsTable_SD_ITEM_HOLD_LINK">
          <div 
            class="asyncFieldSD_ITEM_HOLD_LINK asyncInProgressSD_ITEM_HOLD_LINK" 
            id="asyncFielddetailItemsDiv0SD_ITEM_HOLD_LINK2805471-1001">
            <a target="_blank" href="https://specialcollections.lib.lsu.edu/Logon/?Action=10&amp;Form=20&amp;Value=GenericRequestAll&amp;ReferenceNumber=2805471&amp;DocumentType=Archive%2FManuscript&amp;ItemTitle=Gay-Butler-Plater%20family%20papers%2C&amp;ItemAuthor=Gay%20family.&amp;ItemEdition=&amp;CallNumber=G%3A43-85&amp;ItemPublisher=&amp;ItemDate=&amp;Location=Louisiana%20and%20Lower%20Mississippi%20Valley%20Collections&amp;ItemPlace=&amp;ItemInfo1=Some%20items%20have%20been%20removed%20due%20to%20restrictions%20placed%20by%20the%20donor%20and%20are%20available%20only%20to%20predetermined%20family%20members%20until%20such%20time%20as%20the%20restrictions%20expire.%20Access%20to%20photographic%20negatives%20requires%20permission%20of%20the%20curator.">
              Request Item
            </a>
          </div>
          <div 
            class="asyncFieldSD_ITEM_HOLD_LINK hidden" 
            id="asyncFieldDefaultdetailItemsDiv0SD_ITEM_HOLD_LINK2805471-1001">
            Unavailable
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
*/

let aeonIntervalPlaceholder;
var aeonRequest = function() {
  var SPEC_COLL = "Special Collections";
  var ALT_SPEC_COLL = "Special Collections, Hill Memorial Library";
  var REMOTE = "LLMVC - Remote Storage";
  var REQUEST_MATERIAL = "Request Item";
  var baseURL =
    "https://specialcollections.lib.lsu.edu/Logon/?Action=10&Form=20";
  var requestType;
  var itemTitle =
    "&ItemTitle=" +
    encodeURIComponent(
      jQuery(".TITLE_MAIN")
        .not(".TITLE_MAIN_label")
        .first()
        .text()
        .slice(0, 750)
    );
  var itemAuthor =
    "&ItemAuthor=" +
    encodeURIComponent(
      jQuery("#detail0_INITIAL_AUTHOR_SRCH .INITIAL_AUTHOR_SRCH_value").text()
    );
  var itemPubDate =
    "&ItemDate=" +
    encodeURIComponent(
      jQuery("#detail0_PUBDATE_RANGE .PUBDATE_RANGE_value").text()
    );
  var item;
  var itemPub =
    "&ItemPublisher=" +
    encodeURIComponent(
      jQuery("#detail0_PUBLISHER .PUBLISHER_value")
        .first()
        .text()
    );
  var itemPlace =
    "&ItemPlace=" +
    encodeURIComponent(
      jQuery("#detail0_PUBLICATION_INFO .PUBLICATION_INFO_value")
        .first()
        .text()
        .split(":")[0]
    );
  var itemRefnum =
    "&ReferenceNumber=" +
    encodeURIComponent(
      jQuery("#detail0_DOC_ID .DOC_ID_value")
        .text()
        .split(":")[1]
    );
  var itemEdition =
    "&ItemEdition=" +
    encodeURIComponent(jQuery("#detail0_EDITION .EDITION_value").text());
  var itemInfo1 =
    "&ItemInfo1=" +
    encodeURIComponent(
      jQuery("#detail0_ACCESSRESTRICTIONS .ACCESSRESTRICTIONS_value").text()
    );
  aeonIntervalPlaceholder = setInterval(function() {
    jQuery(".detailItemsDiv .detailItemTable > tbody > tr.detailItemsTableRow")
      .add(".detailItems .detailItemTable .detailChildRecord")
      .each(function() {
        const mobileMOdifier = jQuery(this).hasClass("detailChildRecord")
          ? ".fieldValue"
          : "";

        var libr = jQuery(this)
          .find(".asyncFieldLIBRARY")
          .first()
          .text();
        var itemDocType =
          "&DocumentType=" +
          encodeURIComponent(
            jQuery(this)
              .find(".detailItemsTable_ITYPE" + mobileMOdifier)
              .text()
              .replace(/\n/g, "")
          );
        var itemCall =
          "&CallNumber=" +
          encodeURIComponent(
            jQuery(this)
              .find(".detailItemsTable_CALLNUMBER" + mobileMOdifier)
              .text()
              .replace(/\n/g, "")
          );
        var curLocation = jQuery(this)
          .find(".asyncFieldSD_ITEM_STATUS")
          .first()
          .text();
        var itemLocation = "&Location=" + encodeURIComponent(curLocation);
        if (libr == SPEC_COLL || libr == ALT_SPEC_COLL) {
          if (curLocation == REMOTE) {
            requestType = "&Value=GenericRequestAllIronMountain";
          } else {
            requestType = "&Value=GenericRequestAll";
          }

          if (jQuery(this).hasClass("detailItemsTableRow")) {
            var aeonElem = $J(
              '<td class="detailItemsAeonRequest"><a target="_blank" href="' +
                baseURL +
                requestType +
                itemRefnum +
                itemDocType +
                itemTitle +
                itemAuthor +
                itemEdition +
                itemCall +
                itemPub +
                itemPubDate +
                itemLocation +
                itemPlace +
                itemInfo1 +
                '">' +
                REQUEST_MATERIAL +
                "</a></td>"
            );

            var destElem = $J(this)
              .find(".detailItemsTable_SD_ITEM_HOLD_LINK")
              .not(".hidden");
            replaceItemHoldsElem(aeonElem, destElem);
          } else if (jQuery(this).hasClass("detailChildRecord")) {
            var aeonElem = $J(
              '<div class="asyncFieldSD_ITEM_HOLD_LINK asyncInProgressSD_ITEM_HOLD_LINK"><a target="_blank" href="' +
                baseURL +
                requestType +
                itemRefnum +
                itemDocType +
                itemTitle +
                itemAuthor +
                itemEdition +
                itemCall +
                itemPub +
                itemPubDate +
                itemLocation +
                itemPlace +
                itemInfo1 +
                '">' +
                REQUEST_MATERIAL +
                "</div>"
            );

            var destElem = $J(this)
              .find(".asyncFieldSD_ITEM_HOLD_LINK")
              .not(".hidden");

            replaceItemHoldsElem(aeonElem, destElem);
          }

          clearInterval(aeonIntervalPlaceholder);
        }
      });
  }, 500);
};

var replaceItemHoldsElem = function(aeonElem, destElem) {
  if (aeonElem.length) {
    $J(destElem).empty();
    $J(destElem).addClass($J(aeonElem).attr("class"));
    $J(destElem).append($J(aeonElem).children(":first-child"));
  }
};

var elecAccessIfUnavailable = function() {
  $J(".asyncFieldSD_ITEM_HOLD_LINK")
    .not(".hidden")
    .ajaxComplete(function() {
      $J(".asyncFieldSD_ITEM_HOLD_LINK")
        .not(".hidden")
        .each(function(i, elem) {
          var elecLink = $J(elem)
            .closest("tr")
            .find(".detailItemsTable_CALLNUMBER a")
            .not(".hidden");
          if (
            $J(elem)
              .text()
              .trim() == "Unavailable" &&
            elecLink.length
          ) {
            $J(elem)
              .text("")
              .append(elecLink);
          }
        });
    });
};

var deUnavailablePermReserve = function() {
  $J(".asyncFieldSD_ITEM_HOLD_LINK")
    .not(".hidden")
    .ajaxComplete(function() {
      $J(".asyncFieldSD_ITEM_HOLD_LINK")
        .not(".hidden")
        .each(function(i, elem) {
          var materialText = $J(elem)
            .closest("tr")
            .find(".detailItemsTable_ITYPE")
            .not(".hidden")
            .text();
          var itemHoldText = $J(elem).text();
          var isMatch =
            materialText.trim() == "Permanent Reserve" &&
            itemHoldText.trim() == "Unavailable";
          if (isMatch) {
            $J(elem).text("Available");
          }
        });
    });
};

var DetaildeUnavailableWhiteReserve = function() {
  $J(".asyncFieldSD_ITEM_HOLD_LINK")
    .not(".hidden")
    .ajaxComplete(function() {
      $J(".asyncFieldSD_ITEM_HOLD_LINK")
        .not(".hidden")
        .each(function(i, elem) {
          var callNumText = $J(elem)
            .closest("tr")
            .find(".detailItemsTable_CALLNUMBER")
            .not(".hidden")
            .text();
          var itemHoldText = $J(elem).text();
          var isMatch =
            callNumText.trim() == "WHITE RESV." &&
            itemHoldText.trim() == "Unavailable";
          if (isMatch) {
            $J(elem).text("Available");
          }
        });
    });
};

var deUnavailableReferenceMaterial = function() {
  $J(".asyncFieldSD_ITEM_HOLD_LINK")
    .not(".hidden")
    .ajaxComplete(function() {
      $J(".asyncFieldSD_ITEM_HOLD_LINK")
        .not(".hidden")
        .each(function(i, elem) {
          var materialText = $J(elem)
            .closest("tr")
            .find(".detailItemsTable_ITYPE")
            .not(".hidden")
            .text();
          var itemHoldText = $J(elem).text();
          var isMatch =
            materialText.trim() == "Reference Material" &&
            itemHoldText.trim() == "Unavailable";
          if (isMatch) {
            $J(elem).text("Available");
          }
        });
    });
};

var deUnavailableReserveDesk = function() {
  $J(".asyncFieldSD_ITEM_HOLD_LINK")
    .not(".hidden")
    .ajaxComplete(function() {
      $J(".asyncFieldSD_ITEM_HOLD_LINK")
        .not(".hidden")
        .each(function(i, elem) {
          var locationText = $J(elem)
            .closest("tr")
            .find(".detailItemsTable_SD_ITEM_STATUS")
            .not(".hidden")
            .text();
          var itemHoldText = $J(elem).text();
          if (
            itemHoldText.trim() == "Unavailable" &&
            locationText.indexOf("Middleton Library Reserve Desk") > -1
          ) {
            $J(elem).text("Available");
          }
        });
    });
};

//Results View tasks
var friendlyizeNoResults = function() {
  var destElem = $J("#no_results_wrapper #searchResultText");
  destElem.text("");
  var firstLine = $J("<p>", {
    text:
      "Your search returned no results. Please check your spelling and try again."
  });
  var DiscLink = $J("<a>", {
    href: "https://www.lib.lsu.edu",
    text: "Discovery search"
  });
  var ILLLink = $J("<a>", {
    href: "https://louis.hosts.atlas-sys.com/remoteauth/luu/illiad.dll",
    text: "Interlibrary Loan"
  });
  var secondLine = $J("<p>", { text: "If still not found, please use our " })
    .append(DiscLink)
    .append(",");
  var thirdLine = $J("<p>", { text: "or request the material through " })
    .append(ILLLink)
    .append(".");
  destElem
    .append(firstLine)
    .append(secondLine)
    .append(thirdLine);
};

var resultsChangeToAccessThisItem = function() {
  $J(".ELECTRONIC_ACCESS")
    .children()
    .each(function(i, elem) {
      if (
        $J(elem).attr("href") &&
        $J(elem)
          .attr("href")
          .includes($J(elem).text())
      ) {
        $J(elem).text("Access This Item");
      }
    });
};

var resultsViewIconReplace = function() {
  $J(".format_container .formatType").each(function(i, elem) {
    var iconText = $J(elem).attr("title");
    $J(elem).text(iconText);
  });
};

var classifyElecAccessLinks = function() {
  var accessLinks = $J(".displayElementText.ELECTRONIC_ACCESS");
  $J(accessLinks).each(function() {
    var acceptableFormats = ["Electronic Resources", "Audio disc"];
    var itemFormat = findFormatForElecAccessDiv(this);
    var hasText = doesElecAccessLinkHaveText(this);
    if (!hasText) {
      $J(this).addClass("access_button");
    }
  });
};

var findFormatForElecAccessDiv = function(elem) {
  var grandparentDiv = $J(elem).closest("span.thumb_hidden");
  var format = $J(grandparentDiv)
    .siblings()
    .find(".formatType")
    .text();
  return format;
};

var doesElecAccessLinkHaveText = function(elem) {
  var firstChildNode = $J(elem).contents()[0];
  var firstChildNodeType = firstChildNode.nodeType;
  var firstChildNodeText = firstChildNode.nodeValue;
  if (firstChildNodeType == "3" && firstChildNodeText.trim().length == 0) {
    return false;
  }
  return true;
};

/*
Purpose: Updates location text for Government Docs in search results 
Example URL: TBD
Test: test_main_search.py > test_for_government_location

Desktop Incoming Markup: TBD


Desktop Outgoing Markup: TBD

Mobile Incoming Markup: TBD

Mobile Outgoing Markup: TBD
*/
var replaceGovDocsLabel = function() {
  $J('div.LIBRARY:contains(" Government Documents/Microforms")').text(
    "Government Documents - (Currently Closed to Public - See Access Services)"
  );
};

var convertResultsStackMapToLink = function() {
  if ($J("td > .SMbutton").length) {
    $J("td > .SMbutton").each(function(i, elem) {
      var newHref = $J("<a />", {
        onclick: $J(elem).attr("onclick"),
        class: "SMlink",
        text: "Find in the Library",
        title: "Find in the Library"
      });
      newHref.appendTo($J(elem).parent());
      $J(elem).remove();
    });
    clearInterval(scheduleConvertResultsStackMapToLink);
  }
};

var changeAvailableAfterSpinner = function() {
  if ($J(".smallSpinner").length == 0) {
    changeAvailableToZero();
    changeAvailableIfWhiteResv();
    clearInterval(schedulechangeAvailableAfterSpinner);
  }
};

var changeAvailableToZero = function() {
  $J(".availableNumber").each(function(i, elem) {
    if ($J(elem).text() == "0") {
      $J(elem.previous()).text("Currently Checked Out");
      $J(elem).text("");
    }
  });
};

var changeAvailableIfWhiteResv = function() {
  $J(".results_bio .thumb_hidden .displayElementText.CALLNUMBER").each(function(
    i,
    elem
  ) {
    if (
      $J(elem)
        .text()
        .trim() == "WHITE RESV."
    ) {
      $J(elem)
        .closest(".results_bio")
        .find(".availableLabel")
        .text("Available: 1");
    }
  });
};

//Advanced Search Page tasks
var hideBasicSearch = function() {
  $J("#searchBoxWrapper").css("display", "none");
};

//Accounts Page tasks
var changeSMSText = function() {
  $J('a:contains("SMS Notifications")').text("Text Notifications");
};

var changeSMSPopupLabel = function() {
  $J("#smsPhoneNameDiv label").text("Name This Notification");
};

var changeSMSPopupTitle = function() {
  $J("#ui-dialog-title-smsPrefDialog_0").text("Add Text Notification");
};

/* Default entrypoints */
/*
Use these two functions to call your custom functions.
  customJavaScript() is called on each page load.
  customDetailJavaScript() is called only on detail view pages.
Any code you want run, point to it from one of these two.
*/

function customJavaScript() {}

function customDetailJavaScript() {}
