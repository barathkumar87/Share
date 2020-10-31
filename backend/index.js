const mongoose = require('mongoose');
const express = require("express");
const http = require("http");
const { time } = require('console');

let app = express();
app.use(express.json());
mongoose.connect('mongodb://localhost/mongoose_basic', function (err) {
    if (err) throw err;
    console.log("successfully connected");

});
app.use(express.static(__dirname + '/public'));
let shareSchema = mongoose.Schema({
    message: String,
    ttl: Number, //3600
    link: String,
    type: String
});

let share = mongoose.model("share", shareSchema);


app.get("/", function (req, res) {

    console.log(req.body);

    res.sendFile("index.html", { root: './frontend' });

});
// generate random
function generateRand(x) {

    let result = ''
    let availchar = "abcdefghijklmnopqrstuvw0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (i = 0; i < x; i++) {
        result += availchar.charAt(Math.ceil(Math.random() * 62));

    }
    return result;
}

//check if link exists
async function  eckIfLinkExist(random) {

   
  var value =   await share.exists({ link: random });
                   if (value) {
                console.log("FOUND!!!");
             return 1;
            }

            else {
                console.log("NOT FOUND");
                return 0;
            }
            
        }
    


function generateLink() {
    var randiom = generateRand(8);
    if (eckIfLinkExist(randiom)) {
        generateLink();
    }
    else {

        return randiom;
    }

}

app.post("/postData", function (req, res) {

    var jsonData = req.body;

    var link = generateLink();

    //add to db
    var newshare = new share({
        message: jsonData.msg,
        ttl: jsonData.ttl,
        type: jsonData.type,
        link: link
    });
    newshare.save(function (err, kol) {
        if (err) {
            console.log(err);
        }
        else {
            res.json({ link: link })
        }
    });

    console.log(req.body);


});


// display message

app.get('/:link', function (req, res) {

    // console.log("HELO");
var got =  eckIfLinkExist(req.params.link).then(data=>{


        if(data){

            console.log("HELO");

            let timeFound = share.findOne({ link: req.params.link });
    res.send(timeFound);
            console.log(timeFound.ttl);
            var d = new Date();
            d.setSeconds(d.getSeconds() - timeFound);
    
            let data = share.findOne({ $and: [{ link: req.params.link }, { ttl: { $gte: ObjectId(d) } }] });
    
    
            print(data)

        }


}) ;
console.log(got);
    // check if link exists
    if (got== 1) {
       



    }

    // check if ttl is > datatime.now

    // fetch and post data

})

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.listen(3000, "localhost", () => { console.log("Server is up"); });




