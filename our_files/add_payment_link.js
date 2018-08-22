function customJavaScript(){

/*DOM variables like isLoggedIn won't be readable until the page is loaded.  Deferring execution to document.ready() is a good tactic*/

	$J(document).ready(function(){
		
		if($J('#finesSummaryZone').length>0){
			waitFinesLink();
		}
	});
}

var curAttempt=0;  // global variable

function waitFinesLink(){
	var maxAttempts=20;
	var attemptInterval=1000; //milliseconds between attempts
	if (curAttempt<maxAttempts)
	{
		if($J('#finesSummaryZone .summaryData').text()=='')
		{
			curAttempt++;
			setTimeout("waitFinesLink()",attemptInterval);
		}
		else
		{
			addFinesLink();
		}
	}
	else
	{return false;}
}

function addFinesLink(){

var finesHtml='<a id="custFinksLink" href="https://PayUsSomeMoney.com/OrWeWill/BreakYourLegs.html">Pay Fines</a>';

/*if you're implementing this against a non-dollar currency, watch out for the next line that is doing a split on the $ sign, change accordingly*/

	var amtOwed=$J('#finesSummaryZone .summaryData').text().split('$')[1];
	if(amtOwed!=='0.00'){
		$J('#accountSummary').append(finesHtml);
	}
}

