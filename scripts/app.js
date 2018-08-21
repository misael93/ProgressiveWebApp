(function () {
    'use strict';

    var app = {
        api_key: '4ef182c66bf144009785ccf3c51389f2',
        data: [],
        loader: document.querySelector('.loader'),
        matchesContainer: document.querySelector('.matches-container'),
        matchTmp: document.querySelector('.match-data'),
        selectMatchday: document.querySelector('select[name="matchday"]'),
        currentMatchday: '1',
        update: document.querySelector('.update'),
        title: document.querySelector('.title'),
        lastUpdate: document.querySelector('.last-update')
    }

    /*Load the matches from the given matchday.
    Fetch them from the cache or the API*/
    app.loadMatches = matchday => {

        var url = 'https://api.football-data.org/v2/competitions/2021/matches?matchday=' + matchday;

        // Check if the matches are cached
        if ('caches' in window) {
            caches.match(url)
                .then(response => {
                    if (response) {
                        response.json().then(function updateFromCache(json) {
                            app.dry(json.matches, false);
                            app.displayMatches(matchday);
                        });
                    }
                });
        }

        // Get matches from API
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let matches = JSON.parse(this.response).matches;
                app.dry(matches, true);
                app.displayMatches(matchday);
            }
        }
        xhttp.open('GET', url, true);
        xhttp.setRequestHeader('X-Auth-Token', app.api_key);
        xhttp.send();

        app.dry = (matches, isUpdate) => {
            let matchdayExists = app.data.find(x => x.matchday === matchday);
            if (matchdayExists) {
                matchdayExists.matches = matches;
                if (isUpdate) {
                    matchdayExists.updatedAt = new Date();
                }
            } else {
                app.data.push({
                    matchday: matchday,
                    matches: matches,
                    updatedAt: new Date()
                });
            }
        }

    }

    /*Display the matches from the given matchday*/
    app.displayMatches = matchday => {
        let matchdayExists = app.data.find(x => x.matchday === matchday);
        if (matchdayExists) {
            app.title.innerHTML = `Matchday ${matchday}`;
            app.lastUpdate.innerHTML = 'Last update: ' + new Date(matchdayExists.updatedAt)
                .toLocaleString('en-US', { timeZone: 'America/Chicago' });
            let matches = matchdayExists.matches;
            app.matchesContainer.innerHTML = '';
            matches.forEach(match => {
                var matchTemplate = app.matchTmp.content.cloneNode(true);
                matchTemplate.querySelector('.date').innerHTML = new Date(match.utcDate).toLocaleString('en-US', { timeZone: 'UTC' });
                matchTemplate.querySelector('.status').innerHTML = match.status;
                let srcHomeTeam = app.getTeamNameForImage(match.homeTeam.name);
                matchTemplate.querySelector('.imgHomeTeam').src = `./images/${srcHomeTeam}.svg`;
                matchTemplate.querySelector('.nameHomeTeam').innerHTML = app.getFixedTeamName(match.homeTeam.name);
                matchTemplate.querySelector('.scoreHomeTeam').innerHTML = match.score.fullTime.homeTeam;
                let srcAwayTeam = app.getTeamNameForImage(match.awayTeam.name);
                matchTemplate.querySelector('.imgAwayTeam').src = `./images/${srcAwayTeam}.svg`;
                matchTemplate.querySelector('.nameAwayTeam').innerHTML = app.getFixedTeamName(match.awayTeam.name);
                matchTemplate.querySelector('.scoreAwayTeam').innerHTML = match.score.fullTime.awayTeam;
                app.matchesContainer.appendChild(matchTemplate);
            });
        }
    }

    app.update.addEventListener('click', () => {
        app.loadMatches(app.currentMatchday);
    });

    app.selectMatchday.addEventListener('change', (e) => {
        let matchday = e.target.value;
        app.currentMatchday = matchday;
        app.loadMatches(matchday);
    })

    app.init = () => {
        app.currentMatchday = 1;
        app.loadMatches(1);
    }

    app.init();

    app.getFixedTeamName = name => {
        return name.replace(' FC', '');
    }

    app.getTeamNameForImage = name => {
        return name.replace(/[^\w]/g, '').toLowerCase();
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registered', registration.scope);
            })
    }

})();
