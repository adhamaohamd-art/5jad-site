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
  ]
 ]
};
