var HTTPS = require('https');
var cool = require('cool-ascii-faces');
var unirest = require('unirest');

var botID = process.env.BOT_ID;
var mashapeKey = process.env.MASHAPE_KEY;

function cardSearch(searchText) {
  var apiUrl = 'https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/' + searchText;
  var apiImgUrl = '';
  unirest.get("https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/{name}")
    .header("X-Mashape-Key", mashapeKey)
    .end(function (result) {
      console.log(result.status);
      console.log(result.headers);
      console.log(result.body);
      apiImgUrl = result.body.img;
    });

  var request = require('request');

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
  }

  request(options, callback);  
}

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = /^\!card$/;
  var searchText;
  var command = request.text.split(' ')[0];
  console.log("req: " + request.text);
  console.log("command: " + command);
  console.log("regex test: " + botRegex.test(command));
  if(request.text && botRegex.test(command)) {
    searchText = request.substr(request.indexOf(' ')+1);
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

  //botResponse = cardSearch(searchText);

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