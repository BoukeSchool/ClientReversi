//for signalr
"use strict";

let spelToken

//welke kleur deze speler is. 1 is wit, 2 is zwart
let kleur = 1

//wie er aan de beurt is
let spelBeurt = 2

let connection = new signalR.HubConnectionBuilder().withUrl("/signalRHub").build();


//wordt elke keer aangeroepen wanneer er een zet wordt gedaan
connection.on("ReceiveMessage", function (success, result) {

    if (success) {
        Game.Reversi.updateBord().then((winnendeSpeler) => {
            if (result === '"Done"') {
                //0 = gelijk, 1 = gewonnen, 2 = verloren
                let eindeSpelTekst = "Je hebt verloren :("
                let gewonnen = 2
                if (winnendeSpeler === kleur) {
                    gewonnen = 1
                    eindeSpelTekst = "Je hebt gewonnen!"
                } else if (winnendeSpeler === 0) {
                    gewonnen = 0
                    eindeSpelTekst = "Je hebt gelijk gespeeld..."
                }

                $("#bord").addClass("blur")
                //document.getElementById("TerugKnop").style.display = "block"
                document.getElementById("tellen").textContent = `The game has ended. ${eindeSpelTekst}`
                connection.invoke("EndGame", spelToken, gewonnen).catch(function (err) {
                    return console.error(err.toString());
                })
            }
        })
    } else {
        alert("This move is not possible")
    }
});

connection.on("UpdateConnectedUsers", function (users) {
    Game.Reversi.updateUserListUI(users);
});

connection.start().then(function () {
    connection.invoke("JoinRoom", spelToken).catch(function (err) {
        return console.error(err.toString());
    })
    console.log("connection is gestart")
    connection.invoke("GetConnectedUsers").then(function (users) {
        Game.Reversi.updateUserListUI(users);
    });
}).catch(function (err) {
    return console.error(err.toString());
});

//----------------------------------------------------------------------------------------
const Game = (function (url) {

    //Configuratie en state waarden
    let configMap = {
        apiUrl: url
    }

    const _getCurrentGameState = function () {
        Game.Model.getGameState();
    }

    // Private function init
    const privateInit = function (callback) {
        callback();
        window.setInterval(_getCurrentGameState, 5000);
    }

    // Waarde/object geretourneerd aan de outer scope
    return {
        init: privateInit
    }
})("/api/url");

