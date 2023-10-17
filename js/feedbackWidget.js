let fbw = null;

$(function () {
    console.log("ready!");
    fbw = new FeedbackWidget('feedback-success');


    $("#OKKnop").on("click", function () {
        fbw.show("gelukt", "success");
        alert("The button was clicked.");
        // fbw.show("Dit is een bericht", "success");
        $('#fbw').addClass('fade-in-fbw2')
        $("#fbw").style.display = "none";
    });

    $(function () {
        Game.init(afterInit);
    });
});

class FeedbackWidget {
    constructor(elementId) {
        this._elementId = elementId;
    }

    get elementId() { //getter, set keyword voor setter methode
        return this._elementId;
    }

    show(message, type) {
        let x = 0;

        if (type === "success") {
            x = $("#feedback-" + type)[0];
            $(x).addClass('alert alert-success');
        } else if (type === "danger") {
            x = $("#feedback-" + type)[0];
            $(x).addClass('alert alert-danger');
        } else {
            x = $("#feedback-danger")[0];
        }

        x.style.display = "block";
        $(x).text(message);

        let messageObject = {message: message, type: type}
        this.log(messageObject)
    }

    hide(elementId) {
        var x = document.getElementById(elementId);
        x.style.display = "none";
    }

    log(message) {
        let localStorageArray = [];
        if (localStorage.length < 1) {
            localStorageArray.push(message);
            localStorage.setItem(1, JSON.stringify(localStorageArray));
        } else {
            localStorageArray = JSON.parse(localStorage.getItem(1));
            if (localStorageArray.length >= 10) {
                localStorageArray.shift();
            }
            localStorageArray.push(message);
            localStorage.clear();
            localStorage.setItem(1, JSON.stringify(localStorageArray));
        }
    }

    removeLog(key) {
        localStorage.clear();
    }

    history() {
        let localStorageArray = [];
        let output = "";
        if(localStorage.length > 0){
            localStorageArray = JSON.parse(localStorage.getItem(1));
            for (let i = 0; i < localStorageArray.length; i++) {
                output += `
                ${localStorageArray[i].type} - ${localStorageArray[i].message}
                `;
            }
        }
        fbw.show(output, "success");
        // return output;
    }

}