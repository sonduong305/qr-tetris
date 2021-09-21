document.addEventListener("DOMContentLoaded", ()=>{
    console.log("123");
})

// TODO: When the submit button is pressed, get the data from input, make a POST request to qr.bysonduong.com/messages/ with body contains {message: "your message"}
async function submit() {
    var message = document.getElementById("message").value;
    console.log(message)
    url = 'https://qr.bysonduong.com/messages';
    var headers = {
        "Content-Type": "application/json",                                                                                                
        "Access-Control-Origin": "*"
        }
    var body = {
        "message": message,
    }
    
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body:  JSON.stringify(body)
    });
    var data = await response.json();
    console.log(data);
    console.log(makeGameURL(data.id))
    return data;
}

function makeGameURL(gameID) {
    return `https://bysonduong.com/qr-tetris/game/?id=${gameID}`
}