var request = require("request");

let msgData = JSON.stringify({
    Image: "/imageDATA/VG_100K/2.jpg",
    Question: "what color is the car"
}); 
request({
    method: "post",
    body: msgData,
    uri: 'https://xai.nautilus.optiputer.net/Predict',
    headers: {
        "Content-Type": "application/json"
    }
}, function (err, resp, body) {
    let b = JSON.parse(body);
    console.log(b.htmpRGB);
    texture = `data:text/plain;base64,${b.htmpRGB}`
})

