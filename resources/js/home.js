function auth() 
{
        var config = {
          'client_id': '434888942442.apps.googleusercontent.com',
          'scope': 'https://www.googleapis.com/auth/drive https://docs.google.com/feeds https://spreadsheets.google.com/feeds'
        };
        gapi.auth.authorize(config, function() {
		console.log(gapi.auth.getToken());
          	localStorage['accesstoken'] = gapi.auth.getToken().access_token;
		alert("authd");
		//location.href="./start.html";
        });

}