//----------------------------------------------------------------------------------------
Game.Reversi = (function () {

    //Configuratie en state waarden
    let configMap = {
        apiUrl: "/api/url"
    }

    function updateUserListUI(users){
        document.getElementById("speler1").textContent = users[0]
        users.length > 1 ?
            document.getElementById("speler2").textContent = users[1]
            : document.getElementById("speler2").textContent = "-"
        console.log("dit: " + users[0])
    }

    function handleLeaveClick(event) {

    }

    const updateBord = () => {
        return new Promise((resolve, reject) => {
            fetch(`https://localhost:5001/api/Spel/Bord/${spelToken}`).then((response) => {
                response.json().then((response) => {
                    resolve(Game.Template.parseTemplate("speelbord", response))
                    let witteTegelTeller = 0;
                    let zwarteTegelTeller = 0;
                    let rijteller = 0;
                    response.forEach(item => {
                        let kolomteller = 0;
                        item.forEach(item => {
                            if (item !== 0) {

                                let element = document.getElementById(`${rijteller},${kolomteller}`)
                                if (element.classList.contains("fiche")) {
                                    if (element.classList.contains("fiche-wit")) {
                                        element.classList.remove("fiche-wit")
                                    } else if (element.classList.contains("fiche-zwart")) {
                                        element.classList.remove("fiche-zwart")
                                    }
                                } else {
                                    element.classList.add("fiche")
                                }
                                if (item === 1) {
                                    witteTegelTeller++
                                    element.classList.add("fiche-wit")
                                } else {
                                    zwarteTegelTeller++
                                    element.classList.add("fiche-zwart")
                                }
                            }
                            kolomteller++
                        })
                        kolomteller = 0;
                        rijteller++
                    })


                    beurtWisselen(witteTegelTeller + zwarteTegelTeller)
                    if (witteTegelTeller > zwarteTegelTeller) {
                        resolve(1)
                    }
                    if (zwarteTegelTeller > witteTegelTeller) {
                        resolve(2)
                    } else {
                        resolve(0)
                    }
                })
            })
        })

    }

    let beurtWisselen = function (tegelTeller) {

        showRandomFact();
        //beurt checken zonder extra api call:
        if (tegelTeller % 2 === 0) {
            spelBeurt = 2
            document.getElementById("tellen").textContent = "Black's turn"
        } else {
            spelBeurt = 1
            document.getElementById("tellen").textContent = "White's turn"
        }


        const tegels = document.querySelectorAll('.tegel');

        if (kleur === spelBeurt) {

            tegels.forEach(box => {
                box.classList.remove("alert-danger")
                box.addEventListener('click', handleClick);
            });
        } else {
            tegels.forEach(box => {
                box.classList.add("alert-danger")
                box.removeEventListener("click", handleClick)
            });
        }
    }

    let showRandomFact = function() {
        Game.API.getRandomFact().then(function(result) {
            let template = spa_templates.templates.factSection.body({fact: result})

            document.getElementById("factSection").innerHTML = template;

        });
    }

    let showFiche = function (event) {
        let element = document.getElementById(`${event.target.id}`)

        connection.invoke("SendMessage", parseInt(element.id.charAt(0)), parseInt(element.id.charAt(2)), spelToken).catch(function (err) {
            return console.error(err.toString());
        });
        event.preventDefault();
    }

    // Private function init
    const privateInit = function () {

    }

    // Waarde/object geretourneerd aan de outer scope
    return {
        init: privateInit,
        updateUserListUI: updateUserListUI,
        showFiche: showFiche,
        updateBord: updateBord,
        beurtWisselen: beurtWisselen,
        showFact: showRandomFact
    }
})();

//----------------------------------------------------------------------------------------
Game.Data = (function () {

    const configMap = {
        apiKey: "b189064592c4aa29542c06d758465933",
        mock: [
            {
                url: "/api/Spel/Beurt",
                data: 0
            }
        ]
    }

    let stateMap = {environment: 'production'}

    const getMockData = function (url) {
        const mockData = configMap.mock;

        return new Promise((resolve, reject) => {
            resolve(mockData);
        });
    }

    const get = function (url) {

        if (stateMap.environment === "development") {
            return getMockData(url);
        } else if (stateMap.environment === "production") {
            return new Promise((resolve, reject) => {

                let request = new XMLHttpRequest();
                request.open("GET", url);
                request.send();
                request.onload = () => {
                    if (request.status === 200) {
                        let response = JSON.parse(request.response)
                        resolve(response)
                    } else {
                        console.log(`error ${request.status} ${request.statusText}`)
                        reject()
                    }
                }
            })
        }

    }

    const privateInit = function (environment) {
        stateMap.environment = environment;
        if (environment !== "production" && environment !== "development") {
            new Error("Environment should be either production or development")
        } else {
            get(url);
        }
    }

    // Waarde/object geretourneerd aan de outer scope
    return {
        init: privateInit,
        get: get
    }
})();

