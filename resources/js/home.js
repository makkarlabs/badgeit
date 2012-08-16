function auth() 
{
        var config = {
          'client_id': '434888942442.apps.googleusercontent.com',
          'scope': 'https://www.googleapis.com/auth/drive'
        };
        gapi.auth.authorize(config, function() {
          	localStorage['accesstoken'] = gapi.auth.getToken().access_token;
		alert("authd");
		location.href="./start.html";
        });

}
