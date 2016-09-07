import {Template} from 'meteor/templating';
import '../imports/collections.js';
import './main.html';

function snakes(){
	var snakes=[];
	for (var i=0;i<SnakesList.find({}).count();i++){
		snakes.push(SnakesList.find({}).fetch()[i])
	}
	return snakes;
}

function ladders(){
	var ladders=[];
	for (var i=0;i<LaddersList.find({}).count();i++){
		ladders.push(LaddersList.find({}).fetch()[i])
	}
	return ladders;
}

function people(){
	var ppl=[];
	for (var i=0;i<PlayersList.find({}).count();i++){
		ppl.push(PlayersList.find({}).fetch()[i].name)
	}
	return ppl;
}

function scores(){
	var scores=[];
	for (var i=0;i<PlayersList.find({}).count();i++){
		scores.push(PlayersList.find({}).fetch()[i].score)
	}
	return scores;
}

Template.scoreBoard.helpers({
	players(){
		return PlayersList.find({});
	},

	checkTurn(turn){
		return turn==="Y";
	}
})

Template.roll.events({
	'click'(event){
		var Player=PlayersList.findOne({turn:"Y"}); // only 1 person will have a turn
		// dice roll
		var dice=Math.floor(Math.random() * 6) + 1;
		// ensure that the potentialScore(Player's potential score after rolling the dice) is not the same score as another player, otherwise the player has to roll again
		var duplicate=false;
		var potentialScore=Player.score+dice;
		var scr=scores();
		for (var i=0;i<scr.length;i++){
			if (potentialScore===scr[i]){
				document.getElementById("instructions").innerHTML=Player.name+" rolled a "+dice.toString()+". Please roll again as your score overlaps with "+people()[i]+"'s score.";
				duplicate=true;
			}
		}
		// If the potentialScore is not the same score as another player, end turn for Player and show his new score
		if (duplicate===false){
			// check if the player lands on a snake or ladder
			var lands=false;
			var snk=snakes();
			var ldr=ladders();
			// check for snakes
			for (var i=0;i<snk.length;i++){
				if (potentialScore===snk[i].start){
					document.getElementById("instructions").innerHTML=Player.name+" moves "+dice.toString()+" step(s) forward but lands on a snake. Go back to "+snk[i].end.toString()+".";
					PlayersList.update({ _id: Player._id}, {$set: {score: snk[i].end} });
					lands=true;
					break;
				}
			}
			// check for ladders (a space will not have multiple snakes or ladders starting or ending on it)
			for (var i=0;i<ldr.length;i++){
				if (potentialScore===ldr[i].start){
					document.getElementById("instructions").innerHTML=Player.name+" moves "+dice.toString()+" step(s) forward and lands on a ladder. Climb to "+ldr[i].end.toString()+".";
					PlayersList.update({ _id: Player._id}, {$set: {score: ldr[i].end} });
					lands=true;
					break;
				}
			}
			// if the player does not land on a snake or ladder
			if (lands===false){
				document.getElementById("instructions").innerHTML=Player.name+" moves "+dice.toString()+" step(s) forward.";
				PlayersList.update({ _id: Player._id}, {$inc: {score: dice} });
			}
			// end Player's turn
			Player=PlayersList.findOne({turn:"Y"}); // Update the Player variable's score
			PlayersList.update({ _id: Player._id}, {$set: {turn: "N"} });
			// if the Player scores >=100, end the game (roll button will no longer work as it will be nobody's turn afterwards)
			if (Player.score>=100){
				document.getElementById("congratulations").innerHTML="Congratulations "+Player.name+". You have won!"
			}
			// If the player did not score >=100 yet, go to the next player
			else{
				var ppl=people();
				var index=ppl.indexOf(Player.name)+1;
				if (index===4){ // go back to first person once the last person has done rolling
					index=0;
				}
				var nextPlayerName=ppl[index];
				var nextPlayerId=PlayersList.findOne({name:nextPlayerName})._id; // no duplicate names
				PlayersList.update({ _id: nextPlayerId}, {$set: {turn: "Y"} });
			}
		}
	}
})

Template.reset.events({
	'click'(event){
		for (var i=0;i<PlayersList.find({}).count();i++){ // no duplicate names
			var ppl=people();
			var id=PlayersList.findOne({name:ppl[i]})._id;
			PlayersList.update({ _id: id}, {$set: {turn: "N"} });
			PlayersList.update({ _id: id}, {$set: {score: 0} });
		}
		var first_id=PlayersList.findOne()._id; // 1st person in the collection to go 1st
		PlayersList.update({ _id: first_id}, {$set: {turn: "Y"} });
		document.getElementById("congratulations").innerHTML="";
		document.getElementById("instructions").innerHTML="";
	}
})