//----------------------------------------------------------------------------------------
Game.Model = (function () {

    let configMap = {
        apiUrl: "/api/url"
    }

    const _getGameState = function () {
        Game.Data.get(`https://localhost:5001/api/Spel/Beurt/${spelToken}`).then(
            function (response) {
                if (response !== 0 && response !== 1 && response !== 2) {
                    throw new Error("The token is out of bounds");
                } else {
                    console.log(`aan de beurt: ${response}`);
                }
            }
        )


    }
    const privateInit = function () {
        //console.log(configMap.apiUrl);
    }

    // Waarde/object geretourneerd aan de outer scope
    return {
        init: privateInit,
        getGameState: _getGameState
    }
})();
//----------------------------------------------------------------------------------------
Game.Template = (function () {

    const _getTemplate = function (templateName) {
        return spa_templates.templates.speelbord.body()
    }

    const _parseTemplate = function (templateName, data) {
        let templateInfo = _getTemplate(templateName);
        let template = Handlebars.compile(templateInfo);

        let rijen = new Array(8);

        for (let i = 0; i < rijen.length; i++) {
            rijen[i] = new Array(8)
        }


        let witteTegelTeller = 0;
        let zwarteTegelTeller = 0;
        let rijteller = 0;
        data.forEach(rij => {
            let kolomteller = 0;
            rij.forEach(kolom => {
                let nieuwFiche = {
                    id: 0,
                    kleur: "tegel"
                }
                if (kolom !== 0) {
                    if (kolom === 1) {
                        witteTegelTeller++
                        nieuwFiche.kleur = "fiche fiche-wit"
                    } else {
                        zwarteTegelTeller++
                        nieuwFiche.kleur = "fiche fiche-zwart"
                    }
                }
                nieuwFiche.id = `${rijteller},${kolomteller}`

                rijen[rijteller][kolomteller] = nieuwFiche
                kolomteller++
            })
            rijteller++
        })



        let templateData = {
            rij0 : rijen[0],
            rij1 : rijen[1],
            rij2 : rijen[2],
            rij3 : rijen[3],
            rij4 : rijen[4],
            rij5 : rijen[5],
            rij6 : rijen[6],
            rij7 : rijen[7],
        };


        let html = spa_templates.templates.speelbord.body({
                rij0: rijen[0],
                rij1: rijen[1],
                rij2: rijen[2],
                rij3: rijen[3],
                rij4: rijen[4],
                rij5: rijen[5],
                rij6: rijen[6],
                rij7: rijen[7],
            }
        )

        document.getElementById("contentDiv").innerHTML = html;



        Game.Stats.updateChart(witteTegelTeller, zwarteTegelTeller)

        Game.Reversi.beurtWisselen(witteTegelTeller + zwarteTegelTeller)
        if (witteTegelTeller > zwarteTegelTeller) {
            return 1
        }
        if (zwarteTegelTeller > witteTegelTeller) {
            return 2
        } else {
            return 0
        }




    }
    // Waarde/object geretourneerd aan de outer scope
    return {
        parseTemplate: _parseTemplate,
        getTemplate: _getTemplate
    }
})();

Game.API = (function () {

    const _getRandomFact = function () {
        return Game.Data.get("https://uselessfacts.jsph.pl/random.json?language=en")
            .then(data => {
                return data.text
            })
            .catch(e => {
                console.log(e.message);
            });
    }

    const privateInit = function () {

    }

    // Waarde/object geretourneerd aan de outer scope
    return {
        init: privateInit,
        getRandomFact: _getRandomFact,
    }
})();

Game.Stats = (function () {
    const configMap = {
        apiKey: "",
    }

    let myChart
    const makeChart = function (wit, zwart, labels) {
        const ctx = document.getElementById('myChart').getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Aantal fiches wit',
                        data: wit,
                        borderColor: 'rgba(220, 220, 255, 0.8)',
                        borderWidth: 1
                    },
                    {
                        label: 'Aantal fiches zwart',
                        data: zwart,
                        borderColor: 'rgba(4, 30, 4, 0.2)',
                        borderWidth: 1
                    }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }


    const privateInit = function () {
        document.getElementById("myChart").innerHTML = makeChart([2], [2], ['Begin']);
    }

    const updateChart = function (wit, zwart) {
        let label = "Zet " + myChart.data.labels.length
        myChart.data.labels.push(label)
        myChart.data.datasets[0].data.push(wit);
        myChart.data.datasets[1].data.push(zwart);
        myChart.update();
    }

    // Waarde/object geretourneerd aan de outer scope
    return {
        init: privateInit,
        updateChart: updateChart
    }
})();