# Update your profile by the song your are listening on spotify!
This code updates your fxp's by your current song you play on spotify!


# How to use?

1. Open terminal and type <code>git clone https://github.com/avishaiDV/fxp_spotify_profile.git </code>
2. <code>cd fxp_spotify_profile</code>
3. Create a spotify application [here](https://developer.spotify.com/dashboard/applications).
4. Select "Edit settings" and in "Redirect URIs" type: <code>http://localhost:8888/callback</code>
6. Grab your cliend secret + cliend id from "users and access" and open config.js file and edit your info:
```js
export default {
    fxp_username: "", // Your fxp username
    fxp_password: "", // Your fxp password
    spotify_clientId: "", // Spotify cliend id
    spotify_clientSecret: "", // Spotify cliend secret 
    spotify_redirectUri: "http://localhost:8888/callback"
}
```
7. <code>npm i</code>
8. <code>node .</code>
9. Start listening to music and have fun! 🎧🎶😃
