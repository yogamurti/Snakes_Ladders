import { Mongo } from 'meteor/mongo';

PlayersList = new Mongo.Collection('players'); // 4 players (Adam, Ben, Charles, Danny)
SnakesList = new Mongo.Collection('snakes'); // 2 snakes (20 leads to 10 and 80 leads to 70)
LaddersList = new Mongo.Collection('ladders'); // 2 ladders (40 leads to 45 and 60 leads to 65)