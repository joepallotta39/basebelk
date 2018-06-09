const request = require('request');
const _ = require('lodash');
const elastic = require('./elastic');

function getData(context){
    const options = {
		url: process.env.baseballEndpoint,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Token token='+ process.env.baseballToken,
			'Accept': 'application/vnd.stattleship.com; version=1',
		}
	}
	function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			let dataCopy = _.cloneDeep(JSON.parse(body))
			processData(dataCopy, context)
		}
	}
	request(options, callback)
}



function processData(dataCopy, context){

	if (dataCopy === null || dataCopy === undefined){
		throw new Error("No Data")
	}


	dataCopy.games.map(datapoints => {
		let gameObject= {}

		let away_team_id = datapoints.away_team_id
		let away_team_score = datapoints.away_team_score
		let away_team_outcome = datapoints.away_team_outcome
		let awayTeam = _.find(dataCopy.away_teams, {'id':away_team_id})
		let away_team_name = awayTeam.location + " " + awayTeam.nickname

		let home_team_id = datapoints.home_team_id
		let home_team_score = datapoints.home_team_score
		let home_team_outcome = datapoints.home_team_outcome
		let homeTeam = _.find(dataCopy.home_teams, {'id':home_team_id})
		let home_team_name = homeTeam.location + " " + homeTeam.nickname

		let game_label = datapoints.label
		let interval_type = datapoints.interval_type
		let start_time = datapoints.started_at
		let duration = datapoints.duration
		let game_attendance = datapoints.attendance

		gameObject = {game_label, interval_type, start_time, duration, game_attendance, away_team_name, away_team_score, away_team_outcome, home_team_name, home_team_score, home_team_outcome}
		return elastic.postToES(gameObject, context)
	})

}



module.exports = {
	getData
}

