var locationMap = {};
var materialTypeMap = {};
var libraryMap = {};
var baseWsURL = 'https://lalu.sirsi.net/lalu_ilsws/'; // Put your WS url here.
var clientID = 'DS_CLIENT';
var libraryDone = false;
var materialTypeDone = false;
var locationDone = false;
var maxAttempts = 10;
var curAttempt = 0;
var htmlFinalOrderOutput = '';
var htmlFinalHoldingOutput = '';
var holdingShelfMark = '';
var textualHoldings = '';
var textualHoldingsEnumeration = '';
var textualHoldingsSupplemental = '';
var textualHoldingsIndexes = '';
var allTextualHoldingsEnumeration = '';

function startUpdatedMARCHoldings(rId) {
  getDetailPolicies();
  waitDetailMARCHoldings(rId);
}

function getDetailPolicies() {
  var locationWsURL = baseWsURL + 'rest/admin/lookupLocationPolicyList?clientID=' + clientID + '&json=true&callback=?';
  var libraryWsURL = baseWsURL + 'rest/admin/lookupLibraryPolicyList?clientID=' + clientID + '&json=true&callback=?';
  var materialTypeWsURL = baseWsURL + 'rest/admin/lookupItemTypePolicyList?clientID=' + clientID + '&json=true&callback=?';
  $J.getJSON(locationWsURL, function(locationData) {
    $J.each(locationData.policyInfo, function(index, value) {
      locationMap[this.policyID] = this.policyDescription;
    });
    locationDone = true;
  });
  $J.getJSON(libraryWsURL, function(libraryData) {
    $J.each(libraryData.policyInfo, function(index, value) {
      libraryMap[this.policyID] = this.policyDescription;
    });
    libraryDone = true;
  });
  $J.getJSON(materialTypeWsURL, function(materialTypeData) {
    $J.each(materialTypeData.policyInfo, function(index, value) {
      materialTypeMap[this.policyID] = this.policyDescription;
    });
    materialTypeDone = true;
  });
}

function waitDetailMARCHoldings(rId) {
  if (!(libraryDone == true && materialTypeDone == true && locationDone == true)) {
    curAttempt++;
    if (curAttempt <= maxAttempts) {
      setTimeout(function() {
        waitDetailMARCHoldings(rId);
      }, 250);
    }
  } else {
    goDetailMARCHoldings(rId);
  }
}

function goDetailMARCHoldings(rId) {
  var numRows = 0;
  var hitNum = rId.split('detail')[1];
  var catKey = $J('#' + rId + '_DOC_ID .DOC_ID_value').text().split(':')[1];
  var attachTarget = jQuery('#detail_accordion' + hitNum + ' h3:contains("Holdings")').next();
  var wsURL = baseWsURL + 'rest/standard/lookupTitleInfo?clientID=' + clientID + '&titleID=' + catKey + '&includeMarcHoldings=true&marcEntryFilter=ALL&json=true&callback=?';
  $J.getJSON(wsURL, function(tr) {
    //Add MARC Holdings Info
    var holdingsInfo = tr.TitleInfo[0].MarcHoldingsInfo;
    if (holdingsInfo) {
      var htmlHoldingOutput = '<thead><tr><th class="detailItemsTable_LIBRARY"><div class="detailItemTable_th">Library</div></th><th class="detailItemsTable_LOCATION"><div class="detailItemTable_th">Shelf Location</div></th><th class="detailItemsTable_CALLNUMBER"><div class="detailItemTable_th">Call Number</div></th><th class="detailItemsTable_HOLDING"><div class="detailItemTable_th">LSU Has:</div></th></tr></thead><tbody>'
      $J.each(holdingsInfo, function(holdingIndex, holding) {
        var holdingLibID = this.holdingLibraryID;
        var holdingLibDesc = libraryMap[holdingLibID];
        var holdingEntry = this.MarcEntryInfo;
        var allTextualHoldingsEnumeration = '';
        $J.each(holdingEntry, function(holdingEntryIndex, holdingEntryData) {
          var entryId = this.entryID;
          if (entryId === '852') {
            var holdingLocationText = this.text;
            holdingLocation = holdingLocationText.split('--')[0];
            holdingLocationDesc = locationMap[holdingLocation];
            holdingShelfMark = holdingLocationText.split('--')[1];
            if (holdingShelfMark && holdingShelfMark.length) {
              holdingShelfMark.trim();
            } else {
              holdingShelfMark = '';
            }
            holdingAddend = holdingLocationText.split('--')[2];
            if (holdingAddend && holdingAddend.length) {
              holdingAddend = holdingAddend.trim().replace('Note:', '');
            } else {
              holdingAddend = '';
            }
          }
          if (entryId === '866') {
            textualHoldings += "<p>" + this.text + "</p>";
          }
          if (entryId === '863') {
            textualHoldingsEnumeration += "<p>" + this.text + "</p>";
            if (allTextualHoldingsEnumeration.length) {
                allTextualHoldingsEnumeration += ', ' + this.text;
            }
            else {
                allTextualHoldingsEnumeration = this.text;
            }
          }
          if (entryId === '867') {
            textualHoldingsSupplemental += "<p>" + this.label + ': ' + this.text + "</p>";
          }
          if (entryId === '868') {
            textualHoldingsIndexes += "<p>" + this.label + ': ' + this.text + "</p>";
          }
        });
        htmlHoldingOutput += '<tr class="detailItemsTableRow"><td class="detailItem library">' + holdingLibDesc + '</td><td class="detailItem location">' + holdingLocationDesc + '</td><td class="detailItem callno"><p>' + holdingShelfMark + '</p><p>' + holdingAddend.replace('Current Issues', allTextualHoldingsEnumeration) + '</p></td><td class="detailItem lsuHas">' + textualHoldings + textualHoldingsEnumeration + textualHoldingsSupplemental + textualHoldingsIndexes + '</td></tr>';
        //empty the variables
        textualHoldings = '';
        textualHoldingsEnumeration = '';
        textualHoldingsSupplemental = '';
        textualHoldingsIndexes = '';
      });
      htmlHoldingOutput += '</tbody><tfoot></tfoot>'
    } // end if holdingsInfo
    else {
      htmlHoldingOutput = '';
    }
    // End Add MARC Holdings Info
    if (htmlHoldingOutput !== '') {
      $J(attachTarget).find('#detailItemTable0').html(htmlHoldingOutput);
      /* 
       go_go_gadget_sorttable() and sorttable.init({hitnum}) were found in DetailStack.js line 69-70.  And are crucial for adding sorting functionality.
       */
      // go_go_gadget_sorttable();
      // sorttable.init(0);
    }
  });
}
