/**
 * Quiz data - 20 quizzes with 10 questions each.
 * Auto-generated from the original Vue codebase.
 */

export interface QuizQuestion {
  text: string;
  answers: string[];
  correctAnswer: string;
  image?: string;
  audio?: string;
}

export interface Quiz {
  id: number;
  name: string;
  questions: QuizQuestion[];
}

export const quizzes: Quiz[] = [
  {
    "id": 1,
    "name": "Quiz 1",
    "questions": [
      {
        "text": "What would you call these in Australian slang?",
        "answers": [
          "sangers",
          "chooks",
          "snags",
          "sarnies"
        ],
        "correctAnswer": "snags",
        "image": "snags.jpg"
      },
      {
        "text": "What accent do you hear in the clip?",
        "answers": [
          "New South Wales",
          "Perth",
          "Victoria",
          "Queensland"
        ],
        "correctAnswer": "Queensland",
        "audio": "intense.m4a"
      },
      {
        "text": "What is Aussie slang for sunglasses?",
        "answers": [
          "shaders",
          "speccers",
          "sunnies",
          "glassies"
        ],
        "correctAnswer": "sunnies"
      },
      {
        "text": "What is the Australian way of saying \"this afternoon\"?",
        "answers": [
          "this arvo",
          "this afty",
          "this PM",
          "this afteroonie"
        ],
        "correctAnswer": "this arvo"
      },
      {
        "text": "What do you call the place you buy your alcohol in Australia?",
        "answers": [
          "liquor store",
          "beerfest",
          "bottle-o",
          "offo"
        ],
        "correctAnswer": "bottle-o",
        "image": "offo.jpeg"
      },
      {
        "text": "Which is the most distinctly Australian way to say \"a lot\"?",
        "answers": [
          "heaps",
          "tons",
          "loads",
          "stacks"
        ],
        "correctAnswer": "heaps"
      },
      {
        "text": "What does \"fair dinkum\" mean?",
        "answers": [
          "expensive",
          "genuine or real",
          "unfair",
          "broken"
        ],
        "correctAnswer": "genuine or real"
      },
      {
        "text": "If something is \"bonkers\", it is...",
        "answers": [
          "broken",
          "boring",
          "crazy",
          "expensive"
        ],
        "correctAnswer": "crazy"
      },
      {
        "text": "What do Australians call flip-flops?",
        "answers": [
          "sandals",
          "thongs",
          "slippers",
          "jandals"
        ],
        "correctAnswer": "thongs",
        "image": "thongs.jpeg"
      },
      {
        "text": "If an Australian person says \"no worries\", they mean",
        "answers": [
          "don't worry about it",
          "you are in trouble",
          "I disagree",
          "be careful"
        ],
        "correctAnswer": "don't worry about it"
      }
    ]
  },
  {
    "id": 2,
    "name": "Quiz 2",
    "questions": [
      {
        "text": "What do Australians call a small glass bottle of beer?",
        "answers": [
          "tinny",
          "stubby",
          "longneck",
          "schooner"
        ],
        "correctAnswer": "stubby"
      },
      {
        "text": "A \"schooner\" in Australia is",
        "answers": [
          "a type of boat",
          "a beer glass size",
          "a wine bottle",
          "a cocktail"
        ],
        "correctAnswer": "a beer glass size"
      },
      {
        "text": "If someone is \"pissed\" in Australia, they are",
        "answers": [
          "very happy",
          "very angry",
          "very drunk",
          "very tired"
        ],
        "correctAnswer": "very drunk"
      },
      {
        "text": "What do Australians call a six-pack of beer?",
        "answers": [
          "half dozen",
          "sixer",
          "six-pack",
          "half case"
        ],
        "correctAnswer": "sixer"
      },
      {
        "text": "The people in the photo are most likely saying",
        "answers": [
          "cheers",
          "streuth!",
          "smoko",
          "crikey"
        ],
        "correctAnswer": "cheers",
        "image": "slainte.jpg"
      },
      {
        "text": "What's a 'tinny' in Australian slang?",
        "answers": [
          "a small car",
          "a can of beer",
          "a metal roof",
          "a type of boat"
        ],
        "correctAnswer": "a can of beer"
      },
      {
        "text": "If someone is 'on the turps' they are",
        "answers": [
          "painting a house",
          "very drunk",
          "working hard",
          "feeling sick"
        ],
        "correctAnswer": "very drunk"
      },
      {
        "text": "Which is the most distinctly Australian way to say \"getting very drunk\"?",
        "answers": [
          "getting hammered",
          "getting slaughtered",
          "getting maggoted",
          "getting wasted"
        ],
        "correctAnswer": "getting maggoted"
      },
      {
        "text": "What's a 'middy' in Australian drinking culture?",
        "answers": [
          "a small person",
          "a beer glass size",
          "a wine type",
          "a cocktail mixer"
        ],
        "correctAnswer": "a beer glass size"
      },
      {
        "text": "If you're having a 'session', you're",
        "answers": [
          "studying hard",
          "having a long drinking session",
          "exercising",
          "working overtime"
        ],
        "correctAnswer": "having a long drinking session"
      }
    ]
  },
  {
    "id": 3,
    "name": "Quiz 3",
    "questions": [
      {
        "text": "What does 'mate' mean in Australian slang?",
        "answers": [
          "enemy",
          "friend",
          "stranger",
          "boss"
        ],
        "correctAnswer": "friend"
      },
      {
        "text": "What do Australians call a sandwich?",
        "answers": [
          "sarnie",
          "sanger",
          "sambo",
          "sandie"
        ],
        "correctAnswer": "sanger"
      },
      {
        "text": "If the weather is really hot, Australians might say it's",
        "answers": [
          "crackly",
          "cool",
          "stinking hot",
          "bloody cold"
        ],
        "correctAnswer": "stinking hot"
      },
      {
        "text": "What's a 'specky' in AFL?",
        "answers": [
          "someone who wears glasses",
          "a spectacular mark/catch",
          "a type of kick",
          "a penalty"
        ],
        "correctAnswer": "a spectacular mark/catch"
      },
      {
        "text": "If somebody is 'crook' they are",
        "answers": [
          "feeling great",
          "feeling sick",
          "being dishonest",
          "very aggressive"
        ],
        "correctAnswer": "feeling sick"
      },
      {
        "text": "What is this haircut that is very popular with young Aussie guys called?",
        "answers": [
          "mullet",
          "bowl cut",
          "fade",
          "quiff"
        ],
        "correctAnswer": "mullet",
        "image": "bogan.webp"
      },
      {
        "text": "What does 'chuck a sickie' mean?",
        "answers": [
          "throw up",
          "take a fake sick day",
          "get really sick",
          "help someone who's ill"
        ],
        "correctAnswer": "take a fake sick day"
      },
      {
        "text": "What does 'bloke' refer to?",
        "answers": [
          "A type of dance",
          "A man or guy",
          "A mistake",
          "A brick"
        ],
        "correctAnswer": "A man or guy"
      },
      {
        "text": "If someone is 'bludging', they are",
        "answers": [
          "working hard",
          "being lazy",
          "eating too much",
          "exercising"
        ],
        "correctAnswer": "being lazy"
      },
      {
        "text": "What's a 'ute' in Australia?",
        "answers": [
          "a type of bird",
          "a utility vehicle/pickup truck",
          "a musical instrument",
          "a type of boot"
        ],
        "correctAnswer": "a utility vehicle/pickup truck"
      }
    ]
  },
  {
    "id": 4,
    "name": "Quiz 4",
    "questions": [
      {
        "text": "If someone is 'ripper', they are",
        "answers": [
          "dangerous",
          "excellent",
          "broken",
          "angry"
        ],
        "correctAnswer": "excellent"
      },
      {
        "text": "What does 'bonzer' mean? ",
        "answers": [
          "broken",
          "excellent",
          "expensive",
          "boring"
        ],
        "correctAnswer": "excellent"
      },
      {
        "text": "What's the Australian slang for a chocolate bar?",
        "answers": [
          "choccy bar",
          "candy bar",
          "sweet bar",
          "choccie bar"
        ],
        "correctAnswer": "choccie bar"
      },
      {
        "text": "What's the traditional Australian term for a convenience store?",
        "answers": [
          "corner shop",
          "deli",
          "milk bar",
          "bodega"
        ],
        "correctAnswer": "milk bar"
      },
      {
        "text": "What does 'she'll be right' mean?",
        "answers": [
          "she is correct",
          "everything will be okay",
          "she will arrive",
          "she is right-handed"
        ],
        "correctAnswer": "everything will be okay"
      },
      {
        "text": "What's a 'mozzie'?",
        "answers": [
          "a type of cheese",
          "a mosquito",
          "a small car",
          "a type of dance"
        ],
        "correctAnswer": "a mosquito"
      },
      {
        "text": "What does 'dunny' refer to?",
        "answers": [
          "a basement",
          "a toilet",
          "a type of bread",
          "a small hill"
        ],
        "correctAnswer": "a toilet"
      },
      {
        "text": "If someone is 'having a whinge', they are",
        "answers": [
          "celebrating",
          "complaining",
          "dancing",
          "sleeping"
        ],
        "correctAnswer": "complaining"
      },
      {
        "text": "What's 'tucker' in Australian slang?",
        "answers": [
          "a person's name",
          "food",
          "money",
          "clothing"
        ],
        "correctAnswer": "food"
      },
      {
        "text": "What does 'flat out' mean?",
        "answers": [
          "lying down",
          "very busy",
          "broken",
          "empty"
        ],
        "correctAnswer": "very busy"
      }
    ]
  },
  {
    "id": 5,
    "name": "Alcohol",
    "questions": [
      {
        "text": "What do Aussies call the blue box for keeping drinks cool?",
        "answers": [
          "fridgeridoo",
          "coolbox",
          "esky",
          "beerbox"
        ],
        "correctAnswer": "esky",
        "image": "esk.jpeg"
      },
      {
        "text": "What's a 'slab' in Australian drinking culture?",
        "answers": [
          "a type of beer glass",
          "a case of 24 beers",
          "a drinking game",
          "a bar counter"
        ],
        "correctAnswer": "a case of 24 beers"
      },
      {
        "text": "Is a schooner always a 425ml glass?",
        "answers": [
          "Yes",
          "Depends on the state"
        ],
        "correctAnswer": "Depends on the state",
        "image": "schooner.jpg"
      },
      {
        "text": "If someone is 'maggoted', they are",
        "answers": [
          "very hungover",
          "extremely drunk",
          "passed out",
          "very angry"
        ],
        "correctAnswer": "extremely drunk"
      },
      {
        "text": "What is the main spirit usually in a Bundaberg with Coke?",
        "answers": [
          "vodka",
          "rum",
          "whiskey",
          "gin"
        ],
        "correctAnswer": "rum",
        "image": "rum.jpeg"
      },
      {
        "text": "What is the drink in the picture called?",
        "answers": [
          "stubby",
          "goon",
          "winey",
          "woon"
        ],
        "correctAnswer": "goon",
        "image": "goon.jpg"
      },
      {
        "text": "What does 'on the piss' mean in Australia?",
        "answers": [
          "standing on the toilet",
          "out drinking alcohol",
          "being angry",
          "drinking urine"
        ],
        "correctAnswer": "out drinking alcohol"
      },
      {
        "text": "What's a 'longneck' in Australian drinking terms?",
        "answers": [
          "a person who drinks a lot",
          "a 750ml beer bottle",
          "a type of wine",
          "a cocktail glass"
        ],
        "correctAnswer": "a 750ml beer bottle"
      },
      {
        "text": "The guy in the picture is doing a",
        "answers": [
          "hole in one",
          "booty",
          "shoey",
          "downie"
        ],
        "correctAnswer": "shoey",
        "image": "shoey.jpeg"
      },
      {
        "text": "If you're 'paralytic', you are",
        "answers": [
          "unable to move",
          "very drunk",
          "very paranoid",
          "drinking whilst paragliding"
        ],
        "correctAnswer": "very drunk"
      }
    ]
  },
  {
    "id": 6,
    "name": "Food & Drink",
    "questions": [
      {
        "text": "What do Australians call a meat pie served in pea soup?",
        "answers": [
          "pastry floater",
          "pie floater",
          "meat floater",
          "snag floater"
        ],
        "correctAnswer": "pie floater"
      },
      {
        "text": "What's a 'snag' in Australian slang?",
        "answers": [
          "a problem",
          "a sausage",
          "a type of fish",
          "a tree branch"
        ],
        "correctAnswer": "a sausage"
      },
      {
        "text": "What Aussie bakery staple is shown in the image?",
        "answers": [
          "sausage roll",
          "party pie",
          "meat pie",
          "cornish pastry"
        ],
        "correctAnswer": "sausage roll",
        "image": "sausroll.jpeg"
      },
      {
        "text": "What's 'Vegemite' in Australia?",
        "answers": [
          "a vegetable",
          "a dark spread made from yeast",
          "a type of meat",
          "a cooking oil"
        ],
        "correctAnswer": "a dark spread made from yeast"
      },
      {
        "text": "What do Australians call a chocolate biscuit?",
        "answers": [
          "choccy bickie",
          "cookie",
          "sweet biscuit",
          "chocolate wafer"
        ],
        "correctAnswer": "choccy bickie"
      },
      {
        "text": "If a person says they are 'stuffed', they mean they are",
        "answers": [
          "starving",
          "very full",
          "vomiting",
          "drunk"
        ],
        "correctAnswer": "very full"
      },
      {
        "text": "What's a 'lamington'?",
        "answers": [
          "a type of sheep",
          "a sponge cake covered in coconut",
          "a city in Australia",
          "a type of dance"
        ],
        "correctAnswer": "a sponge cake covered in coconut"
      },
      {
        "text": "What's the Australian slang for a sausage?",
        "answers": [
          "banger",
          "snag",
          "sausie",
          "griller"
        ],
        "correctAnswer": "snag"
      },
      {
        "text": "What's 'fairy bread'?",
        "answers": [
          "bread for fairies",
          "white bread with butter and sprinkles",
          "a type of cake",
          "magical bread"
        ],
        "correctAnswer": "white bread with butter and sprinkles"
      },
      {
        "text": "What's the most common Australian term for the fish in fish and chips?",
        "answers": [
          "cod and chips",
          "flake and chips",
          "barramundi and chips",
          "snapper and chips"
        ],
        "correctAnswer": "flake and chips"
      }
    ]
  },
  {
    "id": 7,
    "name": "Sports",
    "questions": [
      {
        "text": "What do Australians call Australian Rules Football?",
        "answers": [
          "rugby",
          "soccer",
          "footy",
          "aussie rules"
        ],
        "correctAnswer": "footy"
      },
      {
        "text": "What's this move called in AFL?",
        "answers": [
          "superjump",
          "a try",
          "specky",
          "hat trick"
        ],
        "correctAnswer": "specky",
        "image": "specky.jpg"
      },
      {
        "text": "What do Australians call a cricket match between Australia and England?",
        "answers": [
          "The Rivalry",
          "The Ashes",
          "The Battle",
          "The Contest"
        ],
        "correctAnswer": "The Ashes"
      },
      {
        "text": "What's the 'baggy green'?",
        "answers": [
          "a type of vegetable",
          "the Australian cricket cap",
          "a football jersey",
          "a tennis outfit"
        ],
        "correctAnswer": "the Australian cricket cap"
      },
      {
        "text": "What's 'State of Origin' in Australia?",
        "answers": [
          "a history lesson",
          "a rugby league series",
          "a cricket tournament",
          "a football final"
        ],
        "correctAnswer": "a rugby league series"
      },
      {
        "text": "What's a 'century' in cricket?",
        "answers": [
          "100 years",
          "100 runs by one player",
          "100 wickets",
          "100 matches"
        ],
        "correctAnswer": "100 runs by one player"
      },
      {
        "text": "What does 'Bathurst' refer to in Australian motorsport?",
        "answers": [
          "a type of car",
          "a famous race track and race",
          "a racing driver",
          "a car manufacturer"
        ],
        "correctAnswer": "a famous race track and race"
      },
      {
        "text": "What's a 'six' in cricket?",
        "answers": [
          "6 players",
          "6 overs",
          "hitting the ball over the boundary",
          "6 wickets"
        ],
        "correctAnswer": "hitting the ball over the boundary"
      },
      {
        "text": "What's the casual Australian way to say 'going swimming'?",
        "answers": [
          "going for a swim",
          "water sports",
          "having a dip",
          "pool time"
        ],
        "correctAnswer": "having a dip"
      }
    ]
  },
  {
    "id": 8,
    "name": "Regional",
    "questions": [
      {
        "text": "What do Victorians call what people in NSW call a 'potato scallop'?",
        "answers": [
          "potato fritter",
          "potato cake",
          "scallop chip",
          "potato round"
        ],
        "correctAnswer": "potato cake"
      },
      {
        "text": "What do people in Melbourne call their city's laneways?",
        "answers": [
          "alleys",
          "lanes",
          "laneways",
          "passages"
        ],
        "correctAnswer": "laneways"
      },
      {
        "text": "What do Sydneysiders call the Sydney Harbour Bridge?",
        "answers": [
          "The Bridge",
          "The Coathanger",
          "The Arch",
          "The Span"
        ],
        "correctAnswer": "The Coathanger"
      },
      {
        "text": "What's Brisbane's nickname?",
        "answers": [
          "Brissy",
          "Brisvegas",
          "B-town",
          "River City"
        ],
        "correctAnswer": "Brisvegas"
      },
      {
        "text": "What do people in Perth call their city?",
        "answers": [
          "P-town",
          "Perthy",
          "The West",
          "Perthville"
        ],
        "correctAnswer": "Perthy"
      },
      {
        "text": "What do Melburnians call a 'parma'?",
        "answers": [
          "a type of cheese",
          "chicken parmigiana",
          "a type of wine",
          "a suburb"
        ],
        "correctAnswer": "chicken parmigiana"
      },
      {
        "text": "What do people in the Northern Territory call the monsoon season?",
        "answers": [
          "The Wet",
          "Storm season",
          "Monsoon time",
          "The Rainy"
        ],
        "correctAnswer": "The Wet"
      },
      {
        "text": "Which Australian city is known as the 'City of Churches'?",
        "answers": [
          "Melbourne",
          "Adelaide",
          "Hobart",
          "Canberra"
        ],
        "correctAnswer": "Adelaide"
      },
      {
        "text": "What do people in Adelaide call their city?",
        "answers": [
          "Adders",
          "Radelaide",
          "A-town",
          "The City of Churches"
        ],
        "correctAnswer": "Radelaide"
      },
      {
        "text": "What's Tasmania's nickname?",
        "answers": [
          "Tassie",
          "The Apple Isle",
          "The Island State",
          "Down South"
        ],
        "correctAnswer": "Tassie"
      }
    ]
  },
  {
    "id": 9,
    "name": "Dublin",
    "questions": [
      {
        "text": "What does 'yakka' mean in Australian slang?",
        "answers": [
          "A type of tree",
          "Hard work",
          "A type of food",
          "A place in Australia"
        ],
        "correctAnswer": "Hard work"
      },
      {
        "text": "What does 'chockers' mean?",
        "answers": [
          "Full of chocolate",
          "Completely full",
          "Very expensive",
          "Broken"
        ],
        "correctAnswer": "Completely full"
      },
      {
        "text": "What's a 'dag' in Australian slang?",
        "answers": [
          "A type of dog",
          "An unfashionable person",
          "A type of hat",
          "A sharp object"
        ],
        "correctAnswer": "An unfashionable person"
      },
      {
        "text": "What does 'ripper' mean?",
        "answers": [
          "Something that tears",
          "Excellent or fantastic",
          "Very expensive",
          "Broken"
        ],
        "correctAnswer": "Excellent or fantastic"
      },
      {
        "text": "What's 'brekkie' in Australian slang?",
        "answers": [
          "A break from work",
          "Breakfast",
          "A type of biscuit",
          "A small break"
        ],
        "correctAnswer": "Breakfast"
      },
      {
        "text": "What does 'strewth' express?",
        "answers": [
          "Happiness",
          "Surprise or amazement",
          "Sadness",
          "Anger"
        ],
        "correctAnswer": "Surprise or amazement"
      },
      {
        "text": "What's a 'joey'?",
        "answers": [
          "A person's name",
          "A baby kangaroo",
          "A type of bird",
          "A small car"
        ],
        "correctAnswer": "A baby kangaroo"
      },
      {
        "text": "What does 'bonkers' mean?",
        "answers": [
          "Broken",
          "Crazy or mad",
          "Very expensive",
          "Very good"
        ],
        "correctAnswer": "Crazy or mad"
      },
      {
        "text": "What's 'arvo' short for?",
        "answers": [
          "Arrival",
          "Afternoon",
          "Avenue",
          "Argument"
        ],
        "correctAnswer": "Afternoon"
      },
      {
        "text": "What does 'crikey' express?",
        "answers": [
          "Anger",
          "Surprise or amazement",
          "Sadness",
          "Boredom"
        ],
        "correctAnswer": "Surprise or amazement"
      }
    ]
  },
  {
    "id": 10,
    "name": "Quiz 10",
    "questions": [
      {
        "text": "What does 'bodgy' mean?",
        "answers": [
          "Perfect",
          "Poorly made or unreliable",
          "Very expensive",
          "Very fast"
        ],
        "correctAnswer": "Poorly made or unreliable"
      },
      {
        "text": "What's a 'sheila' in Australian slang?",
        "answers": [
          "A type of drink",
          "A woman",
          "A type of tree",
          "A musical instrument"
        ],
        "correctAnswer": "A woman"
      },
      {
        "text": "What does 'chuck a wobbly' mean?",
        "answers": [
          "Throw something",
          "Have a tantrum",
          "Dance badly",
          "Fall over"
        ],
        "correctAnswer": "Have a tantrum"
      },
      {
        "text": "What's 'dinkum' mean?",
        "answers": [
          "Fake",
          "Genuine or real",
          "Expensive",
          "Broken"
        ],
        "correctAnswer": "Genuine or real"
      },
      {
        "text": "What does 'troppo' mean?",
        "answers": [
          "Very cold",
          "Gone crazy from the heat",
          "Very happy",
          "Very tired"
        ],
        "correctAnswer": "Gone crazy from the heat"
      },
      {
        "text": "What's 'wowser'?",
        "answers": [
          "Someone exciting",
          "A killjoy or spoilsport",
          "A type of dog",
          "A loud person"
        ],
        "correctAnswer": "A killjoy or spoilsport"
      },
      {
        "text": "What does 'stone the flamin' crows' express?",
        "answers": [
          "Anger at birds",
          "Surprise or disbelief",
          "Love of nature",
          "Hunger"
        ],
        "correctAnswer": "Surprise or disbelief"
      },
      {
        "text": "What's 'chook' in Australian slang?",
        "answers": [
          "A book",
          "A chicken",
          "A look",
          "A cook"
        ],
        "correctAnswer": "A chicken"
      },
      {
        "text": "What does 'aggro' mean?",
        "answers": [
          "Agriculture",
          "Aggressive behavior",
          "Agreement",
          "Argument"
        ],
        "correctAnswer": "Aggressive behavior"
      },
      {
        "text": "What's 'bikkie' short for?",
        "answers": [
          "Bicycle",
          "Bikini",
          "Biscuit",
          "Big key"
        ],
        "correctAnswer": "Biscuit"
      }
    ]
  },
  {
    "id": 11,
    "name": "Quiz 11",
    "questions": [
      {
        "text": "What does 'spunk' mean in Australian slang?",
        "answers": [
          "Courage",
          "An attractive person",
          "Bad smell",
          "Good luck"
        ],
        "correctAnswer": "An attractive person"
      },
      {
        "text": "What's 'deadly' mean in Australian Aboriginal slang?",
        "answers": [
          "Dangerous",
          "Boring",
          "Excellent",
          "Dead"
        ],
        "correctAnswer": "Excellent"
      },
      {
        "text": "What does 'spit the dummy' mean?",
        "answers": [
          "Spit out food",
          "Have a tantrum",
          "Tell a secret",
          "Make a mistake"
        ],
        "correctAnswer": "Have a tantrum"
      },
      {
        "text": "What's a 'galah'?",
        "answers": [
          "A smart person",
          "A silly person",
          "A type of dance",
          "A type of food"
        ],
        "correctAnswer": "A silly person"
      },
      {
        "text": "What does 'give it a burl' mean?",
        "answers": [
          "Throw it away",
          "Try it",
          "Buy it",
          "Break it"
        ],
        "correctAnswer": "Try it"
      },
      {
        "text": "What's 'knackered' mean?",
        "answers": [
          "Fixed",
          "Very tired",
          "Very happy",
          "Very angry"
        ],
        "correctAnswer": "Very tired"
      },
      {
        "text": "What does 'rack off' mean?",
        "answers": [
          "Put on a shelf",
          "Go away",
          "Come here",
          "Sit down"
        ],
        "correctAnswer": "Go away"
      },
      {
        "text": "What's 'dosh' refer to?",
        "answers": [
          "A type of food",
          "Money",
          "A type of car",
          "A game"
        ],
        "correctAnswer": "Money"
      },
      {
        "text": "What does 'scarce as hen's teeth' mean?",
        "answers": [
          "Very common",
          "Very rare",
          "Very sharp",
          "Very white"
        ],
        "correctAnswer": "Very rare"
      },
      {
        "text": "What's 'thick as a brick' mean?",
        "answers": [
          "Very smart",
          "Very stupid",
          "Very strong",
          "Very thin"
        ],
        "correctAnswer": "Very stupid"
      }
    ]
  },
  {
    "id": 12,
    "name": "Quiz 12",
    "questions": [
      {
        "text": "What does 'taking the piss' mean?",
        "answers": [
          "Going to the toilet",
          "Making fun of someone",
          "Being serious",
          "Drinking water"
        ],
        "correctAnswer": "Making fun of someone"
      },
      {
        "text": "What does 'hoon' refer to?",
        "answers": [
          "A wise person",
          "A reckless driver",
          "A quiet person",
          "A chef"
        ],
        "correctAnswer": "A reckless driver"
      },
      {
        "text": "What's a 'drongo'?",
        "answers": [
          "A smart person",
          "A stupid person",
          "A type of bird",
          "A musical instrument"
        ],
        "correctAnswer": "A stupid person"
      },
      {
        "text": "What does 'fair shake of the sauce bottle' mean?",
        "answers": [
          "Cooking instructions",
          "A fair chance",
          "Sharing food",
          "Making a mess"
        ],
        "correctAnswer": "A fair chance"
      },
      {
        "text": "What's 'cooee' used for?",
        "answers": [
          "Saying goodbye",
          "Getting someone's attention",
          "Expressing anger",
          "Showing surprise"
        ],
        "correctAnswer": "Getting someone's attention"
      },
      {
        "text": "What does 'budgie smugglers' refer to?",
        "answers": [
          "Bird thieves",
          "Tight swimming trunks",
          "Small cars",
          "Tiny houses"
        ],
        "correctAnswer": "Tight swimming trunks"
      },
      {
        "text": "What's 'ocker' mean?",
        "answers": [
          "A foreigner",
          "A stereotypical Australian",
          "A rich person",
          "A poor person"
        ],
        "correctAnswer": "A stereotypical Australian"
      },
      {
        "text": "What does 'pull your head in' mean?",
        "answers": [
          "Look up",
          "Mind your own business",
          "Come closer",
          "Be careful"
        ],
        "correctAnswer": "Mind your own business"
      },
      {
        "text": "What's 'ratbag' refer to?",
        "answers": [
          "A bag for rats",
          "A mischievous person",
          "A garbage bag",
          "A shopping bag"
        ],
        "correctAnswer": "A mischievous person"
      },
      {
        "text": "What does 'up yourself' mean?",
        "answers": [
          "Standing up",
          "Being conceited",
          "Climbing high",
          "Being helpful"
        ],
        "correctAnswer": "Being conceited"
      }
    ]
  },
  {
    "id": 13,
    "name": "Quiz 13",
    "questions": [
      {
        "text": "What does 'flat chat' mean?",
        "answers": [
          "Boring conversation",
          "Going very fast",
          "Lying down",
          "Quiet talking"
        ],
        "correctAnswer": "Going very fast"
      },
      {
        "text": "What's a 'bushranger'?",
        "answers": [
          "A park guide",
          "An outlaw from Australian history",
          "A tree expert",
          "A camping enthusiast"
        ],
        "correctAnswer": "An outlaw from Australian history"
      },
      {
        "text": "What does 'cobber' mean?",
        "answers": [
          "A corn cob",
          "A friend or mate",
          "A police officer",
          "A type of bread"
        ],
        "correctAnswer": "A friend or mate"
      },
      {
        "text": "What's 'woop woop'?",
        "answers": [
          "A celebration cry",
          "A remote place",
          "A type of dance",
          "A bird call"
        ],
        "correctAnswer": "A remote place"
      },
      {
        "text": "What does 'larrikin' mean?",
        "answers": [
          "A serious person",
          "A mischievous person",
          "A lazy person",
          "A smart person"
        ],
        "correctAnswer": "A mischievous person"
      },
      {
        "text": "What does 'work away' mean?",
        "answers": [
          "Stop what you're doing",
          "You have permission to start or continue",
          "Work from home",
          "Take a break"
        ],
        "correctAnswer": "You have permission to start or continue"
      },
      {
        "text": "What's 'billabong'?",
        "answers": [
          "A type of surfboard",
          "A waterhole",
          "A boomerang",
          "A didgeridoo"
        ],
        "correctAnswer": "A waterhole"
      },
      {
        "text": "What does 'swag' refer to in Australian bush culture?",
        "answers": [
          "Stolen goods",
          "A bedroll",
          "Confidence",
          "A bag"
        ],
        "correctAnswer": "A bedroll"
      },
      {
        "text": "What's 'jackaroo'?",
        "answers": [
          "A type of kangaroo",
          "A male farm worker",
          "A card game",
          "A dance move"
        ],
        "correctAnswer": "A male farm worker"
      },
      {
        "text": "What does 'station' mean in rural Australia?",
        "answers": [
          "A train stop",
          "A large farm/ranch",
          "A police station",
          "A radio station"
        ],
        "correctAnswer": "A large farm/ranch"
      }
    ]
  },
  {
    "id": 14,
    "name": "Quiz 14",
    "questions": [
      {
        "text": "What's 'akubra'?",
        "answers": [
          "A type of hat",
          "A type of boot",
          "A dance",
          "A greeting"
        ],
        "correctAnswer": "A type of hat"
      },
      {
        "text": "What does 'dinky-di' mean?",
        "answers": [
          "Small",
          "Genuine",
          "Broken",
          "Expensive"
        ],
        "correctAnswer": "Genuine"
      },
      {
        "text": "What's 'jillaroo'?",
        "answers": [
          "A type of kangaroo",
          "A female farm worker",
          "A dance",
          "A song"
        ],
        "correctAnswer": "A female farm worker"
      },
      {
        "text": "What does 'bush telegraph' refer to?",
        "answers": [
          "A phone line",
          "Word of mouth communication",
          "A newspaper",
          "A radio"
        ],
        "correctAnswer": "Word of mouth communication"
      },
      {
        "text": "What's 'mulga'?",
        "answers": [
          "A type of scrubland",
          "A dance",
          "A food",
          "A tool"
        ],
        "correctAnswer": "A type of scrubland"
      },
      {
        "text": "What does 'shook' mean?",
        "answers": [
          "Excited",
          "Hungover or fragile",
          "Very happy",
          "Angry"
        ],
        "correctAnswer": "Hungover or fragile"
      },
      {
        "text": "What's 'mallee'?",
        "answers": [
          "A type of eucalyptus scrubland",
          "A dance",
          "A food",
          "A bird"
        ],
        "correctAnswer": "A type of eucalyptus scrubland"
      },
      {
        "text": "What does 'sundowner' refer to?",
        "answers": [
          "Sunset",
          "A tramp or vagrant",
          "A drink",
          "A hat"
        ],
        "correctAnswer": "A tramp or vagrant"
      },
      {
        "text": "What's 'coolabah'?",
        "answers": [
          "A cold drink",
          "A type of tree",
          "A greeting",
          "A dance"
        ],
        "correctAnswer": "A type of tree"
      },
      {
        "text": "What does 'come a gutser' mean?",
        "answers": [
          "Eat too much",
          "Have a bad fall or failure",
          "Win big",
          "Get angry"
        ],
        "correctAnswer": "Have a bad fall or failure"
      }
    ]
  },
  {
    "id": 15,
    "name": "Quiz 15",
    "questions": [
      {
        "text": "What's 'ridgy-didge'?",
        "answers": [
          "Fake",
          "Genuine or authentic",
          "Expensive",
          "Broken"
        ],
        "correctAnswer": "Genuine or authentic"
      },
      {
        "text": "What does 'bonzer' mean?",
        "answers": [
          "Broken",
          "Excellent",
          "Expensive",
          "Boring"
        ],
        "correctAnswer": "Excellent"
      },
      {
        "text": "What does 'talkin shite' mean in Australian slang?",
        "answers": [
          "Talking rubbish",
          "Talking sense",
          "Singing loudly",
          "Whispering"
        ],
        "correctAnswer": "Talking rubbish"
      },
      {
        "text": "What does 'no worries' mean?",
        "answers": [
          "I'm worried",
          "You're welcome/it's fine",
          "Be careful",
          "I disagree"
        ],
        "correctAnswer": "You're welcome/it's fine"
      },
      {
        "text": "If someone is 'playing a blinder' they are...",
        "answers": [
          "Playing badly",
          "Playing brilliantly",
          "Being lazy",
          "Being sneaky"
        ],
        "correctAnswer": "Playing brilliantly"
      },
      {
        "text": "What does 'I'm busting' mean?",
        "answers": [
          "I'm breaking",
          "I need the toilet",
          "I'm excited",
          "I'm tired"
        ],
        "correctAnswer": "I need the toilet"
      },
      {
        "text": "What's 'trackie daks'?",
        "answers": [
          "Track shoes",
          "Tracksuit pants",
          "Racing cars",
          "Train tracks"
        ],
        "correctAnswer": "Tracksuit pants"
      },
      {
        "text": "What does 'going off like a frog in a sock' mean?",
        "answers": [
          "Being very quiet",
          "Being very excited or active",
          "Jumping around",
          "Making noise"
        ],
        "correctAnswer": "Being very excited or active"
      },
      {
        "text": "What's 'yonks'?",
        "answers": [
          "A few minutes",
          "A few days",
          "A very long time",
          "Exactly one year"
        ],
        "correctAnswer": "A very long time"
      },
      {
        "text": "What's 'bludger'?",
        "answers": [
          "A hard worker",
          "Someone who avoids work",
          "A type of tool",
          "A type of food"
        ],
        "correctAnswer": "Someone who avoids work"
      }
    ]
  },
  {
    "id": 16,
    "name": "Quiz 16",
    "questions": [
      {
        "text": "What does 'made a dog's breakfast of it' mean?",
        "answers": [
          "Cooked perfectly",
          "Made a mess of it",
          "Fed the dog",
          "Woke up early"
        ],
        "correctAnswer": "Made a mess of it"
      },
      {
        "text": "What does 'fair dinkum' mean when used as a question?",
        "answers": [
          "How much does it cost?",
          "Are you serious?",
          "What time is it?",
          "Where are you going?"
        ],
        "correctAnswer": "Are you serious?"
      },
      {
        "text": "What does 'having a blue' mean?",
        "answers": [
          "Feeling sad",
          "Having an argument",
          "Feeling cold",
          "Being quiet"
        ],
        "correctAnswer": "Having an argument"
      },
      {
        "text": "What's 'stinking hot' describe?",
        "answers": [
          "Bad smell",
          "Very hot weather",
          "Rotten food",
          "Dirty clothes"
        ],
        "correctAnswer": "Very hot weather"
      },
      {
        "text": "What does 'bucketing down' describe?",
        "answers": [
          "Carrying buckets",
          "Raining heavily",
          "Very hot",
          "Very windy"
        ],
        "correctAnswer": "Raining heavily"
      },
      {
        "text": "What does 'pissing down' describe?",
        "answers": [
          "Going downhill",
          "Raining heavily",
          "Being angry",
          "Falling over"
        ],
        "correctAnswer": "Raining heavily"
      },
      {
        "text": "What does 'in stitches' mean?",
        "answers": [
          "Needing surgery",
          "Laughing hard",
          "Very sad",
          "Very tired"
        ],
        "correctAnswer": "Laughing hard"
      },
      {
        "text": "What's 'dunny' refer to?",
        "answers": [
          "A basement",
          "A toilet",
          "A hill",
          "A car"
        ],
        "correctAnswer": "A toilet"
      },
      {
        "text": "What's 'weirdo'?",
        "answers": [
          "A normal person",
          "A strange person",
          "A smart person",
          "A loud person"
        ],
        "correctAnswer": "A strange person"
      },
      {
        "text": "What does 'half past' refer to?",
        "answers": [
          "30 minutes before",
          "30 minutes after the hour",
          "15 minutes after",
          "45 minutes after"
        ],
        "correctAnswer": "30 minutes after the hour"
      }
    ]
  },
  {
    "id": 17,
    "name": "Quiz 17",
    "questions": [
      {
        "text": "What does 'mate' mean when used sarcastically?",
        "answers": [
          "Best friend",
          "Enemy or someone you're annoyed with",
          "Stranger",
          "Family member"
        ],
        "correctAnswer": "Enemy or someone you're annoyed with"
      },
      {
        "text": "What's 'boring as batshit'?",
        "answers": [
          "Exciting",
          "Extremely boring",
          "Smelly",
          "Fast"
        ],
        "correctAnswer": "Extremely boring"
      },
      {
        "text": "What's 'mad as a cut snake'?",
        "answers": [
          "Very calm",
          "Very angry or crazy",
          "Very smart",
          "Very slow"
        ],
        "correctAnswer": "Very angry or crazy"
      },
      {
        "text": "What's 'flat out like a lizard drinking'?",
        "answers": [
          "Very slow",
          "Very busy",
          "Very thirsty",
          "Very lazy"
        ],
        "correctAnswer": "Very busy"
      },
      {
        "text": "What's 'esky' in Australia?",
        "answers": [
          "A type of dog",
          "A portable cooler",
          "A type of car",
          "A greeting"
        ],
        "correctAnswer": "A portable cooler"
      },
      {
        "text": "What's 'ugly as a hatful of arseholes'?",
        "answers": [
          "Very beautiful",
          "Very ugly",
          "Very smart",
          "Very fast"
        ],
        "correctAnswer": "Very ugly"
      },
      {
        "text": "What's 'not the full quid'?",
        "answers": [
          "Rich",
          "Not very intelligent",
          "Very smart",
          "Poor"
        ],
        "correctAnswer": "Not very intelligent"
      },
      {
        "text": "What does 'dry as a dead dingo's donger' mean?",
        "answers": [
          "Very wet",
          "Very dry",
          "Very fast",
          "Very slow"
        ],
        "correctAnswer": "Very dry"
      },
      {
        "text": "What's 'bathers' in Australian slang?",
        "answers": [
          "Bath robes",
          "Swimwear",
          "Bath toys",
          "people sunbathing"
        ],
        "correctAnswer": "Swimwear"
      },
      {
        "text": "What does 'chunder' mean?",
        "answers": [
          "To eat quickly",
          "To vomit",
          "To run fast",
          "To sleep"
        ],
        "correctAnswer": "To vomit"
      }
    ]
  },
  {
    "id": 18,
    "name": "Quiz 18",
    "questions": [
      {
        "text": "What's 'paddock' in rural Australia?",
        "answers": [
          "A type of boat",
          "A field or pasture",
          "A type of hat",
          "A farming tool"
        ],
        "correctAnswer": "A field or pasture"
      },
      {
        "text": "What's 'ringer' in Australian farming?",
        "answers": [
          "A bell",
          "A skilled sheep shearer",
          "A phone",
          "A type of fence"
        ],
        "correctAnswer": "A skilled sheep shearer"
      },
      {
        "text": "What's 'mob' refer to in Australia?",
        "answers": [
          "Criminals",
          "A group of animals or people",
          "A dance",
          "A type of car"
        ],
        "correctAnswer": "A group of animals or people"
      },
      {
        "text": "What's a 'drover'?",
        "answers": [
          "A car driver",
          "Someone who moves livestock",
          "A type of dog",
          "A farmer"
        ],
        "correctAnswer": "Someone who moves livestock"
      },
      {
        "text": "What's 'stockman'?",
        "answers": [
          "A shop keeper",
          "A cattle herder",
          "A banker",
          "A fisherman"
        ],
        "correctAnswer": "A cattle herder"
      },
      {
        "text": "What's 'mustering'?",
        "answers": [
          "Gathering courage",
          "Rounding up livestock",
          "Making noise",
          "Cooking food"
        ],
        "correctAnswer": "Rounding up livestock"
      },
      {
        "text": "What's 'bore' in rural Australia?",
        "answers": [
          "Something boring",
          "A water well",
          "A type of animal",
          "A farming tool"
        ],
        "correctAnswer": "A water well"
      },
      {
        "text": "What's 'windmill' used for on Australian farms?",
        "answers": [
          "Making flour",
          "Pumping water",
          "Generating electricity",
          "Decoration"
        ],
        "correctAnswer": "Pumping water"
      },
      {
        "text": "What's 'boundary rider'?",
        "answers": [
          "A bus driver",
          "Someone who maintains farm fences",
          "A horse racer",
          "A tour guide"
        ],
        "correctAnswer": "Someone who maintains farm fences"
      },
      {
        "text": "What's 'homestead'?",
        "answers": [
          "A government office",
          "The main house on a farm",
          "A type of bread",
          "A dance"
        ],
        "correctAnswer": "The main house on a farm"
      }
    ]
  },
  {
    "id": 19,
    "name": "Quiz 19",
    "questions": [
      {
        "text": "What does 'she'll be apples' mean?",
        "answers": [
          "There will be fruit",
          "Everything will be fine",
          "She likes apples",
          "It's expensive"
        ],
        "correctAnswer": "Everything will be fine"
      },
      {
        "text": "What's 'having a yarn'?",
        "answers": [
          "Knitting",
          "Having a conversation",
          "Telling lies",
          "Being quiet"
        ],
        "correctAnswer": "Having a conversation"
      },
      {
        "text": "What does 'give it a go' mean?",
        "answers": [
          "Throw it away",
          "Try it",
          "Buy it",
          "Break it"
        ],
        "correctAnswer": "Try it"
      },
      {
        "text": "What's 'stuffed'?",
        "answers": [
          "Full of food",
          "Broken or very tired",
          "Happy",
          "Angry"
        ],
        "correctAnswer": "Broken or very tired"
      },
      {
        "text": "What's 'having a sticky beak'?",
        "answers": [
          "Eating honey",
          "Being nosy",
          "Having a cold",
          "Being quiet"
        ],
        "correctAnswer": "Being nosy"
      },
      {
        "text": "What does 'chinwag' mean?",
        "answers": [
          "Moving your chin",
          "Having a chat",
          "Eating",
          "Sleeping"
        ],
        "correctAnswer": "Having a chat"
      },
      {
        "text": "What's 'spit the dummy' mean?",
        "answers": [
          "Spit out food",
          "Have a tantrum",
          "Be quiet",
          "Be happy"
        ],
        "correctAnswer": "Have a tantrum"
      },
      {
        "text": "What does 'good on ya' mean?",
        "answers": [
          "You look good",
          "Well done",
          "Good morning",
          "Goodbye"
        ],
        "correctAnswer": "Well done"
      },
      {
        "text": "What's 'gutted'?",
        "answers": [
          "Full",
          "Very disappointed",
          "Happy",
          "Excited"
        ],
        "correctAnswer": "Very disappointed"
      },
      {
        "text": "What's 'having a whinge'?",
        "answers": [
          "Having fun",
          "Complaining",
          "Celebrating",
          "Sleeping"
        ],
        "correctAnswer": "Complaining"
      }
    ]
  },
  {
    "id": 20,
    "name": "Quiz 20",
    "questions": [
      {
        "text": "What does 'too right' mean?",
        "answers": [
          "Turn right twice",
          "Absolutely correct",
          "Very conservative",
          "On the right side"
        ],
        "correctAnswer": "Absolutely correct"
      },
      {
        "text": "What's 'ankle biter'?",
        "answers": [
          "A small dog",
          "A small child",
          "A type of snake",
          "A shoe"
        ],
        "correctAnswer": "A small child"
      },
      {
        "text": "What does 'mate' mean in Australian culture?",
        "answers": [
          "Only close friends",
          "Anyone - friend or stranger",
          "Family members",
          "Work colleagues"
        ],
        "correctAnswer": "Anyone - friend or stranger"
      },
      {
        "text": "What's 'bloody hell' express?",
        "answers": [
          "Religious reference",
          "Surprise or frustration",
          "Happiness",
          "Sadness"
        ],
        "correctAnswer": "Surprise or frustration"
      },
      {
        "text": "What does 'stone the crows' mean?",
        "answers": [
          "Hunting birds",
          "Expression of surprise",
          "Building with stones",
          "Feeding birds"
        ],
        "correctAnswer": "Expression of surprise"
      },
      {
        "text": "What's 'sweet as' mean?",
        "answers": [
          "Very sugary",
          "Everything's good",
          "Dessert time",
          "Romantic"
        ],
        "correctAnswer": "Everything's good"
      },
      {
        "text": "What does 'chuck a U-ey' mean?",
        "answers": [
          "Throw something",
          "Make a U-turn",
          "Get sick",
          "Change clothes"
        ],
        "correctAnswer": "Make a U-turn"
      },
      {
        "text": "What's 'servo'?",
        "answers": [
          "A servant",
          "A service station",
          "A type of car",
          "A computer"
        ],
        "correctAnswer": "A service station"
      },
      {
        "text": "What does 'argy-bargy' mean?",
        "answers": [
          "A type of dance",
          "An argument",
          "A celebration",
          "A type of food"
        ],
        "correctAnswer": "An argument"
      },
      {
        "text": "What's 'bottle-o'?",
        "answers": [
          "A bottle factory",
          "A liquor store",
          "A recycling center",
          "A water company"
        ],
        "correctAnswer": "A liquor store"
      }
    ]
  }
];

export function getQuiz(id: number): Quiz | undefined {
  return quizzes.find(q => q.id === id);
}
