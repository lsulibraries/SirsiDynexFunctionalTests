var baseWsURL = 'https://lalu.sirsi.net/lalu_ilsws/'; // Put your WS url here.
var clientID = 'DS_CLIENT';

var policyRestMapController;
var startUpdatedMARCHoldings = function (rId) {
    var policyRestMap = getDetailPolicies();
    policyRestMapController = setInterval(function () {
        waitDetailMARCHoldings(rId, policyRestMap);
    }, 800);
};

var getDetailPolicies = function () {
    var locationMap = {};
    var libraryMap = {};
    var materialTypeMap = {};
    var locationWsURL = baseWsURL + 'rest/admin/lookupLocationPolicyList?clientID=' + clientID + '&json=true&callback=?';
    var libraryWsURL = baseWsURL + 'rest/admin/lookupLibraryPolicyList?clientID=' + clientID + '&json=true&callback=?';
    var materialTypeWsURL = baseWsURL + 'rest/admin/lookupItemTypePolicyList?clientID=' + clientID + '&json=true&callback=?';
    $J.getJSON(locationWsURL, function (locationData) {
        $J.each(locationData.policyInfo, function () {
            locationMap[this.policyID] = this.policyDescription;
        });
    });
    $J.getJSON(libraryWsURL, function (libraryData) {
        $J.each(libraryData.policyInfo, function () {
            libraryMap[this.policyID] = this.policyDescription;
        });
    });
    return {
        locationMap: locationMap,
        libraryMap: libraryMap
    };
};

var waitDetailMARCHoldings = function (rId, policyRestMap) {
    if ('locationMap' in policyRestMap && 'libraryMap' in policyRestMap) {
        goDetailMARCHoldings(rId, policyRestMap);
        clearInterval(policyRestMapController);
    }
};

var goDetailMARCHoldings = function (rId, policyRestMap) {
    var locationMap = policyRestMap.locationMap;
    var libraryMap = policyRestMap.libraryMap;
    var hitNum = rId.split('detail')[1];
    var catKey = $J('#' + rId + '_DOC_ID .DOC_ID_value').text().split(':')[1];
    var attachTarget = $J('#detail_accordion' + hitNum + ' h3:contains("Holdings")').next();
    var wsURL = baseWsURL + 'rest/standard/lookupTitleInfo?clientID=' + clientID + '&titleID=' + catKey + '&includeMarcHoldings=true&marcEntryFilter=ALL&json=true&callback=?';
    $J.getJSON(wsURL, function (tr) {
        //Add MARC Holdings Info
        var htmlHoldingOutput = '';
        var holdingsInfo = tr.TitleInfo[0].MarcHoldingsInfo;
        if (holdingsInfo) {
            htmlHoldingOutput = '<thead><tr><th class="detailItemsTable_LIBRARY"><div class="detailItemTable_th">Library</div></th><th class="detailItemsTable_LOCATION"><div class="detailItemTable_th">Shelf Location</div></th><th class="detailItemsTable_CALLNUMBER"><div class="detailItemTable_th">Call Number</div></th><th class="detailItemsTable_HOLDING"><div class="detailItemTable_th">LSU Has:</div></th></tr></thead><tbody>';
            $J.each(holdingsInfo, function (holdingIndex, holding) {
                var holdingLibID = this.holdingLibraryID;
                var holdingLibDesc = libraryMap[holdingLibID];
                var holdingEntry = this.MarcEntryInfo;
                var holdingShelfMark = '';
                var textualHoldings = '';
                var textualHoldingsIndexes = '';
                var textualHoldingsSupplemental = '';
                var textualHoldingsEnumeration = '';
                var allTextualHoldingsEnumeration = '';
                var holdingLocationDesc = '';
                var holdingAddend = '';
                $J.each(holdingEntry, function (holdingEntryIndex, holdingEntryData) {
                    var entryId = this.entryID;
                    if (entryId === '852') {
                        var holdingLocationText = this.text;
                        var holdingLocation = holdingLocationText.split('--')[0];
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
                        } else {
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
            });
            htmlHoldingOutput += '</tbody><tfoot></tfoot>';
            $J(attachTarget).find('#detailItemTable0').html(htmlHoldingOutput);
        }
    });
};
