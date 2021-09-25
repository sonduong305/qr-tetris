document.addEventListener("DOMContentLoaded", () => {
    console.log("123");
})

// TODO: When the submit button is pressed, get the data from input, make a POST request to qr.bysonduong.com/messages/ with body contains {message: "your message"}
async function submit() {
    var message = document.getElementById("message").value;
    var error = document.querySelector("p.error");
    console.log(message)
    url = 'https://qr.bysonduong.com/messages';
    var headers = {
        "Content-Type": "application/json",
        "Access-Control-Origin": "*"
    }
    var mes = {
        "message": message,
    }


    if (message) {
        /*pop_up non message*/
        // Get the modal
        var modal = document.getElementById("myModal");

        // Get the button that opens the modal
        var btn = document.getElementById("submit_button");

        // Get the <span> element that closes the modal
        var span = document.querySelector("#myModal span.close");

        // get the link of QR tetris to play game
        var QRlink = document.querySelector("#myModal a.btn1");

        // When the user clicks on <span> (x), close the modal
        span.onclick = function () {
            console.log("ok");
            modal.style.display = "none";


        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";

            }
        }

        //post data

        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(mes)
        });
        var data = await response.json();

        const link = makeGameURL(data.id);
        QRlink.href = link;
        modal.style.display = "flex ";

        return data;

    } else {
        error.style.display = "block";
    }
}

function makeGameURL(gameID) {
    return `https://bysonduong.com/qr-tetris/game/?id=${gameID}`
}
