var HTTPS = require('https');
var cool = require('cool-ascii-faces');
var unirest = require('unirest');
var request = require('request');

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

var headers = {
    'X-Access-Token': botID,
    'Content-Type': 'image/png'
  };

  var options = {
    url: 'https://image.groupme.com/pictures',
    method: 'POST',
    headers: headers,
    body: apiImgUrl
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("groupme img url")
      console.log(body);
    }
    else {
      console.log("error in img service");
      console.log("error");
      console.log(error);
      console.log(response);
      console.log(body);
    }
  }
  console.log('boop');
  request(options, callback); 

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