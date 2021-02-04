const msalConfig = {
    auth: {
        clientId: "1080caff-ccbc-4f86-af01-e7fb4e0c0cb3", //1080caff-ccbc-4f86-af01-e7fb4e0c0cb3 5f955e99-b9da-45c3-8ca9-4ff578e69828
        authority: "https://login.microsoftonline.com/practee.com",
        redirectUri: "http://localhost:3000/",
        postLogoutRedirectUri: "http://localhost:3000/",
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
const loginRequest = {
    scopes: ["openid", "profile", "User.Read"]
};

// Add here scopes for access token to be used at MS Graph API endpoints.
const tokenRequest = {
    scopes: ["Mail.Read"]
};