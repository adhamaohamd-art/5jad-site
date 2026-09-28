// Question bank for the free placement test.
// Each item: [question, correct answer, wrong 1, wrong 2, wrong 3]. Options are shuffled at display time.
// Add more items per level to increase variety between attempts (30-40 per level is a good target).
export type RawItem = [string, string, string, string, string];
export const BANK: Record<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', RawItem[]> = {
 "A1": [
  [
   "She ___ a student.",
   "is",
   "are",
   "am",
   "be"
  ],
  [
   "I ___ from Egypt.",
   "am",
   "is",
   "are",
   "be"
  ],
  [
   "There ___ two books on the table.",
   "are",
   "is",
   "am",
   "be"
  ],
  [
   "What ___ your name?",
   "is",
   "are",
   "am",
   "do"
  ],
  [
   "He ___ football every day.",
   "plays",
   "play",
   "playing",
   "is play"
  ],
  [
   "We ___ breakfast at seven.",
   "have",
   "has",
   "having",
   "is have"
  ],
  [
   "The opposite of “big” is:",
   "small",
   "tall",
   "long",
   "old"
  ],
  [
   "“How old are you?” — best answer:",
   "I'm twenty.",
   "I have twenty.",
   "I am at twenty.",
   "I twenty."
  ],
  [
   "This is ___ apple.",
   "an",
   "a",
   "the a",
   "some"
  ],
  [
   "They ___ in a big house.",
   "live",
   "lives",
   "living",
   "is live"
  ],
  [
   "My brother ___ two sisters.",
   "has",
   "have",
   "having",
   "is have"
  ],
  [
   "___ is your phone number?",
   "What",
   "Who",
   "Where",
   "When"
  ],
  [
   "I ___ coffee. I like tea.",
   "don't like",
   "doesn't like",
   "not like",
   "am not like"
  ],
  [
   "The cat is ___ the chair.",
   "under",
   "from",
   "with",
   "and"
  ],
  [
   "Ali and Sara ___ my friends.",
   "are",
   "is",
   "am",
   "be"
  ],
  [
   "How many ___ do you have?",
   "brothers",
   "brother",
   "a brother",
   "much brothers"
  ],
  [
   "The opposite of “hot” is:",
   "cold",
   "fast",
   "dry",
   "late"
  ],
  [
   "___ you like pizza?",
   "Do",
   "Does",
   "Are",
   "Is"
  ],
  [
   "She ___ up at six o'clock every morning.",
   "gets",
   "get",
   "getting",
   "is get"
  ],
  [
   "Monday, Tuesday, ___, Thursday.",
   "Wednesday",
   "Friday",
   "Sunday",
   "Saturday"
  ],
  [
   "Where ___ you from?",
   "are",
   "is",
   "do",
   "am"
  ],
  [
   "That's my mother. ___ name is Laila.",
   "Her",
   "She",
   "Hers",
   "Him"
  ],
  [
   "I can ___ English a little.",
   "speak",
   "speaks",
   "speaking",
   "to speak"
  ],
  [
   "There ___ a park near my house.",
   "is",
   "are",
   "am",
   "be"
  ],
  [
   "“What time is it?” — “It's ___.”",
   "half past five",
   "five and half",
   "five half",
   "in five"
  ],
  [
   "Two plus two is ___.",
   "four",
   "for",
   "forty",
   "fourteen"
  ],
  [
   "He ___ his homework now.",
   "is doing",
   "does",
   "do",
   "doing"
  ],
  [
   "Please ___ the door. It's cold.",
   "close",
   "closes",
   "closing",
   "to closing"
  ],
  [
   "We ___ to school by bus.",
   "go",
   "goes",
   "going",
   "is go"
  ],
  [
   "I have ___ orange and two apples.",
   "an",
   "a",
   "the",
   "two"
  ]
 ],
 "A2": [
  [
   "Yesterday I ___ to the cinema.",
   "went",
   "go",
   "goed",
   "was go"
  ],
  [
   "She is ___ than her sister.",
   "taller",
   "more tall",
   "tallest",
   "most tall"
  ],
  [
   "I ___ TV when the phone rang.",
   "was watching",
   "watched",
   "am watching",
   "watch"
  ],
  [
   "We ___ visit Alexandria next month.",
   "are going to",
   "go",
   "went",
   "are go"
  ],
  [
   "How ___ water do you drink a day?",
   "much",
   "many",
   "long",
   "often"
  ],
  [
   "He doesn't have ___ money.",
   "any",
   "some",
   "a",
   "an"
  ],
  [
   "Ahmed is the ___ student in the class.",
   "smartest",
   "smarter",
   "most smarter",
   "more smart"
  ],
  [
   "“Would you like some tea?” — “___”",
   "Yes, please.",
   "Yes, I like.",
   "Thanks, I would not.",
   "No, I am."
  ],
  [
   "I've never ___ sushi.",
   "eaten",
   "ate",
   "eat",
   "eating"
  ],
  [
   "You ___ wear a seatbelt in the car. It's the law.",
   "must",
   "can",
   "might",
   "would"
  ],
  [
   "I ___ a great film last night.",
   "saw",
   "seen",
   "see",
   "was see"
  ],
  [
   "There isn't ___ milk in the fridge.",
   "any",
   "some",
   "a",
   "many"
  ],
  [
   "My town is ___ than Cairo.",
   "smaller",
   "more small",
   "smallest",
   "small"
  ],
  [
   "___ you ever been to London?",
   "Have",
   "Did",
   "Do",
   "Are"
  ],
  [
   "He's afraid ___ dogs.",
   "of",
   "at",
   "from",
   "to"
  ],
  [
   "If you heat ice, it ___.",
   "melts",
   "will melting",
   "melt",
   "is melt"
  ],
  [
   "I usually ___ to work by metro.",
   "go",
   "goes",
   "am going",
   "went"
  ],
  [
   "We didn't ___ the match yesterday.",
   "watch",
   "watched",
   "watching",
   "watches"
  ],
  [
   "This bag is ___ expensive than that one.",
   "more",
   "most",
   "much",
   "very"
  ],
  [
   "Can you tell me the way ___ the station?",
   "to",
   "at",
   "on",
   "in"
  ],
  [
   "She ___ dinner when I called her.",
   "was cooking",
   "cooks",
   "cooked",
   "is cooking"
  ],
  [
   "How ___ is it from here to the airport?",
   "far",
   "long time",
   "much",
   "many"
  ],
  [
   "I have to ___ up early tomorrow.",
   "get",
   "gets",
   "getting",
   "got"
  ],
  [
   "The opposite of “cheap” is:",
   "expensive",
   "easy",
   "early",
   "quiet"
  ],
  [
   "You look tired. You ___ go to bed early.",
   "should",
   "can",
   "would",
   "are"
  ],
  [
   "She is interested ___ music.",
   "in",
   "on",
   "at",
   "of"
  ],
  [
   "Would you like ___ come with us?",
   "to",
   "for",
   "that",
   "-ing"
  ],
  [
   "“Sorry, I'm late.” — “___”",
   "That's OK.",
   "You're welcome.",
   "Good luck.",
   "See you."
  ],
  [
   "We're ___ to the beach tomorrow.",
   "going",
   "go",
   "went",
   "gone"
  ],
  [
   "My phone is broken. I need ___ a new one.",
   "to buy",
   "buy",
   "buying",
   "bought"
  ]
 ],
 "B1": [
  [
   "If it rains tomorrow, we ___ at home.",
   "will stay",
   "would stay",
   "stayed",
   "stay"
  ],
  [
   "I've lived here ___ 2019.",
   "since",
   "for",
   "from",
   "during"
  ],
  [
   "She asked me where ___.",
   "I lived",
   "did I live",
   "do I live",
   "I do live"
  ],
  [
   "This book ___ by a famous author in 1990.",
   "was written",
   "wrote",
   "is written",
   "has written"
  ],
  [
   "I'm not used to ___ up early.",
   "getting",
   "get",
   "got",
   "gets"
  ],
  [
   "He suggested ___ a taxi.",
   "taking",
   "to take",
   "take",
   "to taking"
  ],
  [
   "You ___ smoke here; it's forbidden.",
   "mustn't",
   "don't have to",
   "needn't",
   "shouldn't to"
  ],
  [
   "She's the woman ___ car was stolen.",
   "whose",
   "who's",
   "which",
   "whom"
  ],
  [
   "I ___ him for ten years.",
   "have known",
   "know",
   "knew",
   "am knowing"
  ],
  [
   "Although he was tired, ___.",
   "he kept working",
   "but he kept working",
   "however he kept working",
   "despite he kept working"
  ],
  [
   "I wish I ___ a car.",
   "had",
   "have",
   "would have",
   "having"
  ],
  [
   "She's been working here ___ three years.",
   "for",
   "since",
   "from",
   "during"
  ],
  [
   "He said he ___ tired.",
   "was",
   "is",
   "were",
   "be"
  ],
  [
   "The film was so boring that I ___ asleep.",
   "fell",
   "fall",
   "felled",
   "falling"
  ],
  [
   "You should ___ your teeth twice a day.",
   "brush",
   "to brush",
   "brushing",
   "brushes"
  ],
  [
   "I'll call you as soon as I ___ home.",
   "get",
   "will get",
   "got",
   "am getting"
  ],
  [
   "This is the restaurant ___ we had dinner last week.",
   "where",
   "who",
   "whose",
   "what"
  ],
  [
   "It's the ___ film I've ever seen.",
   "best",
   "better",
   "good",
   "most good"
  ],
  [
   "I used to ___ football when I was a child.",
   "play",
   "playing",
   "played",
   "plays"
  ],
  [
   "She didn't go out because she ___ a cold.",
   "had",
   "has",
   "have",
   "having"
  ],
  [
   "Neither of them ___ the answer.",
   "knows",
   "know",
   "are knowing",
   "knowing"
  ],
  [
   "He apologized ___ being late.",
   "for",
   "of",
   "to",
   "with"
  ],
  [
   "If I ___ you, I'd take the job.",
   "were",
   "would be",
   "will be",
   "am"
  ],
  [
   "The meeting has been ___ until next week.",
   "postponed",
   "postponing",
   "postpone",
   "postpones"
  ],
  [
   "Which word means “to get better after being ill”?",
   "recover",
   "recall",
   "remove",
   "repeat"
  ],
  [
   "There's ___ traffic in Cairo today.",
   "a lot of",
   "many",
   "a few",
   "several"
  ],
  [
   "She's afraid of ___ alone at night.",
   "being",
   "be",
   "been",
   "to being"
  ],
  [
   "I'd like to ___ a table for two at eight.",
   "book",
   "borrow",
   "lend",
   "hire"
  ],
  [
   "Wait here ___ I come back.",
   "until",
   "during",
   "since",
   "by"
  ],
  [
   "He works hard; ___, he never gets promoted.",
   "however",
   "because",
   "so",
   "although"
  ]
 ],
 "B2": [
  [
   "If I ___ more time, I would learn another language.",
   "had",
   "have",
   "will have",
   "would have"
  ],
  [
   "By the time we arrived, the film ___.",
   "had already started",
   "already started",
   "has already started",
   "was already starting"
  ],
  [
   "I wish I ___ speak French.",
   "could",
   "can",
   "will",
   "would"
  ],
  [
   "He denied ___ the window.",
   "breaking",
   "to break",
   "break",
   "having to break"
  ],
  [
   "The report ___ by Friday.",
   "must be finished",
   "must finish",
   "must be finish",
   "must finishing"
  ],
  [
   "She's very good ___ solving problems.",
   "at",
   "in",
   "for",
   "with"
  ],
  [
   "Hardly ___ the house when it started to rain.",
   "had we left",
   "we had left",
   "did we leave",
   "we left"
  ],
  [
   "“You look tired.” — “Yes, I ___ all night.”",
   "have been working",
   "worked",
   "am working",
   "work"
  ],
  [
   "Which word is closest to “reluctant”?",
   "unwilling",
   "eager",
   "careless",
   "honest"
  ],
  [
   "I'd rather you ___ tell anyone.",
   "didn't",
   "don't",
   "won't",
   "wouldn't"
  ],
  [
   "She'd have passed if she ___ harder.",
   "had studied",
   "studied",
   "would study",
   "has studied"
  ],
  [
   "I can't help ___ when he tells that joke.",
   "laughing",
   "to laugh",
   "laugh",
   "laughed"
  ],
  [
   "The new law will come into ___ next year.",
   "effect",
   "action",
   "work",
   "use"
  ],
  [
   "He's not used to ___ so much work.",
   "having",
   "have",
   "had",
   "be having"
  ],
  [
   "By next June, I ___ here for ten years.",
   "will have worked",
   "will work",
   "have worked",
   "am working"
  ],
  [
   "The suspect is said ___ the country.",
   "to have left",
   "having left",
   "that left",
   "to left"
  ],
  [
   "I'd appreciate ___ if you could keep this confidential.",
   "it",
   "that",
   "this",
   "them"
  ],
  [
   "Despite ___ hard, he failed the exam.",
   "studying",
   "he studied",
   "of studying",
   "to study"
  ],
  [
   "She ___ to have forgotten our appointment.",
   "seems",
   "looks like",
   "appears like",
   "is like"
  ],
  [
   "We ran ___ of milk, so I went to the shop.",
   "out",
   "off",
   "short",
   "down"
  ],
  [
   "Not until yesterday ___ the news.",
   "did I hear",
   "I heard",
   "I did hear",
   "heard I"
  ],
  [
   "He's the kind of person ___ you can always rely.",
   "on whom",
   "whom on",
   "who on",
   "on which"
  ],
  [
   "Could you ___ me a favour?",
   "do",
   "make",
   "take",
   "have"
  ],
  [
   "The results were ___ than we had expected.",
   "far better",
   "more better",
   "much good",
   "very better"
  ],
  [
   "“Sceptical” is closest in meaning to:",
   "doubtful",
   "hopeful",
   "grateful",
   "careful"
  ],
  [
   "I'd rather ___ at home than go out tonight.",
   "stay",
   "to stay",
   "staying",
   "stayed"
  ],
  [
   "She spoke quietly ___ the baby wouldn't wake up.",
   "so that",
   "in order",
   "because that",
   "for"
  ],
  [
   "The building ___ at the moment, so it's closed.",
   "is being renovated",
   "is renovating",
   "renovates",
   "has renovated"
  ],
  [
   "It was ___ a good film that we watched it twice.",
   "such",
   "so",
   "very",
   "too"
  ],
  [
   "He gave up ___ when he turned forty.",
   "smoking",
   "to smoke",
   "smoke",
   "smoked"
  ]
 ],
 "C1": [
  [
   "Had I known about the delay, I ___ earlier.",
   "would have left",
   "will leave",
   "had left",
   "would leave"
  ],
  [
   "The manager insisted that he ___ on time.",
   "be",
   "is",
   "was",
   "will be"
  ],
  [
   "Not only ___ late, but he also forgot the documents.",
   "did he arrive",
   "he arrived",
   "he did arrive",
   "arrived he"
  ],
  [
   "“Ubiquitous” means:",
   "found everywhere",
   "very expensive",
   "hard to understand",
   "newly invented"
  ],
  [
   "She spoke so ___ that nobody could disagree.",
   "persuasively",
   "persuasive",
   "persuasion",
   "persuade"
  ],
  [
   "The findings run ___ to popular belief.",
   "counter",
   "against of",
   "opposite",
   "reverse"
  ],
  [
   "He's ___ to be promoted next year, given his results.",
   "bound",
   "obliged",
   "able",
   "worthy"
  ],
  [
   "It's high time we ___ the problem.",
   "addressed",
   "address",
   "will address",
   "are addressing"
  ],
  [
   "“She took the news in her stride” means she:",
   "reacted calmly",
   "walked quickly",
   "was very angry",
   "refused to listen"
  ],
  [
   "The proposal was rejected ___ the grounds that it was too costly.",
   "on",
   "by",
   "under",
   "for"
  ],
  [
   "Little ___ she know that the results would change her life.",
   "did",
   "does",
   "had",
   "would"
  ],
  [
   "The committee has yet ___ a decision.",
   "to reach",
   "reaching",
   "reached",
   "to reaching"
  ],
  [
   "His statement was at ___ with the facts.",
   "odds",
   "war",
   "end",
   "side"
  ],
  [
   "She is a person of great ___; everyone trusts her word.",
   "integrity",
   "integration",
   "intensity",
   "intention"
  ],
  [
   "Under no circumstances ___ the door be left unlocked.",
   "should",
   "does",
   "is",
   "has"
  ],
  [
   "The two theories are not mutually ___.",
   "exclusive",
   "excluded",
   "exclusion",
   "exclusively"
  ],
  [
   "The government is under pressure to ___ its policy.",
   "reconsider",
   "reconsidering",
   "reconsideration",
   "to reconsider"
  ],
  [
   "“To turn a blind eye” means to:",
   "deliberately ignore something wrong",
   "look very carefully",
   "feel jealous",
   "lose your sight"
  ],
  [
   "The findings shed new ___ on the disease.",
   "light",
   "lamp",
   "view",
   "sight"
  ],
  [
   "It goes ___ saying that education is important.",
   "without",
   "with",
   "by",
   "beyond"
  ],
  [
   "___ the weather improves, the match will go ahead.",
   "Provided",
   "Despite",
   "Whereas",
   "Unless"
  ],
  [
   "The jury ___ him of all charges, and he walked free.",
   "acquitted",
   "convicted",
   "accused",
   "sentenced"
  ],
  [
   "We need to ___ the risks before signing the contract.",
   "weigh up",
   "weigh out",
   "weigh off",
   "weigh at"
  ],
  [
   "The plan fell ___ because of a lack of funding.",
   "through",
   "into",
   "over",
   "behind"
  ],
  [
   "His speech was full of ___ that nobody could quite follow.",
   "digressions",
   "directions",
   "digestions",
   "dispersions"
  ],
  [
   "She is second ___ none in her knowledge of art history.",
   "to",
   "of",
   "than",
   "from"
  ],
  [
   "The company was on the ___ of bankruptcy.",
   "verge",
   "border",
   "limit",
   "rim"
  ],
  [
   "“Meticulous” means:",
   "very careful about details",
   "extremely fast",
   "rather lazy",
   "easily upset"
  ],
  [
   "Contrary ___ expectations, sales rose.",
   "to",
   "with",
   "from",
   "of"
  ],
  [
   "By no means ___ this the end of the story.",
   "is",
   "are",
   "does",
   "do"
  ]
 ],
 "C2": [
  [
   "“Her argument was specious” means it was:",
   "convincing but flawed",
   "brilliantly original",
   "dull and long",
   "emotionally moving"
  ],
  [
   "Were it not for your help, the project ___.",
   "would have collapsed",
   "will collapse",
   "had collapsed",
   "collapsed"
  ],
  [
   "His remarks were deliberately ___, leaving room for several interpretations.",
   "equivocal",
   "candid",
   "categorical",
   "explicit"
  ],
  [
   "“To bite the bullet” means to:",
   "endure something unpleasant bravely",
   "argue loudly",
   "give up quickly",
   "make a risky bet"
  ],
  [
   "Scarcely had the meeting begun ___ the fire alarm went off.",
   "when",
   "than",
   "that time",
   "while"
  ],
  [
   "The novel's ___ prose alienated many readers.",
   "convoluted",
   "lucid",
   "succinct",
   "plain"
  ],
  [
   "She is a stickler ___ tradition.",
   "for",
   "to",
   "with",
   "of"
  ],
  [
   "Her credibility was ___ by the leaked emails.",
   "eroded",
   "eluded",
   "erupted",
   "embarked"
  ],
  [
   "“The deal fell through” means the deal:",
   "failed to happen",
   "was very cheap",
   "was signed at once",
   "was too generous"
  ],
  [
   "No sooner ___ down than the phone rang.",
   "had she sat",
   "she had sat",
   "did she sat",
   "she sat"
  ],
  [
   "“Ephemeral” means:",
   "lasting a very short time",
   "extremely important",
   "highly secret",
   "deeply emotional"
  ],
  [
   "“Obsequious” describes someone who is:",
   "excessively eager to please",
   "very generous",
   "openly hostile",
   "deeply religious"
  ],
  [
   "“Pernicious” means:",
   "gradually harmful",
   "very tasty",
   "extremely loud",
   "newly discovered"
  ],
  [
   "The report is a ___ of ideas borrowed from several earlier studies.",
   "amalgam",
   "amulet",
   "amnesty",
   "ambush"
  ],
  [
   "So ___ was the evidence that the case was dropped.",
   "flimsy",
   "flimsily",
   "flimsiness",
   "flimsier"
  ],
  [
   "“To beat about the bush” means to:",
   "avoid getting to the point",
   "search a garden",
   "attack someone",
   "speak very loudly"
  ],
  [
   "She has a ___ for languages; she picked up Italian in weeks.",
   "knack",
   "knock",
   "knob",
   "nook"
  ],
  [
   "The minister's resignation was tantamount ___ an admission of guilt.",
   "to",
   "with",
   "for",
   "as"
  ],
  [
   "“Laconic” describes speech that is:",
   "using very few words",
   "very emotional",
   "extremely long",
   "deliberately rude"
  ],
  [
   "The trial was ___ by allegations of jury tampering.",
   "marred",
   "marbled",
   "marched",
   "marshalled"
  ],
  [
   "___ the evidence been stronger, the verdict might have differed.",
   "Had",
   "Was",
   "Did",
   "Should"
  ],
  [
   "The leaders' meeting was ___ with tension.",
   "fraught",
   "frayed",
   "fraudulent",
   "frugal"
  ],
  [
   "“To grasp the nettle” means to:",
   "deal boldly with a difficult problem",
   "avoid a duty",
   "hurt yourself",
   "give up quietly"
  ],
  [
   "“Acquiesce” means to:",
   "accept without protest",
   "argue strongly",
   "examine closely",
   "celebrate loudly"
  ],
  [
   "Her ___ answer left the interviewer unsure what she really thought.",
   "noncommittal",
   "unequivocal",
   "candid",
   "forthright"
  ],
  [
   "The film was panned by critics but became a ___ classic.",
   "cult",
   "culprit",
   "cultivated",
   "culture"
  ],
  [
   "It's a moot ___ whether the policy will succeed.",
   "point",
   "fact",
   "truth",
   "place"
  ],
  [
   "He was ___ by the sheer scale of the task.",
   "daunted",
   "daubed",
   "dented",
   "dawdled"
  ],
  [
   "In ___ of repeated warnings, they went ahead.",
   "defiance",
   "defence",
   "deference",
   "definition"
  ],
  [
   "“Ostensibly” means:",
   "apparently, but not necessarily truly",
   "definitely",
   "secretly",
   "quickly"
  ]
 ]
};
