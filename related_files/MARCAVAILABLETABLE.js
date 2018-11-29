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
  if ((titleInfo) && ('interestingData' in titleInfo) && (policyDict['locationMap'])) {
    makeAvailableTable(policyDict, titleInfo);
    clearInterval(ajaxResponseController);
  };
};

var makeAvailableTable = function(policyDict, titleInfo) {
  var itemData = titleInfo['interestingData'];
  var htmlAvailableOutput = `<div class="detailItems"><table class="detailItemTable sortable0 sortable" id="detailItemTable0">
      <thead>
        <tr>
          <th class="detailItemsTable_LIBRARY">
            <div class="detailItemTable_th">Library</div>
          </th>
          <th class="detailItemsTable_ITYPE">
            <div class="detailItemTable_th">Material Type</div>
          </th>
          <th class="detailItemsTable_CALLNUMBER">
            <div class="detailItemTable_th">Call Number</div>
          </th>
          <th class="detailItemsTable_NOTE">
            <div class="detailItemTable_th">Note</div>
          </th>
          <th class="detailItemsTable_COPY">
            <div class="detailItemTable_th">Copy</div>
          </th>
          <th class="detailItemsTable_SD_ITEM_STATUS">
            <div class="detailItemTable_th">Status</div>
          </th>
          <th class="detailItemsTable_SD_ITEM_HOLD_LINK">
            <div class="detailItemTable_th">Item Holds</div>
          </th>
        </tr>
      </thead>
      <tbody>`
  for (var row in itemData) {
    if (itemData.hasOwnProperty(row)) {
      var library = policyDict['libraryMap'][itemData[row]['libraryID']];
      var material = policyDict['materialTypeMap'][itemData[row]['itemTypeID']];
      var callNum = itemData[row]['callNumber'];
      var location = policyDict['locationMap'][itemData[row]['currentLocationID']];
      if (itemData[row]['publicNote'] && itemData[row]['publicNote'].length) {
        var note = itemData[row]['publicNote'];
      } else {
        var note = '';
      };
      var copies = itemData[row]['numberOfCopies'];
      var newRow = '<tr class="detailItemsTableRow">';
      newRow += '<td class="detailItemsTable_LIBRARY"><div class="asyncFieldLIBRARY" id="asyncFielddetailItemsDiv0LIBRARY31518013572072">' + library + '</div><div class="asyncFieldLIBRARY hidden" id="asyncFieldDefaultdetailItemsDiv0LIBRARY31518013572072">' + library + '</div></td>';
      newRow += '<td class="detailItemsTable_ITYPE">' + material + '</td>';
      newRow += '<td class="detailItemsTable_CALLNUMBER">' + callNum + '</td>';
      newRow += '<td class="detailItemsTable_NOTE">' + note + '</td>';
      newRow += '<td class="detailItemsTable_COPY">' + copies + '</td>';
      newRow += '<td class="detailItemsTable_SD_ITEM_STATUS"><div class="asyncFieldSD_ITEM_STATUS" id="asyncFielddetailItemsDiv0SD_ITEM_STATUS31518013572072">' + location + '</div><div class="asyncFieldSD_ITEM_STATUS hidden" id="asyncFieldDefaultdetailItemsDiv0SD_ITEM_STATUS31518013572072">Unknown</div></td>';
      newRow += `<td class="detailItemsTable_SD_ITEM_HOLD_LINK"><div class="asyncFieldSD_ITEM_HOLD_LINK" id="asyncFielddetailItemsDiv0SD_ITEM_HOLD_LINK31518013572072"><a href="javascript:com_sirsi_ent_login.loginFirst(function(reload){placeItemHold(reload, '/client/en_US/lsu/search/placehold/ent:$002f$002fSD_LSU$002f0$002fSD_LSU:316195/31518013572072/item_hold?qu=korea+journal&amp;d=ent%3A%2F%2FSD_LSU%2F0%2FSD_LSU%3A316195%7E%7E0');});">Reserve This Copy</a></div><div class="asyncFieldSD_ITEM_HOLD_LINK hidden" id="asyncFieldDefaultdetailItemsDiv0SD_ITEM_HOLD_LINK31518013572072">Unavailable</div></td></tr>`;
      htmlAvailableOutput += newRow;
    };
  };
  htmlAvailableOutput += '</tbody><tfoot></tfoot></table></div>';
  $J('#detailItemsDiv0').html(htmlAvailableOutput);
};
