$(function() {
var holder = document.getElementById('holder');


if (typeof window.FileReader === 'undefined') {
  console.log('File reader API failed');
} else {
  console.log('success File API & FileReader available');
}

$('#qrcode').click(function() {
	
	if($(this).is(':checked')){
		$('#qrCodeSelect').show();
		$('#qrCodeSelect').find('select').attr("required","required");
		} 
	else {
		$('#qrCodeSelect').hide();
		$('#qrCodeSelect').find('select').removeAttr("required");
	}
});

 
holder.ondragover = function () { this.className = 'hover'; return false; };
holder.ondragend = function () { this.className = ''; return false; };
holder.ondrop = function (e) {
  this.className = '';
  e.preventDefault();

  var file = e.dataTransfer.files[0],
      reader = new FileReader();
  reader.onload = function (event) {
    console.log(event.target);
    localStorage["event-template"] = event.target.result;
	
	$('#badgepreview').attr('src', event.target.result);
			
	var img = $("#badgepreview"); 
	$("<img/>") // Make in memory copy of image to avoid css issues
		.attr("src", $(img).attr("src"))
		.load(function() {
	$("#pixelwidth").val(this.width);   // Note: $(this).width() will not
	$("#pixelheight").val(this.height); // work for in memory images.
	});
  };
  console.log(file);
  reader.readAsDataURL(file);
 
  return false;
};

});

function readFileAsDataURL(file, imageName) {
	
    var reader = new FileReader();
    
    reader.onload = function(event) {
		localStorage[imageName] = 
			event.target.result;
			$('#badgepreview').attr('src', event.target.result);
			$('#holder').css('height',$('#badgepreview').css('height'));
			$('#holder').css('width',$('#badgepreview').css('width'));
			var img = $("#badgepreview"); 
			$("<img/>") // Make in memory copy of image to avoid css issues
			.attr("src", $(img).attr("src"))
			.load(function() {
			$("#pixelwidth").val(this.width);   // Note: $(this).width() will not
			$("#pixelheight").val(this.height); // work for in memory images.
			});
    		
    };
	reader.readAsDataURL(file);
}

function getAsText(fileToRead, localName)
{
       var reader = new FileReader();
       reader.readAsText(fileToRead);
       reader.onload = function(event){                        
            localStorage[localName] = event.target.result;
			
	     createMultipleSelect(event.target.result, 'csvColumnsSelect', 'colselect', 'selected-cols');
		 
		 createMultipleSelect(event.target.result, 'qrCodeSelect', 'qrselect', 'qr-cols');
		 $('#qrCodeSelect').hide();
       };
       reader.onerror = function(event){
            console.log("The Error is"+event.target.error.name);
       };
}

function createMultipleSelect(fileString, placeid, colselectid, localStorageName)
{
	
	csv_text = $.csv2Array(fileString);
	$("#"+placeid).html("<select id="+ colselectid +" multiple='multiple'></select>");
	var i = 0;
	while(i<csv_text[0].length)
	{
		$("#"+colselectid).append('<option value='+i+'>'+csv_text[0][i++]+'</option>');
	}
	$("#"+colselectid).change(function(){        
		localStorage[localStorageName]=$("#"+colselectid).val() || [];;
		});
}


function clear() {
	$("#badgepreview").val("");
	$("#form1").find(':input').each(function() {
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

function move() {
	
	
	localStorage["dimensions"] = $('#pixelwidth').val()+','+$('#pixelheight').val()+','+$('#inchwidth').val()+','+$('#inchheight').val();
	
}
