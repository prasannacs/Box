public class JWTConnection {
    private String enterpriseId = '616157';
    private String publicKeyId = 'guhvo5vi';
    private String privateKey = '';
    private String clientId = 'ostkg0vclqzee2j5l5ketncrctah2nn0';
    private String clientSecret = 'psqn9Ih7I1HcbNwTsnDphKHAemw6mHSn';
    private BoxPlatformApiConnection api;
    
    public String token { get; set; }
    public String folderName { get; set; }
    
    public JWTConnection() {
        BoxJwtEncryptionPreferences preferences = new BoxJwtEncryptionPreferences();
        preferences.setPublicKeyId(this.publicKeyId);
        preferences.setPrivateKey(this.privateKey);
        api = BoxPlatformApiConnection.getAppEnterpriseConnection(this.enterpriseId, this.clientId, this.clientSecret, preferences);
        token = downscopeToken(api.getAccessToken());
    }
    
    public void createFolder() {
        BoxFolder parentFolder = new BoxFolder(api, '0');
		BoxFolder.Info childFolderInfo = parentFolder.createFolder(folderName);
    }
    
    public String getToken() {
        return token;
    }
    
    private String downscopeToken(String token) {
		String accessToken;
        String scopes = 'base_explorer item_download item_upload item_preview item_rename item_share item_delete';
        String endpoint = 'https://api.box.com/oauth2/token';
        String body = 'scope=' + scopes +
        	'&grant_type=urn:ietf:params:oauth:grant-type:token-exchange' +      
       		'&subject_token=' + token +
       		'&subject_token_type=urn:ietf:params:oauth:token-type:access_token';

        // format Box API request to downscope token
    	HttpRequest request = new HttpRequest();
        request.setMethod('POST');
        request.setEndpoint(endpoint);
        request.setBody(body);
        
        //Create Http, send request
	    Http http = new Http();
    	HTTPResponse response = http.send(request);
        String resBody = response.getBody();
        System.debug('Body of refresh response: ' + resBody);
        
        //loop through tokens to be parsed, save access token
        JSONParser parserTokens = JSON.createParser(resBody);
    	while (parserTokens.nextToken() != null){
      
          if (parserTokens.getCurrentToken() == JSONToken.FIELD_Name &&
          		parserTokens.getText() == 'access_token'){
            parserTokens.nextToken();
            //save access token
            accessToken = parserTokens.getText();
          }
    	}
        
        return accessToken;        
    }
}
