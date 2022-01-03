import SpotifyWebApi from 'spotify-web-api-node';
import express from 'express';
let token = "";
import { PuppeteerBlocker } from '@cliqz/adblocker-puppeteer';
import * as config from './config.js';
const app = express();
const server = app.listen(8888, () =>
console.log(
  'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
)
);
import fs from 'fs';
import path from 'path';
const __dirname = path.join(path.dirname(decodeURI(new URL(import.meta.url).pathname))).replace(/^\\([A-Z]:\\)/, "$1");
import request from 'request';
import fetch from 'node-fetch';
import FormData from 'form-data';
import puppeteer from 'puppeteer';
const {fxp_username, fxp_password, spotify_clientId, spotify_clientSecret, spotify_redirectUri} = config.default;

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
  ];
  
var spotifyApi = new SpotifyWebApi({
    clientId: spotify_clientId,
    clientSecret: spotify_clientSecret,
    redirectUri: spotify_redirectUri
  });  
  app.get('/login', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
  });
  
  app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;
  
    if (error) {
      console.error('Callback Error:', error);
      res.send(`Callback Error: ${error}`);
      return;
    }
  
    spotifyApi
      .authorizationCodeGrant(code)
      .then(data => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];
  
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);  
        token = access_token;
        res.send('Success! You can now close the window.');
  
        setInterval(async () => {
          const data = await spotifyApi.refreshAccessToken();
          const access_token = data.body['access_token'];
          token = access_token
          spotifyApi.setAccessToken(access_token);
        }, expires_in / 2 * 1000);
      })
      .catch(error => {
        console.error('Error getting Tokens:', error);
        res.send(`Error getting Tokens: ${error}`);
      });
  });

spotifyApi.setAccessToken(token);

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

let prevSong;

async function getCurrentSong() {
  if(!token) {
    return console.log("Open your browser at http://localhost:8888/login and come back here.");
  }
    const data = await spotifyApi.getMyCurrentPlaybackState();
    if(!data.body.item) return;
    var songName = data.body.item.name;
    if(!prevSong) prevSong = songName;
    else if(prevSong == songName) return;
    prevSong = songName;
    console.log(songName);
    console.log(data.body.item.album.images[1].url);
    download(data.body.item.album.images[1].url, 'image.png', function(){
        console.log('done downloading');
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const browser = await puppeteer.launch(); ;
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
        blocker.enableBlockingInPage(page);
      });
      let body1 = new FormData;
      // append file to form data
      body1.append('fileToUpload', fs.createReadStream(path.join(__dirname, "image.png"), 
      {
          contentType: 'image/png', filename: 'image.png'
  }));
      let reqImg1 = await fetch("https://api.imagesup.co/u", { method: "POST", body: body1,});
      let resImg1 = await reqImg1?.text();
      if(!resImg1) return;
      if(resImg1 == "Invalid file format.") {
        prevSong = "";
        getCurrentSong();
        return;
      };
      resImg1 = JSON.parse(resImg1);
      let ImgUrl = await resImg1.image_link.replace("i.imagesup.co", "profile.fcdn.co.il");
  
    await page.goto("https://www.fxp.co.il/member.php?u=1195305");
    console.log("=======================");
    console.log(`loging in to ${fxp_username}...`);
   await  page.evaluate(async (fxp_username, fxp_password) => {
        const form = new FormData();
        form.append("vb_login_username", fxp_username);
        form.append("vb_login_password", fxp_password);
        form.append("loginbtn","%D7%94%D7%AA%D7%97%D7%91%D7%A8%D7%95%D7%AA&s");
        form.append("to_homepage", "1");
        form.append("securitytoken", "guest");
        form.append("do", "login");
        form.append("cookieuser", "1");
        form.append("vb_login_md5password", "");
        form.append("vb_login_md5password_utf", "");
        await fetch( "/login.php?do=login", {
            "body": form,
            "method": "POST",
          });
    
    }, fxp_username, fxp_password);
    console.log("Logged in successfully!");
    console.log("=======================");


    await page.reload();
    console.log("updating your profile...");
    await page.evaluate((ImgUrl, songName) => {
        let body = new FormData;
        body.append("do", "update_profile_pic");
        body.append("profile_url", ImgUrl);
        body.append("user_id", "1195305");
        body.append("securitytoken", SECURITYTOKEN);
        fetch("/private_chat.php",{ method: "POST", body })

        body = new FormData;
        body.append("securitytoken", SECURITYTOKEN);
        body.append("do", "saveuserfield");
        body.append("fieldid", "1");
        body.append("userfield[field1_set]", "1");
        body.append("userfield[field1]", "currently playing: " + songName);

        fetch("https://www.fxp.co.il/ajax.php", {"method": "POST", body});
    }, ImgUrl, songName);
    await page.reload();
    await browser.close();
    console.log("done!");
    console.log("=======================");
};

setInterval(getCurrentSong, 5000);