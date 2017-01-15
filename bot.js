var HTTPS = require('https');
var cool = require('cool-ascii-faces');
var unirest = require('unirest');
var request = require('request');
var ImageService = require('groupme').ImageService;
var http = require('http');
var fs = require('fs');

var botID = process.env.BOT_ID;
var mashapeKey = process.env.MASHAPE_KEY;

function cardSearch(searchText) {
  var apiUrl = 'https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/' + searchText + '?collectible=1';
  var apiImgUrl = '';
  unirest.get(apiUrl)
    .header("X-Mashape-Key", mashapeKey)
    .end(function (result) {
      console.log(result.status);
      console.log(result.body);
      console.log("test: " +result.body[0].img);
      apiImgUrl = result.body[0].img;
      console.log("apiImgUrl: ");
      console.log(apiImgUrl);
      var file = fs.createWriteStream("file.png");
      var imgRequest = http.get(apiImgUrl, function(response) {
        response.pipe(file);
      });
      ImageService.post(
        file, 
          function(err,ret) {
            if (err) {
              console.log(err)
            } else {
              console.log(ret); 
            }
          });
        });

}

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = /^\!card$/;
  var searchText;
  var command = request.text.split(' ')[0];
  if(request.text && botRegex.test(command)) {
    searchText = request.text.substr(request.text.indexOf(' ')+1);
    this.res.writeHead(200);
    postMessage(searchText);
    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessage(searchText) {
  var botResponse, options, body, botReq;

  cardSearch(searchText);

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : 'test'
  };

  console.log('sending ' + 'botResponse' + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}


exports.respond = respond;