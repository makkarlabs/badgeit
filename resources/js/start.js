var imagePicker, sheetPicker, projectPicker, feed, data, ar=true, aspectRatio;
var preloadImage = true, preloadCSV = true;
var settings = new Store("settings");
var badgeProps = new Object();
var responseJSON, projectJSON;
var source = "start";

google.setOnLoadCallback(createPicker);
google.load('picker',1);

$(function() {

// First, parse the query string
var access_info = {}, queryString = location.hash.substring(1),
    regex = /([^&=]+)=([^&]*)/g, m;
while (m = regex.exec(queryString)) {
  access_info[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
}

var client_id ="434888942442.apps.googleusercontent.com";
var scope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive";

// CHANGE REDIRECT URL WHILE MOVING TO PRODUCTION      
$.ajax({url:'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token='+access_info["access_token"]})
		.fail(function(){
			$('body').css('background-color','whitesmoke');
			$('body').html('<p style="font-size:20px; text-align:center; margin-top:100px">Checking Google Login status</p>');
			location.href = "https://accounts.google.com/o/oauth2/auth?response_type=token&client_id="+encodeURIComponent(client_id)+"&scope="+encodeURIComponent(scope)+"&redirect_uri="+encodeURIComponent("http://makkarlabs.in/preprod/badgeit/start.html");
	
		});

$.ajax({url:'https://www.googleapis.com/oauth2/v1/userinfo?access_token='+access_info["access_token"]})
		.done(function(data){
			$.ajax({url:'http://badgeitrelay.appspot.com/badgeitupdateuser?userjson='+encodeURIComponent(JSON.stringify(data)),type:'POST'})
					.done(function(){
				        console.log("Updated");
						});
				});


hideDriveButtons();
$("a[rel*=leanModal]").leanModal({ top : 200, overlay : 0.4, closeButton: ".modal_close" });
    
badgeProps.qrcode = false;
settings.set("openFromDrive", false);

if (typeof window.FileReader === 'undefined') {
  console.log('File reader API failed');
} else {
  console.log('success File API & FileReader available');
}


$('#qrcode').click(function() {
	
	if($(this).is(':checked')){
		$('#qrCodeSelect').show();
        badgeProps.qrcode = true;
		$('#qrCodeSelect').find('select').attr("required","required");
		} 
	else {
		$('#qrCodeSelect').hide();
        badgeProps.qrcode = false;
		$('#qrCodeSelect').find('select').removeAttr("required");
	}
});

$('#goToNewProject').click(function(){

	$('#navButtons').hide();
	$('#newProject').show();
	$("footer").removeClass("fixed");

});


$('#goToDemo').click(function(){
	demo();
});

$("#goToOpenProject").click(function(e) {
	e.preventDefault();
	if(!isDriveAuth) { 
		gapi.auth.authorize(config, function(authresult) {
			if(authresult && !authresult.error)
			{	isDriveAuth = true;
				projectPicker.setVisible(true);
			}
		});
	}
	else {
		projectPicker.setVisible(true);
	}
});

$("#backButton").click(function(e){
	e.preventDefault();
	$('#navButtons').show();
	$('#newProject').hide();
	$("footer").addClass("fixed");
});

setFileChooseHandlers();


$("#badgeinput").submit(function() {
	
	if($('#templateChooser').val() == "" && $('#google_image').val() == "") {
			$("#alertmessage").html("<strong>Error!</strong> You have not selected template image.");
			$("#errorholder").attr('class','alert alert-error');
			$("#errorholder").show();
			return false;
	}

	if(isNaN($('#dpi').val()) || $('#dpi').val()=="") {
			$("#alertmessage").html("<strong>Error!</strong> DPI you've entered is invalid.");
			$("#errorholder").attr('class','alert alert-error');
			$("#errorholder").show();
			return false;	

	}
	
	if((isNaN($('#inchwidth').val())) || ($('#inchwidth').val() == 0) || $('#inchwidth').val() == ""){
			$("#alertmessage").html("<strong>Error!</strong> Image Width you've entered is invalid.");
			$("#errorholder").attr('class','alert alert-error');
			$("#errorholder").show();
			return false;	
	}

	if((isNaN($('#inchheight').val())) || ($('#inchheight').val() == 0) || $('#inchheight').val() == ""){
			$("#alertmessage").html("<strong>Error!</strong> Image Height you've entered is invalid.");
			$("#errorholder").attr('class','alert alert-error');
			$("#errorholder").show();
			return false;	
	}
	
	if($('#csvChooser').val() == "" && $('#csvGoogle').val() == "") {
			$("#alertmessage").html("<strong>Error!</strong> You have not selected attendee list.");
			$("#errorholder").attr('class','alert alert-error');
			$("#errorholder").show();
			return false;
	}
	
	if($('#csvColumnsSelect').find(':input:checkbox:checked').length == 0) {
			$("#alertmessage").html("<strong>Error!</strong> Select atleast one field from the attendee list.");
			$("#errorholder").attr('class','alert alert-error');
			$("#errorholder").show();
			return false;
	}
	
	if($('#qrcode').is(':checked')){
		if($('#qrCodeSelect').find(':input:checkbox:checked').length == 0) {
			$("#alertmessage").html("<strong>Error!</strong> Select atleast one field for the QR Code list.");
			$("#errorholder").attr('class','alert alert-error');
			$("#errorholder").show();
			return false;
		}
	}
	
	var selectedCols = new Array();
	var qrSelectedCols = new Array();
	$('#csvColumnsSelect').find(':input:checkbox:checked').each(function() { 	
		selectedCols.push(this.value);
	});

	if (selectedCols.length != 0) {
        badgeProps.selectedCols = selectedCols;
	}
	
	if($('#qrcode').is(':checked')) {
		$('#qrCodeSelect').find(':input:checkbox:checked').each(function() { 
			qrSelectedCols.push(this.value);
		});
        badgeProps.qrCols = qrSelectedCols;
	}

	badgeProps.projectName = $("#projectName").val();
    _gaq.push(['_trackEvent', 'Template', 'Submit', 'Project', badgeProps.projectName]);
    dimensions = { 
                "pixelwidth" : $('#pixelwidth').val(), 
                "pixelheight" : $('#pixelheight').val(), 
                "inchwidth" : $('#inchwidth').val(), 
                "inchheight" : $('#inchheight').val(),
                "scalepixelw" : $('#pixelwidth').val()*$('#dpi').val()/96,
                "scalepixelh" : $('#pixelheight').val()*$('#dpi').val()/96
            }
	badgeProps.dimensions = dimensions;
    settings.set("badgeProps",badgeProps);

  	});

	$("[rel=tooltip]").tooltip();
});

function createMultipleSelect(fileString, placeid, colselectid)
{
	csv_text = $.csv2Array(fileString);
	data = csv_text;
	var i = 0;
	while(i<csv_text[0].length) {
		$("#"+placeid).append("<label class='checkbox'><input type='checkbox' id='"+ colselectid +"'value='"+i+"'>"+csv_text[0][i++]+" </input></label>");
	}
	
}

function lockar() {
	ar = !(ar);
	if(ar == true) {
		$("#lockar").css("opacity","1"); 
	}
	else {
		$("#lockar").css("opacity","0.4");
	}
}

function clear() {
	$("#badgepreview").val("");
	$('#qrCodeSelect').empty();
	$('#csvColumnsSelect').empty();
	$("#badgeinput").find(':input').each(function() {
        switch(this.type) {
            case 'password':
            case 'select-multiple':
            case 'select-one':
            case 'text':
            case 'textarea':
                $(this).val('');
                break;
            case 'checkbox':
            case 'radio':
                this.checked = false;
        }
    });
};

function setPixelWidth() {
	if(($('#dpi').val() != "") && !isNaN($('#dpi').val())) {
		$('#pixelwidth').val(($('#dpi').val()*$('#inchwidth').val()).toFixed(2));
		if(ar) {	
			$('#inchheight').val(($('#inchwidth').val() / aspectRatio).toFixed(2));
			$('#pixelheight').val(($('#dpi').val()*$('#inchheight').val()).toFixed(2));
	  	}
	}
}


function setPixelHeight() {
	if(($('#dpi').val() != "") && !isNaN($('#dpi').val())) {
		$('#pixelheight').val(($('#dpi').val()*$('#inchheight').val()).toFixed(2));
		if(ar) {		
			$('#inchwidth').val(($('#inchheight').val() * aspectRatio).toFixed(2));
			$('#pixelwidth').val(($('#dpi').val()*$('#inchwidth').val()).toFixed(2));
	 	}
	}
}

function demo() {	
        settings.set("badgeProps",demoJSON);
		$("#badgeinput")[0].submit();
}