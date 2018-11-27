var BASEWSURL = 'https://lalu.sirsi.net/lalu_ilsws/'; // Put your WS url here.
var CLIENTID = 'DS_CLIENT';

var ajaxResponseController;
var updateAvailableTable = function(rId) {
  $J('tbody tr td.detailItemsTable_ITEMNOTE').text('');
  var policyDict = getPolicies();
  var titleInfo = getTitleInfo(rId);
  ajaxResponseController = setInterval(function() {
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
  if ((titleInfo) && ('interestingData' in titleInfo) && (Object.keys(policyDict['locationMap']).length)) {
    reviseAvailableTable(rId, policyDict, titleInfo);
    clearInterval(ajaxResponseController);
  };
};

var reviseAvailableTable = function(rId, policyDict, titleInfo) {
  var availableHeader = $J('h3.ui-accordion-header:contains("Available:")');
  var availableTable = $J(availableHeader).next();
  var headerOrder = {};
  availableTable.find('thead tr th .detailItemTable_th').map( function(index, elem) {
    headerOrder[elem.textContent] = index;
  });
  availableTable.find('tbody tr.detailItemsTableRow').map( function(index, elem) {
    var availableRow = extractRow(elem);
    for (var key in titleInfo['interestingData']) {
        if (titleInfo['interestingData'].hasOwnProperty(key)) {
            var matchingRow = titleInfo['interestingData'][key]['callNumber'];
            var foundRow = availableRow[headerOrder['Call Number']][1];
            if (matchingRow.trim() == foundRow.trim()) {
                var newText = titleInfo['interestingData'][key]['publicNote'];
                var matchCell = $J('.detailItemsTable_CALLNUMBER:contains("' + foundRow + '")');
                $J(matchCell).siblings('.detailItemsTable_ITEMNOTE').text(newText);
            };
        };
    };
  });
};

var extractRow = function(clump) {
  var ourText = {};
  $J(clump).find('td').each( function(index, elem) {
    if ($J(elem).find('div').length) {
      ourText[index] = [$J(elem).find('div').not('.hidden').attr('class'), $J(elem).find('div').not('.hidden').text()];
    } else {
      ourText[index] = [$J(elem).attr('class'), $J(elem).text()];
    };
  });
  return ourText;
}
