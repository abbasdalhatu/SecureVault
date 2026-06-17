export const languagesData = [
  {
    id: "hawaiian",
    name: "Hawaiian",
    nativeName: "ʻŌlelo Hawaiʻi",
    status: "Vulnerable",
    endangered: true,
    flag: "🌺",
    history: "Hawaiian is a Polynesian language. Due to historical bans, it was once near extinction, but a vibrant cultural renaissance (including 'Pūnana Leo' immersion nurseries) is reviving it. Every Hawaiian word ends in a vowel, and the alphabet has only 12 letters!",
    levels: {
      beginner: {
        id: "beginner",
        name: "Beginner",
        modules: [
          {
            id: "hawaiian_beg_mod1",
            title: "Module 1: Foundations of Aloha",
            description: "Discover the spiritual connection in greetings and learn to count in ʻŌlelo Hawaiʻi.",
            lessons: [
              {
                id: "hawaiian_beg_mod1_l1",
                title: "Lesson 1: Warm Greetings",
                concept: "In Hawaiian, greetings carry mana (spiritual energy). 'Aloha' is more than hello; it means presence, love, and sharing the breath of life.",
                vocab: [
                  { word: "Aloha", translation: "Hello, love, or breath of life", transliteration: "ah-LOH-hah", tip: "Say it with warmth and intention." },
                  { word: "Mahalo", translation: "Thank you", transliteration: "mah-HAH-loh", tip: "Expresses gratitude and admiration." },
                  { word: "Pehea ʻoe?", translation: "How are you?", transliteration: "peh-HEH-ah OY?", tip: "The 'okina (glottal stop 'ʻ') is a short catch in the throat, like in 'uh-oh'." },
                  { word: "Maikaʻi", translation: "Good, fine", transliteration: "my-KAH-ee", tip: "Pronounce the 'ai' like 'eye'." },
                  { word: "A hui hou", translation: "Until we meet again", transliteration: "ah HOO-ee HOH-oo", tip: "There is no direct word for 'goodbye'; we say until we meet again." }
                ],
                matchGame: [
                  { id: "h1", target: "Aloha", english: "Hello, love, or breath of life" },
                  { id: "h2", target: "Mahalo", english: "Thank you" },
                  { id: "h3", target: "Pehea ʻoe?", english: "How are you?" },
                  { id: "h4", target: "Maikaʻi", english: "Good, fine" },
                  { id: "h5", target: "A hui hou", english: "Until we meet again" }
                ],
                wordBuilder: {
                  prompt: "Translate: 'How are you?'",
                  scrambled: ["Pehea", "ʻoe", "?", "Aloha", "Mahalo"],
                  correct: ["Pehea", "ʻoe", "?"]
                },
                speechChallenge: {
                  phrase: "Mahalo nui loa",
                  translation: "Thank you very much",
                  phonetic: "mah-HAH-loh NOO-ee LOH-ah"
                }
              },
              {
                id: "hawaiian_beg_mod1_l2",
                title: "Lesson 2: Sacred Numbers",
                concept: "Counting is connected to nature. Notice how the numbers sound musical, reflecting the oral traditions of the islands.",
                vocab: [
                  { word: "Kahi", translation: "One", transliteration: "KAH-hee", tip: "Starts the sequence." },
                  { word: "Lua", translation: "Two", transliteration: "LOO-ah", tip: "Think of a 'lual' or duo." },
                  { word: "Kolu", translation: "Three", transliteration: "KOH-loo", tip: "Sounds like trio." },
                  { word: "Hā", translation: "Four", transliteration: "hah", tip: "Pronounced with a long 'a' breath." },
                  { word: "Lima", translation: "Five", transliteration: "LEE-mah", tip: "Also means 'hand' in Hawaiian, since a hand has five fingers!" }
                ],
                matchGame: [
                  { id: "n1", target: "Kahi", english: "One" },
                  { id: "n2", target: "Lua", english: "Two" },
                  { id: "n3", target: "Kolu", english: "Three" },
                  { id: "n4", target: "Hā", english: "Four" },
                  { id: "n5", target: "Lima", english: "Five" }
                ],
                wordBuilder: {
                  prompt: "Translate: 'Three, Four, Five'",
                  scrambled: ["Kolu", "Hā", "Lima", "Kahi", "Lua"],
                  correct: ["Kolu", "Hā", "Lima"]
                },
                speechChallenge: {
                  phrase: "Ekolu pua",
                  translation: "Three flowers",
                  phonetic: "eh-KOH-loo POO-ah"
                }
              }
            ]
          },
          {
            id: "hawaiian_beg_mod2",
            title: "Module 2: ʻOhana & Food",
            description: "Learn how to talk about your family and name local Hawaiian foods.",
            lessons: [
              {
                id: "hawaiian_beg_mod2_l1",
                title: "Lesson 1: Meet the ʻOhana",
                concept: "ʻOhana means family in a broad sense, representing support, responsibility, and love that bonds generations together.",
                vocab: [
                  { word: "ʻOhana", translation: "Family", transliteration: "oh-HAH-nah", tip: "Includes blood relatives, adoptive family, and close friends." },
                  { word: "Makuahine", translation: "Mother", transliteration: "mah-koo-ah-HEE-neh", tip: "Literally means 'female parent'." },
                  { word: "Makua kāne", translation: "Father", transliteration: "mah-koo-ah KAH-neh", tip: "Literally means 'male parent'." },
                  { word: "Keiki", translation: "Child", transliteration: "kay-EE-kee", tip: "Used for kids or offspring." },
                  { word: "Kupuna", translation: "Elder / Grandparent", transliteration: "koo-POO-nah", tip: "Elders are the keepers of wisdom and history." }
                ],
                matchGame: [
                  { id: "o1", target: "ʻOhana", english: "Family" },
                  { id: "o2", target: "Makuahine", english: "Mother" },
                  { id: "o3", target: "Makua kāne", english: "Father" },
                  { id: "o4", target: "Keiki", english: "Child" },
                  { id: "o5", target: "Kupuna", english: "Elder / Grandparent" }
                ],
                wordBuilder: {
                  prompt: "Translate: 'My family'",
                  scrambled: ["Kōku", "ʻohana", "Makuahine", "makua"],
                  correct: ["Kōku", "ʻohana"]
                },
                speechChallenge: {
                  phrase: "Aloha kupuna",
                  translation: "Greetings elder",
                  phonetic: "ah-LOH-hah koo-POO-nah"
                }
              },
              {
                id: "hawaiian_beg_mod2_l2",
                title: "Lesson 2: Island Food (Bia)",
                concept: "Traditional food cultivates connection. Taro (kalo) is considered an elder brother to the Hawaiian people in their creation chant.",
                vocab: [
                  { word: "Kalo", translation: "Taro root", transliteration: "KAH-loh", tip: "Pounded kalo forms poi, the traditional starch staple." },
                  { word: "Iʻa", translation: "Fish", transliteration: "EE-ah", tip: "A major source of protein." },
                  { word: "Niu", translation: "Coconut", transliteration: "NEE-oo", tip: "Used for water, milk, and fibers." },
                  { word: "Poi", translation: "Pounded taro paste", transliteration: "poy", tip: "Ferments slightly, giving a sour, delicious taste." },
                  { word: "Pāʻina", translation: "Feast / Party", transliteration: "pah-EE-nah", tip: "A celebration of food and community." }
                ],
                matchGame: [
                  { id: "f1", target: "Kalo", english: "Taro root" },
                  { id: "f2", target: "Iʻa", english: "Fish" },
                  { id: "f3", target: "Niu", english: "Coconut" },
                  { id: "f4", target: "Poi", english: "Pounded taro paste" },
                  { id: "f5", target: "Pāʻina", english: "Feast / Party" }
                ],
                wordBuilder: {
                  prompt: "Translate: 'Pounded taro paste and fish'",
                  scrambled: ["Poi", "a", "me", "ka", "iʻa", "niu"],
                  correct: ["Poi", "a", "me", "ka", "iʻa"]
                },
                speechChallenge: {
                  phrase: "Ono loa ka poi",
                  translation: "The poi is very delicious",
                  phonetic: "OH-noh LOH-ah kah poy"
                }
              }
            ]
          }
        ]
      },
      intermediate: {
        id: "intermediate",
        name: "Intermediate",
        scenarios: [
          {
            id: "hawaiian_int_sc1",
            title: "At a Hawaiian Pāʻina (Feast)",
            description: "Practice greeting a local host and asking for poi and fish at a traditional celebration.",
            difficulty: "Medium",
            steps: [
              {
                speaker: "Kai (Host)",
                botLine: "Aloha! Welina mai i ko mākou pāʻina!",
                botTranslation: "Hello! Welcome to our feast!",
                hint: "Respond with 'Hello! Thank you very much.'",
                expectedResponses: [
                  "Aloha! Mahalo nui loa.",
                  "Aloha! Mahalo nui loa"
                ],
                phonetics: "ah-LOH-hah! mah-HAH-loh NOO-ee LOH-ah."
              },
              {
                speaker: "Kai (Host)",
                botLine: "Pehea ʻoe e kēia ahiahi?",
                botTranslation: "How are you this evening?",
                hint: "Say: 'I am fine, thank you.'",
                expectedResponses: [
                  "Maikaʻi au, mahalo.",
                  "Maika'i au, mahalo",
                  "Maikaʻi au mahalo"
                ],
                phonetics: "my-KAH-ee ow, mah-HAH-loh."
              },
              {
                speaker: "Kai (Host)",
                botLine: "Ono ka poi a me ka iʻa. Makemake ʻoe?",
                botTranslation: "The poi and fish are delicious. Would you like some?",
                hint: "Say: 'Yes, please. I like taro paste.'",
                expectedResponses: [
                  "ʻAe, mesedez. Makemake au i ka poi.",
                  "Ae, please. Makemake au i ka poi",
                  "Ae, makemake au i ka poi"
                ],
                phonetics: "eye, mah-keh-MAH-keh ow ee kah poy."
              }
            ]
          }
        ]
      },
      advanced: {
        id: "advanced",
        name: "Advanced",
        cultureText: {
          title: "The Legend of Pele & Hiʻiaka",
          text: "Pele, the volcanic fire goddess of Halemaʻumaʻu, sent her youngest sister Hiʻiaka on a dangerous quest across the Hawaiian archipelago to fetch her lover, Lohiʻau. The journey test Hiʻiaka's courage, requiring chant power (oli) and magical skirts to fight demons. Hiʻiaka represents the growth of new vegetation on cooled lava flows, representing the continuous cycle of destruction and rebirth on the islands. In native chants, Pele's fires are detailed with deep geological accuracy.",
          questions: [
            {
              question: "What does Hiʻiaka represent in Hawaiian nature?",
              options: [
                "The ocean waves",
                "New plant growth on cooled lava",
                "The winds of Maui",
                "Tectonic earthquakes"
              ],
              answer: "New plant growth on cooled lava"
            },
            {
              question: "What is Pele's sacred domain?",
              options: [
                "Deep underwater reefs",
                "The snowy summit of Mauna Kea",
                "The volcanic crater of Halemaʻumaʻu",
                "The lush valleys of Kauai"
              ],
              answer: "The volcanic crater of Halemaʻumaʻu"
            }
          ]
        }
      }
    }
  },
  {
    id: "irish",
    name: "Irish",
    nativeName: "Gaeilge",
    status: "Vulnerable",
    endangered: true,
    flag: "🇮🇪",
    history: "Irish is a Goidelic Celtic language. Historically suppressed under British rule, it remains the first official language of Ireland. It is spoken as a community tongue in coastal pockets known as the Gaeltacht, and is currently experiencing a huge surge in urban revival.",
    levels: {
      beginner: {
        id: "beginner",
        name: "Beginner",
        modules: [
          {
            id: "irish_beg_mod1",
            title: "Module 1: Fáilte (Welcome)",
            description: "Speak your first words of greeting and learn basic counts in Irish.",
            lessons: [
              {
                id: "irish_beg_mod1_l1",
                title: "Lesson 1: Greetings",
                concept: "Traditional Irish greetings have religious origins. 'Dia dhuit' literally means 'God to you', and the responder replies 'Dia is Muire dhuit' ('God and Mary to you').",
                vocab: [
                  { word: "Dia dhuit", translation: "Hello (to one person)", transliteration: "DEE-ah gwitch", tip: "The standard way to say hello." },
                  { word: "Dia is Muire dhuit", translation: "Hello (response)", transliteration: "DEE-ah iss MWIR-eh gwitch", tip: "Spoken back to someone who greeted you first." },
                  { word: "Conas atá tú?", translation: "How are you?", transliteration: "KUN-us uh-TAW too?", tip: "Used in Munster dialect; in others, they say 'Cad é mar atá tú?'" },
                  { word: "Tá mé go maith", translation: "I am good", transliteration: "taw may guh mah", tip: "Literally 'Am I well'." },
                  { word: "Slán", translation: "Goodbye", transliteration: "slawn", tip: "Short for 'Slán abhaile' (safe home) or 'Slán agat' (safety with you)." }
                ],
                matchGame: [
                  { id: "ir1", target: "Dia dhuit", english: "Hello (to one person)" },
                  { id: "ir2", target: "Dia is Muire dhuit", english: "Hello (response)" },
                  { id: "ir3", target: "Conas atá tú?", english: "How are you?" },
                  { id: "ir4", target: "Tá mé go maith", english: "I am good" },
                  { id: "ir5", target: "Slán", english: "Goodbye" }
                ],
                wordBuilder: {
                  prompt: "Translate: 'How are you?'",
                  scrambled: ["Conas", "atá", "tú", "?", "Dia", "mé"],
                  correct: ["Conas", "atá", "tú", "?"]
                },
                speechChallenge: {
                  phrase: "Dia dhuit cara",
                  translation: "Hello friend",
                  phonetic: "DEE-ah gwitch KAH-ruh"
                }
              },
              {
                id: "irish_beg_mod1_l2",
                title: "Lesson 2: Counting Things",
                concept: "Irish has different counting systems for numbers, people, and objects! Here we will learn the general mathematical count.",
                vocab: [
                  { word: "Aon", translation: "One", transliteration: "ayn", tip: "Spoken as 'a haon' when counting alone." },
                  { word: "Dó", translation: "Two", transliteration: "doh", tip: "Spoken as 'a dó'." },
                  { word: "Trí", translation: "Three", transliteration: "tree", tip: "Very similar to English!" },
                  { word: "Ceathair", translation: "Four", transliteration: "KAH-hir", tip: "Pronounce the 'ch' as a soft 'h' breath." },
                  { word: "Cúig", translation: "Five", transliteration: "KOO-ig", tip: "Like 'coo' plus 'ig'." }
                ],
                matchGame: [
                  { id: "irn1", target: "Aon", english: "One" },
                  { id: "irn2", target: "Dó", english: "Two" },
                  { id: "irn3", target: "Trí", english: "Three" },
                  { id: "irn4", target: "Ceathair", english: "Four" },
                  { id: "irn5", target: "Cúig", english: "Five" }
                ],
                wordBuilder: {
                  prompt: "Translate: 'One, Two, Three'",
                  scrambled: ["Aon", "dó", "trí", "ceathair", "cúig"],
                  correct: ["Aon", "dó", "trí"]
                },
                speechChallenge: {
                  phrase: "Aon dó trí",
                  translation: "One two three",
                  phonetic: "ayn doh tree"
                }
              }
            ]
          }
        ]
      },
      intermediate: {
        id: "intermediate",
        name: "Intermediate",
        scenarios: [
          {
            id: "irish_int_sc1",
            title: "At a Dublin Café",
            description: "Practice ordering hot tea and bread in Irish from the café server.",
            difficulty: "Medium",
            steps: [
              {
                speaker: "Aoife (Server)",
                botLine: "Dia dhuit! Cad ba mhaith leat a ól?",
                botTranslation: "Hello! What would you like to drink?",
                hint: "Say: 'Hello! I would like tea, please.'",
                expectedResponses: [
                  "Dia dhuit! Ba mhaith liom tae, le do thoil.",
                  "Dia dhuit ba mhaith liom tae le do thoil",
                  "Ba mhaith liom tae le do thoil"
                ],
                phonetics: "DEE-ah gwitch! bah wah lyum tay, leh duh hul."
              },
              {
                speaker: "Aoife (Server)",
                botLine: "Ar mhaith leat bainne nó siúcra?",
                botTranslation: "Would you like milk or sugar?",
                hint: "Say: 'Milk, please. No sugar.'",
                expectedResponses: [
                  "Bainne, le do thoil. Gan siúcra.",
                  "Bainne le do thoil gan siucra",
                  "Bainne le do thoil"
                ],
                phonetics: "BAHN-yeh, leh duh hul. gahn SHOO-kruh."
              },
              {
                speaker: "Aoife (Server)",
                botLine: "Seo chugat. Go raibh maith agat!",
                botTranslation: "Here you go. Thank you!",
                hint: "Say: 'Thank you! Goodbye.'",
                expectedResponses: [
                  "Go raibh maith agat! Slán.",
                  "Go raibh maith agat slan",
                  "Go raibh maith agat"
                ],
                phonetics: "guh rev mah ah-gut! slawn."
              }
            ]
          }
        ]
      },
      advanced: {
        id: "advanced",
        name: "Advanced",
        cultureText: {
          title: "Tír na nÓg (The Land of Youth)",
          text: "Tír na nÓg is one of the most famous realms in Irish mythology, an otherworldly paradise where disease and aging do not exist. In the legend, Oisín, a great warrior of the Fianna, fell in love with Niamh Chinn Óir (Niamh of the Golden Hair), the daughter of the king of Tír na nÓg. He rode across the sea on a magical horse to live with her. After three hundred years, which felt like three years, Oisín grew homesick. Niamh warned him: if his feet touched the soil of Ireland, the years would catch up to him. Returning to help some men lift a stone, Oisín fell from his horse. The moment he touched the earth, he instantly aged into an old, withered man.",
          questions: [
            {
              question: "Who did Oisín fall in love with?",
              options: [
                "Queen Maeve",
                "Niamh of the Golden Hair",
                "A woodland banshee",
                "The goddess Danu"
              ],
              answer: "Niamh of the Golden Hair"
            },
            {
              question: "What happened when Oisín touched Irish soil?",
              options: [
                "He turned into a stone giant",
                "He instantly aged 300 years",
                "He became the king of Ireland",
                "He fell asleep for eternity"
              ],
              answer: "He instantly aged 300 years"
            }
          ]
        }
      }
    }
  },
  {
    id: "basque",
    name: "Basque",
    nativeName: "Euskara",
    status: "Vulnerable",
    endangered: true,
    flag: "🇪🇸",
    history: "Basque is a language isolate spoken in the Pyrenees mountains between Spain and France. It shares no known ancestral connections with Indo-European or any other surviving language families, making it a mysterious link to Western Europe's pre-Roman past.",
    levels: {
      beginner: {
        id: "beginner",
        name: "Beginner",
        modules: [
          {
            id: "basque_beg_mod1",
            title: "Module 1: Kaixo & Foundations",
            description: "Learn greetings, gratitude, and primary numbers in Euskara.",
            lessons: [
              {
                id: "basque_beg_mod1_l1",
                title: "Lesson 1: Greetings",
                concept: "Basque (Euskara) is a language isolate. Look at the greetings—they look and sound completely distinct from French, Spanish, or English!",
                vocab: [
                  { word: "Kaixo", translation: "Hello", transliteration: "KYE-shoh", tip: "The letter 'x' is pronounced like 'sh' in English." },
                  { word: "Eskerrik asko", translation: "Thank you very much", transliteration: "ess-KAY-reek ASH-koh", tip: "Literally means 'many thanks'." },
                  { word: "Mesedez", translation: "Please", transliteration: "meh-SHEH-dehz", tip: "Used for requests." },
                  { word: "Nola zaude?", translation: "How are you?", transliteration: "NOH-lah ZOW-deh?", tip: "The 'z' is a soft voiceless 's' sound." },
                  { word: "Ongi", translation: "Well / Fine", transliteration: "OHN-gee", tip: "Hard 'g' as in 'goat'." }
                ],
                matchGame: [
                  { id: "ba1", target: "Kaixo", english: "Hello" },
                  { id: "ba2", target: "Eskerrik asko", english: "Thank you very much" },
                  { id: "ba3", target: "Mesedez", english: "Please" },
                  { id: "ba4", target: "Nola zaude?", english: "How are you?" },
                  { id: "ba5", target: "Ongi", english: "Well / Fine" }
                ],
                wordBuilder: {
                  prompt: "Translate: 'Hello, thank you!'",
                  scrambled: ["Kaixo", "eskerrik", "asko", "!", "mesedez"],
                  correct: ["Kaixo", "eskerrik", "asko", "!"]
                },
                speechChallenge: {
                  phrase: "Kaixo lagun",
                  translation: "Hello friend",
                  phonetic: "KYE-shoh lah-goon"
                }
              },
              {
                id: "basque_beg_mod1_l2",
                title: "Lesson 2: Numbers (Zenbakiak)",
                concept: "Counting in Basque shows its unique vocabulary. Memorizing these is the first key step to shopping in the Basque Country.",
                vocab: [
                  { word: "Bat", translation: "One", transliteration: "baht", tip: "Easy to remember!" },
                  { word: "Bi", translation: "Two", transliteration: "bee", tip: "Like 'bee'." },
                  { word: "Hiru", translation: "Three", transliteration: "HEE-roo", tip: "The letter 'H' is silent in standard Basque." },
                  { word: "Lau", translation: "Four", transliteration: "low", tip: "Rhymes with cow." },
                  { word: "Bost", translation: "Five", transliteration: "bosht", tip: "The 's' is slightly hissed." }
                ],
                matchGame: [
                  { id: "ban1", target: "Bat", english: "One" },
                  { id: "ban2", target: "Bi", english: "Two" },
                  { id: "ban3", target: "Hiru", english: "Three" },
                  { id: "ban4", target: "Lau", english: "Four" },
                  { id: "ban5", target: "Bost", english: "Five" }
                ],
                wordBuilder: {
                  prompt: "Translate: 'One, Two, Three'",
                  scrambled: ["Bat", "bi", "hiru", "lau", "bost"],
                  correct: ["Bat", "bi", "hiru"]
                },
                speechChallenge: {
                  phrase: "Lau bi bost",
                  translation: "Four two five",
                  phonetic: "low bee bosht"
                }
              }
            ]
          }
        ]
      },
      intermediate: {
        id: "intermediate",
        name: "Intermediate",
        scenarios: [
          {
            id: "basque_int_sc1",
            title: "Pintxo Crawl in Donostia",
            description: "Practice ordering the local tapas (pintxos) and Basque cider at a lively tavern in San Sebastián.",
            difficulty: "Medium",
            steps: [
              {
                speaker: "Aitor (Bartender)",
                botLine: "Kaixo! Zer nahi duzu edateko?",
                botTranslation: "Hello! What do you want to drink?",
                hint: "Say: 'Hello! A cider, please.'",
                expectedResponses: [
                  "Kaixo! Sagardo bat, mesedez.",
                  "Kaixo sagardo bat mesedez",
                  "Sagardo bat mesedez"
                ],
                phonetics: "KYE-shoh! sah-GAHR-doh baht, meh-SHEH-dehz."
              },
              {
                speaker: "Aitor (Bartender)",
                botLine: "Beno. Eta pintxorik nahi duzu?",
                botTranslation: "Good. And do you want some pintxos (tapas)?",
                hint: "Say: 'Yes, please. Two pintxos.'",
                expectedResponses: [
                  "Bai, mesedez. Bi pintxo.",
                  "Bai mesedez bi pintxo",
                  "Bi pintxo mesedez"
                ],
                phonetics: "bye, meh-SHEH-dehz. bee PEEN-choh."
              },
              {
                speaker: "Aitor (Bartender)",
                botLine: "Hemen duzu. On egin!",
                botTranslation: "Here it is. Bon appétit!",
                hint: "Say: 'Thank you very much! Goodbye.'",
                expectedResponses: [
                  "Eskerrik asko! Agur.",
                  "Eskerrik asko agur",
                  "Eskerrik asko"
                ],
                phonetics: "ess-KAY-reek ASH-koh! ah-GOOR."
              }
            ]
          }
        ]
      },
      advanced: {
        id: "advanced",
        name: "Advanced",
        cultureText: {
          title: "Herri Kirolak (Basque Rural Sports)",
          text: "Basque rural sports, or 'Herri Kirolak', originate directly from the historic farming, woodcutting, and fishing tasks of the Basque countryside. The challenges are demanding tests of raw strength and stamina. Foremost among them is 'Aizkora Jokoa' (wood chopping), where competitors stand directly on massive logs and chop them in half. Another crowd favorite is 'Harri Jasotzea' (stone lifting), where specialized athletes lift round or rectangular granite stones weighing up to 300 kilograms onto their shoulders. These events are central to seasonal town festivals (Jaiak) and showcase the Basque cultural emphasis on endurance and community labor (auzolana).",
          questions: [
            {
              question: "What does Herri Kirolak translate to?",
              options: [
                "Folk dancing",
                "Mountain hiking",
                "Rural sports",
                "Harvest cooking"
              ],
              answer: "Rural sports"
            },
            {
              question: "What is Aizkora Jokoa?",
              options: [
                "Stone lifting",
                "Wood chopping",
                "Tug of war",
                "Rowing races"
              ],
              answer: "Wood chopping"
            }
          ]
        }
      }
    }
  },
  {
    id: "quechua",
    name: "Quechua",
    nativeName: "Runasimi",
    status: "Vulnerable",
    endangered: true,
    flag: "🇵🇪",
    history: "Quechua (Runasimi) is an indigenous language family of the Andes. Once the administrative tongue of the Inca Empire, it remains spoken by millions of people across Peru, Bolivia, and Ecuador, carrying deep ecological knowledge of the Andes mountain range.",
    levels: {
      beginner: {
        id: "beginner",
        name: "Beginner",
        modules: [
          {
            id: "quechua_beg_mod1",
            title: "Module 1: Rimaykullayki & Counts",
            description: "Learn classic greetings and number counts in the tongue of the Incas.",
            lessons: [
              {
                id: "quechua_beg_mod1_l1",
                title: "Lesson 1: Greetings",
                concept: "Quechua is agglutinative, meaning words are built by adding suffixes. Notice how greetings share the suffix '-lla' which denotes affection and politeness.",
                vocab: [
                  { word: "Allillanchu", translation: "How are you? (Are you well?)", transliteration: "ah-yee-yahn-choo", tip: "Pronounce 'll' as 'y' like in Spanish." },
                  { word: "Allillanmi", translation: "I am well (response)", transliteration: "ah-yee-yahn-mee", tip: "The suffix '-mi' asserts certainty." },
                  { word: "Sulpayki", translation: "Thank you", transliteration: "sool-pie-kee", tip: "Expresses gratitude." },
                  { word: "Tupananchiskama", translation: "Until we meet again", transliteration: "too-pah-nahn-chees-kah-mah", tip: "Literally 'until our next encounter'." },
                  { word: "Rimaykullayki", translation: "Greetings / Hello", transliteration: "ree-my-koo-yah-yee", tip: "A polite greeting to start a conversation." }
                ],
                matchGame: [
                  { id: "qu1", target: "Allillanchu", english: "How are you? (Are you well?)" },
                  { id: "qu2", target: "Allillanmi", english: "I am well (response)" },
                  { id: "qu3", target: "Sulpayki", english: "Thank you" },
                  { id: "qu4", target: "Tupananchiskama", english: "Until we meet again" },
                  { id: "qu5", target: "Rimaykullayki", english: "Greetings / Hello" }
                ],
                wordBuilder: {
                  prompt: "Translate: 'Are you well?'",
                  scrambled: ["Allillanchu", "Allillanmi", "Sulpayki", "?"],
                  correct: ["Allillanchu", "?"]
                },
                speechChallenge: {
                  phrase: "Rimaykullayki tayta",
                  translation: "Greetings father/sir",
                  phonetic: "ree-my-koo-yah-yee tie-tah"
                }
              },
              {
                id: "quechua_beg_mod1_l2",
                title: "Lesson 2: Numbers in the Andes",
                concept: "Incans kept track of numbers using 'Quipus' (knotted colored cords). Learn these words to count without cables!",
                vocab: [
                  { word: "Huk", translation: "One", transliteration: "hook", tip: "Like standard hook." },
                  { word: "Iskay", translation: "Two", transliteration: "ees-kye", tip: "Rhymes with sky." },
                  { word: "Kimsa", translation: "Three", transliteration: "keem-sah", tip: "Similar to 'kimsa'." },
                  { word: "Tawa", translation: "Four", transliteration: "tah-wah", tip: "Flat 'a' sounds." },
                  { word: "Pisqa", translation: "Five", transliteration: "pees-kah", tip: "The 'q' represents a dry breathy catch in the back of the mouth." }
                ],
                matchGame: [
                  { id: "qun1", target: "Huk", english: "One" },
                  { id: "qun2", target: "Iskay", english: "Two" },
                  { id: "qun3", target: "Kimsa", english: "Three" },
                  { id: "qun4", target: "Tawa", english: "Four" },
                  { id: "qun5", target: "Pisqa", english: "Five" }
                ],
                wordBuilder: {
                  prompt: "Translate: 'One, Two, Three'",
                  scrambled: ["Huk", "iskay", "kimsa", "tawa", "pisqa"],
                  correct: ["Huk", "iskay", "kimsa"]
                },
                speechChallenge: {
                  phrase: "Kimsa tawa",
                  translation: "Three four",
                  phonetic: "keem-sah tah-wah"
                }
              }
            ]
          }
        ]
      },
      intermediate: {
        id: "intermediate",
        name: "Intermediate",
        scenarios: [
          {
            id: "quechua_int_sc1",
            title: "Shopping at Cusco Market",
            description: "Practice buying colorful woven textiles and thank the merchant in Runasimi.",
            difficulty: "Medium",
            steps: [
              {
                speaker: "Mamá Nusta (Merchant)",
                botLine: "Allillanchu waway! Ima munanki?",
                botTranslation: "How are you, child! What do you want?",
                hint: "Say: 'I am well. I want a blanket (awana).'",
                expectedResponses: [
                  "Allillanmi. Munani huk awanata.",
                  "Allillanmi munani huk awanata",
                  "Allillanmi munani awana"
                ],
                phonetics: "ah-yee-yahn-mee. moo-NAH-nee hook ah-WAH-nah-tah."
              },
              {
                speaker: "Mamá Nusta (Merchant)",
                botLine: "Allin! Iskay chunka soles.",
                botTranslation: "Good! Twenty soles.",
                hint: "Say: 'Thank you! Here is the money.'",
                expectedResponses: [
                  "Sulpayki! Kaypin qolqe.",
                  "Sulpayki kaypin qolqe",
                  "Sulpayki"
                ],
                phonetics: "sool-pie-kee! kye-peen KOL-keh."
              },
              {
                speaker: "Mamá Nusta (Merchant)",
                botLine: "Añay. Tupananchiskama!",
                botTranslation: "Thank you. Until we meet again!",
                hint: "Say: 'Until we meet again.'",
                expectedResponses: [
                  "Tupananchiskama!",
                  "Tupananchiskama",
                  "Tupananchiskama"
                ],
                phonetics: "too-pah-nahn-chees-kah-mah."
              }
            ]
          }
        ]
      },
      advanced: {
        id: "advanced",
        name: "Advanced",
        cultureText: {
          title: "The Legend of the Golden Scepter",
          text: "According to Inca creation myth, the sun god Inti saw that humans lived like wild beasts, without law or agriculture. To civilize humanity, Inti created Manco Cápac and Mama Ocllo, placing them in the waters of Lake Titicaca. He gave them a golden scepter (tupayauri) and instructed them: travel north and build their sacred city wherever the scepter sank effortlessly into the soil. Reaching the Valley of Cusco, Manco Cápac struck the earth, and the golden rod disappeared entirely. Recognizing the sun god's signal, they founded the city of Cusco (the 'Navel of the World'), teaching men how to farm maize and women how to weave cotton.",
          questions: [
            {
              question: "Who sent Manco Cápac and Mama Ocllo?",
              options: [
                "The Moon Goddess Killa",
                "The Wind Spirit Waira",
                "The Sun God Inti",
                "The Earth Mother Pachamama"
              ],
              answer: "The Sun God Inti"
            },
            {
              question: "Where did the golden scepter sink into the ground?",
              options: [
                "At Lake Titicaca",
                "In the Valley of Cusco",
                "On top of Machu Picchu",
                "In the Amazon rainforest"
              ],
              answer: "In the Valley of Cusco"
            }
          ]
        }
      }
    }
  },
  {
    id: "spanish",
    name: "Spanish",
    nativeName: "Español",
    status: "Safe",
    endangered: false,
    flag: "🇪🇸",
    history: "Spanish is a Romance language originating in the Iberian peninsula. Spoken by over 500 million people worldwide, it is a global powerhouse of communication, music, and literature.",
    levels: {
      beginner: {
        id: "beginner",
        name: "Beginner",
        modules: [
          {
            id: "spanish_beg_mod1",
            title: "Module 1: ¡Hola! & Numbers",
            description: "Master basic greetings and learn to count from 1 to 5.",
            lessons: [
              {
                id: "spanish_beg_mod1_l1",
                title: "Lesson 1: Greetings",
                concept: "In Spanish, the letter 'h' is always silent! Friendly tone and high rolling vowel enunciations are central.",
                vocab: [
                  { word: "Hola", translation: "Hello", transliteration: "OH-lah", tip: "Remember, the H is completely silent!" },
                  { word: "Gracias", translation: "Thank you", transliteration: "GRAH-syahs", tip: "Roll the R slightly." },
                  { word: "Por favor", translation: "Please", transliteration: "por fah-VOR", tip: "Stress the last syllable." },
                  { word: "Adiós", translation: "Goodbye", transliteration: "ah-DYOHSS", tip: "Don't forget the accent on the o." }
                ],
                matchGame: [
                  { id: "sp1", target: "Hola", english: "Hello" },
                  { id: "sp2", target: "Gracias", english: "Thank you" },
                  { id: "sp3", target: "Por favor", english: "Please" },
                  { id: "sp4", target: "Adiós", english: "Goodbye" }
                ],
                wordBuilder: {
                  prompt: "Translate: 'Hello, thank you'",
                  scrambled: ["Hola", "gracias", "por", "favor"],
                  correct: ["Hola", "gracias"]
                },
                speechChallenge: {
                  phrase: "Hola mi amigo",
                  translation: "Hello my friend",
                  phonetic: "OH-lah mee ah-MEE-goh"
                }
              }
            ]
          }
        ]
      },
      intermediate: {
        id: "intermediate",
        name: "Intermediate",
        scenarios: [
          {
            id: "spanish_int_sc1",
            title: "Directions to Plaza Mayor",
            description: "Practice asking a local resident for directions in Madrid.",
            difficulty: "Medium",
            steps: [
              {
                speaker: "Carlos (Resident)",
                botLine: "¡Hola! ¿Te puedo ayudar en algo?",
                botTranslation: "Hello! Can I help you with something?",
                hint: "Say: 'Yes, please. Where is the Plaza Mayor?'",
                expectedResponses: [
                  "Sí, por favor. ¿Dónde está la Plaza Mayor?",
                  "Si por favor donde esta la Plaza Mayor",
                  "Donde esta la Plaza Mayor"
                ],
                phonetics: "see, por fah-VOR. DON-deh ess-TAH lah PLAH-zah my-YOR?"
              },
              {
                speaker: "Carlos (Resident)",
                botLine: "Está muy cerca, a dos cuadras a la derecha.",
                botTranslation: "It's very close, two blocks to the right.",
                hint: "Say: 'Thank you very much. Goodbye!'",
                expectedResponses: [
                  "Muchas gracias. ¡Adiós!",
                  "Muchas gracias adios",
                  "Muchas gracias"
                ],
                phonetics: "MOO-chahs GRAH-syahs. ah-DYOHSS!"
              }
            ]
          }
        ]
      },
      advanced: {
        id: "advanced",
        name: "Advanced",
        cultureText: {
          title: "Don Quixote and the Windmills",
          text: "Written by Miguel de Cervantes, 'Don Quixote de la Mancha' is considered the first modern novel. It tells the story of an aging hidalgo who goes mad reading chivalric romances and decides to revive knighthood. In his most famous adventure, he mistakes giant windmills for fierce giants and charges them on his skinny horse, Rocinante. Despite his loyal squire Sancho Panza's warnings, Don Quixote gets caught in a sail and thrown to the ground, claiming that an evil magician transformed the giants into windmills to rob him of his glory.",
          questions: [
            {
              question: "Who wrote Don Quixote?",
              options: [
                "Gabriel García Márquez",
                "Miguel de Cervantes",
                "Federico García Lorca",
                "Pablo Neruda"
              ],
              answer: "Miguel de Cervantes"
            },
            {
              question: "What did Don Quixote mistake the windmills for?",
              options: [
                "Fierce giants",
                "Enemy castles",
                "Noble princesses",
                "Flying dragons"
              ],
              answer: "Fierce giants"
            }
          ]
        }
      }
    }
  },
  {
    id: "japanese",
    name: "Japanese",
    nativeName: "日本語",
    status: "Safe",
    endangered: false,
    flag: "🇯🇵",
    history: "Japanese is spoken by over 125 million people. It is famous for its three writing systems (Hiragana, Katakana, and Kanji) and its intricate levels of politeness (Keigo).",
    levels: {
      beginner: {
        id: "beginner",
        name: "Beginner",
        modules: [
          {
            id: "japanese_beg_mod1",
            title: "Module 1: Hajimemashite",
            description: "Learn primary greetings and count from 1 to 5.",
            lessons: [
              {
                id: "japanese_beg_mod1_l1",
                title: "Lesson 1: Greetings",
                concept: "In Japanese, bowing often accompanies speech. Politeness and clean phonics are highly valued.",
                vocab: [
                  { word: "Konnichiwa", translation: "Hello / Good afternoon", transliteration: "kohn-nee-chee-wah", tip: "Ensure both 'n's are pronounced." },
                  { word: "Arigatou", translation: "Thank you", transliteration: "ah-ree-gah-toh", tip: "Lengthen the 'o' sound slightly." },
                  { word: "Sumimasen", translation: "Excuse me / Sorry", transliteration: "soo-mee-mah-sen", tip: "Extremely useful in daily life." },
                  { word: "Sayounara", translation: "Goodbye", transliteration: "sah-yoh-nah-rah", tip: "Formal goodbye; 'bye bye' is common for friends." }
                ],
                matchGame: [
                  { id: "ja1", target: "Konnichiwa", english: "Hello / Good afternoon" },
                  { id: "ja2", target: "Arigatou", english: "Thank you" },
                  { id: "ja3", target: "Sumimasen", english: "Excuse me / Sorry" },
                  { id: "ja4", target: "Sayounara", english: "Goodbye" }
                ],
                wordBuilder: {
                  prompt: "Translate: 'Excuse me, thank you'",
                  scrambled: ["Sumimasen", "arigatou", "konnichiwa", "kore"],
                  correct: ["Sumimasen", "arigatou"]
                },
                speechChallenge: {
                  phrase: "Konnichiwa sensei",
                  translation: "Hello teacher",
                  phonetic: "kohn-nee-chee-wah sen-say"
                }
              }
            ]
          }
        ]
      },
      intermediate: {
        id: "intermediate",
        name: "Intermediate",
        scenarios: [
          {
            id: "japanese_int_sc1",
            title: "Buying a Train Ticket",
            description: "Practice buying a high-speed rail ticket at Tokyo Station.",
            difficulty: "Medium",
            steps: [
              {
                speaker: "Station Attendant",
                botLine: "Irasshaimase! Doko made desu ka?",
                botTranslation: "Welcome! To where?",
                hint: "Say: 'To Kyoto, please.'",
                expectedResponses: [
                  "Kyoto made, onegai shimasu.",
                  "Kyoto made onegai shimasu",
                  "Kyoto onegai shimasu"
                ],
                phonetics: "kyoh-toh mah-deh, oh-neh-guy shee-mahss."
              },
              {
                speaker: "Station Attendant",
                botLine: "Hai. Shinkansen no kippu wa 14,000 yen desu.",
                botTranslation: "Yes. The bullet train ticket is 14,000 yen.",
                hint: "Say: 'Excuse me. Here it is.'",
                expectedResponses: [
                  "Sumimasen. Kore desu.",
                  "Sumimasen kore desu",
                  "Kore desu"
                ],
                phonetics: "soo-mee-mah-sen. koh-reh dess."
              }
            ]
          }
        ]
      },
      advanced: {
        id: "advanced",
        name: "Advanced",
        cultureText: {
          title: "The Tale of the Bamboo Cutter",
          text: "Also known as Kaguya-hime, this 10th-century folklore is considered the oldest surviving Japanese narrative. An old bamboo cutter discovers a glowing stalk of bamboo. Inside, he finds a tiny baby girl the size of his thumb. He raises her as his own daughter, Kaguya-hime, and she grows into a woman of extraordinary beauty. Many princes and even the Emperor seek her hand in marriage, but she sets them impossible tasks. Eventually, Kaguya-hime reveals that she is not of this Earth, but came from the Palace of the Moon, to which she must return. Despite the Emperor's soldiers guarding her, she ascends back to the Moon in a chariot of fire, leaving behind an elixir of immortality.",
          questions: [
            {
              question: "Where did Kaguya-hime come from?",
              options: [
                "The bottom of the sea",
                "The summit of Mount Fuji",
                "The Palace of the Moon",
                "A mythical dragon kingdom"
              ],
              answer: "The Palace of the Moon"
            },
            {
              question: "What did the bamboo cutter find inside the bamboo?",
              options: [
                "A chest of gold",
                "A tiny baby girl",
                "A magical sword",
                "A glowing pearl"
              ],
              answer: "A tiny baby girl"
            }
          ]
        }
      }
    }
  }
];
