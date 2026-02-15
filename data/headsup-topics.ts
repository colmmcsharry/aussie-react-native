/**
 * Heads Up game words. Sourced from slang-src/headsupwords.js
 */

export type HeadsUpTopicId = 'easy' | 'hard' | 'xxx';

export const HEADSUP_TOPIC_META: Record<
  HeadsUpTopicId,
  { label: string; emoji: string }
> = {
  easy: { label: 'Easy', emoji: '🇦🇺' },
  hard: { label: 'Hard', emoji: '🦘' },
  xxx: { label: 'XXX', emoji: '🔞' },
};

export const HEADSUP_EASY_WORDS = [
  "G'day", "Arvo", "Bogan", "Esky", "Bottle-O", "Macca's", "Bunnings",
  "Vegemite", "Fair dinkum", "No worries", "Good on ya", "Thongs", "Ute",
  "Footy", "NRL", "AFL", "Sydney Opera House", "Bondi Beach", "The Harbour Bridge",
  "Uluru", "The Outback", "Great Barrier Reef", "Kangaroo", "Koala", "Platypus",
  "Tim Tams", "Meat Pie", "Lamington", "Pavlova", "Sausage Sizzle", "ANZAC Day",
  "Bathers", "Smoko", "The Ashes", "Barbie", "Surf's up", "Gold Coast",
  "Darwin Stubby", "Queensland", "Victoria", "Tasmania", "Western Australia",
  "South Australia", "Northern Territory", "New South Wales", "Canberra",
  "Melbourne Cup", "The Wiggles", "Steve Irwin", "Crocodile Dundee", "Ned Kelly",
  "Home and Away", "Neighbours", "AC/DC", "INXS", "Kylie Minogue", "Chris Hemsworth",
  "Margot Robbie", "Hugh Jackman", "Cate Blanchett", "Nicole Kidman", "Russell Crowe",
  "Rebel Wilson", "Delta Goodrem", "Shane Warne", "Don Bradman", "Cathy Freeman",
  "Ian Thorpe", "Ash Barty", "Matildas", "Wallabies", "Socceroos", "State of Origin",
  "Triple J", "Schoolies", "Tradie", "Servo", "Op Shop", "Pokies", "The Bush",
  "Outback Steakhouse", "QLD Maroons", "NSW Blues", "Cronulla Sharks", "Collingwood Magpies",
  "Fremantle Dockers", "The Gabba", "MCG", "The Ghan", "The Big Banana", "The Big Pineapple",
  "The Big Prawn", "Summer Bay", "Bondi Rescue", "MasterChef Australia", "Sausage Roll",
  "Hungry Jack's", "Cherry Ripe", "Milo", "Aerogard", "Slip Slop Slap", "School of the Air",
];

export const HEADSUP_HARD_WORDS = [
  "Drongo", "Yobbo", "Dag", "Dunny", "Durry", "Stubby Holder", "Chook", "Ripper",
  "True Blue", "Rooted", "Crook", "Bludger", "Seppo", "Straya", "Larrikin", "Trackie Dacks",
  "Mozzie", "Tradie Crack", "Tall Poppy", "Togs", "Hoon", "Woopsie Woo", "Bingle",
  "Tallie", "Bottlebrush", "Bluey", "Banana Bender", "Sandgroper", "Croweater",
  "Mexican (Victorian)", "Pie Floater", "Freo Doctor", "Stobie Pole", "Drop Bear",
  "Witchetty Grub", "Kookaburra", "Magpie Season", "Fair Go", "Hard Yakka", "Chuck a Sickie",
  "Chuck a U-ey", "Roo Bar", "Shazza", "Dazza", "Gazza", "Yeah, nah", "Nah, yeah",
  "She'll be right", "Off like a frog in a sock", "Mad as a cut snake",
  "Flat out like a lizard drinking", "Stone the crows", "Bloody oath", "Trackies", "Boardies",
  "Eftpos", "Capsicum", "Fairy Bread", "Esky Lid Cricket", "Meat Raffle", "Two-up", "Ugg Boots",
  "The Big Merino", "Goon Bag", "Centurion", "Tallboy", "Schooner", "Middy", "Pot",
  "Paddle Pop Lion", "Big Kev", "Fat Pizza", "Kath & Kim", "Housos", "Summer Heights High",
  "Chris Lilley", "John Farnham", "Cold Chisel", "Paul Hogan", "Slim Dusty", "Midnight Oil",
  "Powderfinger", "Silverchair", "Wolfmother", "Tame Impala", "Sheila", "G Flip", "Hilltop Hoods",
  "Ballarat", "Dubbo", "Piss up", "Skull it", "Wagga Wagga", "Chockers", "Kakadu", "Broome",
  "Esperance", "Old fella", "Coober Pedy", "Nullarbor", "Echuca", "Bega", "Tamworth",
  "Bathurst 1000", "Peter Brock", "Shane Warne Stand", "Bin Chicken",
];

export const HEADSUP_XXX_WORDS = [
  "Root", "Get a root", "Root rat", "Pash", "Pash and dash", "Crack onto", "Gobby",
  "Norks", "Bonk", "Froth", "Rack", "Perve", "Pinger", "Moot", "Shag on a rock", "Doodle",
  "Willy", "Knob", "Balls-up", "Shag", "Get a leg over", "On the job", "Stiffy",
  "Fanny", "Blowie", "Slapper", "Shagged", "Get it up ya", "Cockstand", "Dickhead",
  "Wanker", "Pisshead", "Rack off", "Shitfaced", "Munted", "Maggoted", "Budgie smuggler",
  "Dunny Budgie", "Bush pig", "Gash", "Beef Curtains", "Sausage Fest", "Knobjockey",
  "Camel toe", "Soggy Sao", "Two-pot screamer", "Knee trembler", "Bang like a dunny door",
];
