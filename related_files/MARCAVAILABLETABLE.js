var BASEWSURL = 'https://lalu.sirsi.net/lalu_ilsws/'; // Put your WS url here.
var CLIENTID = 'DS_CLIENT';

var policyDictController;
var updateAvailableTable = function(rId) {
  var policyDict = getPolicies();
  var titleInfo = getTitleInfo(rId);
  policyDictController = setInterval(function() {
    waitDetailMARCHoldings(rId, policyDict, titleInfo);
  }, 800);
};

var getPolicies = function() {
  var locationMap = {};
  var libraryMap = {};
  var materialTypeMap = {};
  var locationWsURL = BASEWSURL + 'rest/admin/lookupLocationPolicyList?clientID=' + CLIENTID + '&json=true&callback=?';
  var libraryWsURL = BASEWSURL + 'rest/admin/lookupLibraryPolicyList?clientID=' + CLIENTID + '&json=true&callback=?';
  var materialTypeWsURL = BASEWSURL + 'rest/admin/lookupItemTypePolicyList?clientID=' + CLIENTID + '&json=true&callback=?';
  $J.getJSON(locationWsURL, function(locationData) {
    $J.each(locationData.policyInfo, function() {
      locationMap[this.policyID] = this.policyDescription;
    });
  });
  $J.getJSON(libraryWsURL, function(libraryData) {
    $J.each(libraryData.policyInfo, function() {
      libraryMap[this.policyID] = this.policyDescription;
    });
  });
  $J.getJSON(materialTypeWsURL, function(materialTypeData) {
    $J.each(materialTypeData.policyInfo, function() {
      materialTypeMap[this.policyID] = this.policyDescription;
    });
  });
  return {
    locationMap: locationMap,
    libraryMap: libraryMap,
    materialTypeMap: materialTypeMap
  };
};

var getTitleInfo = function(rId) {
  var titleInfo = []
  var catKey = $J('#' + rId + '_DOC_ID .DOC_ID_value').text().split(':')[1];
  var titleInfoWsURL = BASEWSURL + 'rest/standard/lookupTitleInfo?clientID=' + CLIENTID + '&titleID=' + catKey + '&includeMarcHoldings=true&includeCatalogingInfo=true&includeAvailabilityInfo=true&includeOrderInfo=true&includeBoundTogether=true&includeCallNumberSummary=true&marcEntryFilter=ALL&includeItemInfo=true&json=true&includeOPACInfo=true&callback=?'
  var data;
  $J.getJSON(titleInfoWsURL, function(data) {
  console.log( "success" );
  console.log(data);
  })
  .done(function() {
    console.log( "second success" );
  })
  .fail(function() {
    console.log( "error" );
  })
  .complete(function() {
    console.log( "complete" );
  });
};

var waitDetailMARCHoldings = function(rId, policyDict, titleInfo) {
  var policyKeys = new Set(Object.keys(policyDict));
  var expectedKeys = new Set(["locationMap", "libraryMap", "materialTypeMap"]);
  if (policyKeys == expectedKeys && ) {
    reviseAvailableTable(response, rId, policyDict);
    clearInterval(policyDictController);
  }
};



var reviseAvailableTable = function(tr, rId, policyDict) {
  var htmlHoldingOutput = '';
  var holdingsInfo = tr.TitleInfo[0].MarcHoldingsInfo;
  if (holdingsInfo) {
    htmlHoldingOutput = '<thead><tr><th class="detailItemsTable_LIBRARY"><div class="detailItemTable_th">Library</div></th><th class="detailItemsTable_LOCATION"><div class="detailItemTable_th">Shelf Location</div></th><th class="detailItemsTable_CALLNUMBER"><div class="detailItemTable_th">Call Number</div></th><th class="detailItemsTable_HOLDING"><div class="detailItemTable_th">LSU Has:</div></th></tr></thead><tbody>';
    $J.each(holdingsInfo, function(holdingIndex, holding) {
      var holdingsRow = makeHoldingsRow(holdingIndex, holding, policyDict);
      htmlHoldingOutput += holdingsRow;
    });
    htmlHoldingOutput += '</tbody><tfoot></tfoot>';
    var hitNum = rId.split('detail')[1];
    var attachTarget = $J('#detail_accordion' + hitNum + ' h3:contains("Holdings")').next();
    $J(attachTarget).find('#detailItemTable0').html(htmlHoldingOutput);
  };
};

var makeHoldingsRow = function(holdingIndex, holding, policyDict) {
  var holdingLibID = holding.holdingLibraryID;
  var holdingLibDesc = policyDict.libraryMap[holdingLibID];
  var holdingEntry = holding.MarcEntryInfo;
  var holdingShelfMark = '';
  var textualHoldings = '';
  var textualHoldingsIndexes = '';
  var textualHoldingsSupplemental = '';
  var textualHoldingsEnumeration = '';
  var allTextualHoldingsEnumeration = '';
  var holdingLocationDesc = '';
  var holdingAddend = '';
  $J.each(holdingEntry, function(holdingEntryIndex, holdingEntryData) {
    var entryId = holdingEntryData.entryID;
    if (entryId === '852') {
      var holdingLocationText = holdingEntryData.text;
      var holdingLocation = holdingLocationText.split('--')[0];
      holdingLocationDesc = policyDict.locationMap[holdingLocation];
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
      textualHoldings += "<p>" + holdingEntryData.text + "</p>";
    }
    if (entryId === '863') {
      textualHoldingsEnumeration += "<p>" + holdingEntryData.text + "</p>";
      if (allTextualHoldingsEnumeration.length) {
        allTextualHoldingsEnumeration += ', ' + holdingEntryData.text;
      } else {
        allTextualHoldingsEnumeration = holdingEntryData.text;
      }
    }
    if (entryId === '867') {
      textualHoldingsSupplemental += "<p>" + holdingEntryData.label + ': ' + holdingEntryData.text + "</p>";
    }
    if (entryId === '868') {
      textualHoldingsIndexes += "<p>" + holdingEntryData.label + ': ' + holdingEntryData.text + "</p>";
    }
  });
  var holdingsRow = '<tr class="detailItemsTableRow"><td class="detailItem library">' + holdingLibDesc + '</td><td class="detailItem location">' + holdingLocationDesc + '</td><td class="detailItem callno"><p>' + holdingShelfMark + '</p><p>' + holdingAddend.replace('Current Issues', allTextualHoldingsEnumeration) + '</p></td><td class="detailItem lsuHas">' + textualHoldings + textualHoldingsEnumeration + textualHoldingsSupplemental + textualHoldingsIndexes + '</td></tr>';
  return holdingsRow;
};
