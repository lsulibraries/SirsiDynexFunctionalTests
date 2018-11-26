var BASEWSURL = 'https://lalu.sirsi.net/lalu_ilsws/'; // Put your WS url here.
var CLIENTID = 'DS_CLIENT';

var ajaxResponseController;
var updateAvailableTable = function(rId) {

  var policyDict = getPolicies();
  var titleInfo = getTitleInfo(rId);
  ajaxResponseController = setInterval(function() {
    console.log('trying once');
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
  var titleInfo = {};
  var catKey = $J('#' + rId + '_DOC_ID .DOC_ID_value').text().split(':')[1];
  var titleInfoWsURL = BASEWSURL + 'rest/standard/lookupTitleInfo?clientID=' + CLIENTID + '&titleID=' + catKey + '&includeMarcHoldings=true&includeCatalogingInfo=true&includeAvailabilityInfo=true&includeOrderInfo=true&includeBoundTogether=true&includeCallNumberSummary=true&marcEntryFilter=ALL&includeItemInfo=true&json=true&includeOPACInfo=true&callback=?'
  $J.getJSON(titleInfoWsURL, function(data) {
      console.log("success");
      var parsedTitleInfo = parseTitleInfo(data);
      titleInfo['interestingData'] = parsedTitleInfo;
    })
  return titleInfo
};

var parseTitleInfo = function(data) {
  var interestingData = {};
  var CallInfo = data['TitleInfo'][0]['CallInfo'];
  for (var i = 0; i < CallInfo.length; i++) {
    interestingData[i] = {};
    interestingData[i]['numberOfCopies'] = CallInfo[i]['numberOfCopies'];
    interestingData[i]['libraryID'] = CallInfo[i]['libraryID'];
    interestingData[i]['callNumber'] = CallInfo[i]['callNumber'];
    interestingData[i]['itemTypeID'] = CallInfo[i]['ItemInfo'][0]['itemTypeID'];
    interestingData[i]['currentLocationID'] = CallInfo[i]['ItemInfo'][0]['currentLocationID'];
    interestingData[i]['publicNote'] = CallInfo[i]['ItemInfo'][0]['publicNote'];
  };
  return interestingData;
};

var waitDetailMARCHoldings = function(rId, policyDict, titleInfo) {
  if (('interestingData' in titleInfo) && (Object.keys(policyDict['locationMap']).length)) {
    reviseAvailableTable(rId, policyDict, titleInfo);
    clearInterval(ajaxResponseController);
  };
};

var reviseAvailableTable = function(rId, policyDict, titleInfo) {
  console.log(titleInfo);
  console.log(policyDict);
  var availableHeader = $J('h3.ui-accordion-header:contains("Available:")');
  var availableTable = $J(availableHeader).next();
  var headerOrder = {};
  availableTable.find('thead tr th .detailItemTable_th').map( function(index, elem) {
    headerOrder[elem.textContent] = index;
  });
  var cells = {};
  availableTable.find('tbody tr.detailItemsTableRow').map( function(index, elem) {
    extractUsefulText(elem); 
  })
};

var extractUsefulText = function(clump) {
  console.log(clump);
  $J(clump).find('td').each( function(index, elem) {
    if ($J(elem).find('div').length) {
      ourText = $J(elem).find('div').text();
    } else {
      ourText = $J(elem).text();
    };
    console.log(ourText);
  });
}

// var reviseAvailableTable = function(rId, policyDict, titleInfo) {
//   var htmlHoldingOutput = '';
//   var holdingsInfo = tr.TitleInfo[0].MarcHoldingsInfo;
//   if (holdingsInfo) {
//     htmlHoldingOutput = '<thead><tr><th class="detailItemsTable_LIBRARY"><div class="detailItemTable_th">Library</div></th><th class="detailItemsTable_LOCATION"><div class="detailItemTable_th">Shelf Location</div></th><th class="detailItemsTable_CALLNUMBER"><div class="detailItemTable_th">Call Number</div></th><th class="detailItemsTable_HOLDING"><div class="detailItemTable_th">LSU Has:</div></th></tr></thead><tbody>';
//     $J.each(holdingsInfo, function(holdingIndex, holding) {
//       var holdingsRow = makeHoldingsRow(holdingIndex, holding, policyDict);
//       htmlHoldingOutput += holdingsRow;
//     });
//     htmlHoldingOutput += '</tbody><tfoot></tfoot>';
//     var hitNum = rId.split('detail')[1];
//     var attachTarget = $J('#detail_accordion' + hitNum + ' h3:contains("Holdings")').next();
//     $J(attachTarget).find('#detailItemTable0').html(htmlHoldingOutput);
//   };
// };
