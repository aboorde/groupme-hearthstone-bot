var HTTPS = require('https');
var unirest = require('unirest');

var botID = process.env.BOT_ID;
var mashapeKey = process.env.MASHAPE_KEY;

var apiImgUrl = '';

function cardSearch(searchText) {
  var apiUrl = 'https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/' + searchText + '?collectible=1';
  unirest.get(apiUrl)
    .header("X-Mashape-Key", mashapeKey)
    .end(function (result) {
      apiImgUrl = result.body[0].img;
      postMessage();
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
    cardSearch(searchText);
    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessage() {
  var options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : apiImgUrl
  };

  console.log('sending ' + apiImgUrl + ' to ' + botID);

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