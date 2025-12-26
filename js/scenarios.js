// Escape Room Scenarios - 8 rooms each

export const SCENARIOS = {
    museum: {
        name: '🏛️ Museum Heist',
        emoji: '💎',
        description: 'Steal the diamond before security arrives!',
        rooms: [
            {
                id: 1,
                title: 'Security Office',
                description: 'Entered through ventilation. Disable the cameras by finding the master code.',
                answer: '7392',
                hint: 'Guard shift schedule - combine the numbers from different sources.',
                clues: {
                    scout: 'Shift schedule board shows guards change at 7:00, and there are 9 guards on rotation',
                    hacker: 'Security log shows 3 incidents last month, master code is 4 digits',
                    insider: 'Head guard\'s lucky number is 2 - he puts it at the end of everything',
                    safecracker: 'Keypad shows wear on 7, 3, 9, 2 - in that order based on smudge patterns'
                }
            },
            {
                id: 2,
                title: 'Guard Rotation Schedule',
                description: 'Find when guards change shifts to know your window of opportunity.',
                answer: 'MIDNIGHT',
                hint: 'The hour when guards are most tired - when wolves howl.',
                clues: {
                    scout: 'Patrol log shows gap in coverage - guards are tired at the hour wolves are said to howl',
                    hacker: 'Schedule database: \'All guards off-duty for 15 min at 00:00 hours\'',
                    insider: 'Overheard: \'The dead of night is our only window\' - 8 letters',
                    safecracker: 'Clock on wall frozen at 12:00, but moon symbol showing - not noon'
                }
            },
            {
                id: 3,
                title: 'Laser Grid Gallery',
                description: 'Navigate the laser grid. Calculate safe path coordinates.',
                answer: 'NORTH3WEST2SOUTH1',
                hint: 'Directions and distances - combine the path coordinates with their numbers.',
                clues: {
                    scout: 'Map shows safe path: go NORTH first, then WEST, then SOUTH to exit',
                    hacker: 'Laser log shows 3 beams disabled in sector N, 2 in sector W, 1 in sector S',
                    insider: 'Guard mentioned: \'Direction plus number, no spaces, all caps\'',
                    safecracker: 'Floor tiles numbered by row - N row is 3, W is 2, S is 1'
                }
            },
            {
                id: 4,
                title: 'Curator\'s Office',
                description: 'The curator\'s safe contains the vault blueprints. Crack the combination.',
                answer: '250190',
                hint: 'Birth dates hidden in personal items. Format: DDMMYY',
                clues: {
                    scout: 'Family photo caption: \'Born on the 25th\'',
                    hacker: 'Personnel file: DOB in DDMMYY format, year is 1990',
                    insider: 'Curator celebrates birthday in January - first month of the year',
                    safecracker: 'Safe dial shows 6-digit combo: DD, then MM, then YY'
                }
            },
            {
                id: 5,
                title: 'Alarm System Panel',
                description: 'Bypass the alarm by entering the correct sequence of wire colors.',
                answer: 'REDGREENBLUEYELLOW',
                hint: 'Wire colors must be entered in the order they connect to terminals A-D',
                clues: {
                    scout: 'Terminal A has a crimson wire - color of blood, color of stop signs',
                    hacker: 'Wiring diagram: B=opposite of red on traffic lights, D=bright like the sun',
                    insider: 'Electrician said: C is the color of the ocean, all colors as words, no spaces',
                    safecracker: 'Wire gauge labels: A=R, B=G, C=B, D=Y - but what colors?'
                }
            },
            {
                id: 6,
                title: 'Vault Keypad',
                description: 'The vault door requires a 6-digit code derived from historical dates.',
                answer: '140789',
                hint: 'French Revolution started it all. Bastille Day in DDMMYY format.',
                clues: {
                    scout: 'Plaque reads: \'Commemorating the 14th\'',
                    hacker: 'Historical database: \'French Revolution year 1789, summer month\'',
                    insider: 'Curator obsessed with Bastille Day - the storming was in July',
                    safecracker: 'Keypad format: 6 digits, DDMMYY, related to French history'
                }
            },
            {
                id: 7,
                title: 'Diamond Case Lock',
                description: 'The diamond is behind a lock requiring the name of the stone.',
                answer: 'HOPEDIAMOND',
                hint: 'Famous cursed blue diamond. Combine the two-word name as one.',
                clues: {
                    scout: 'Display card mentions \'a feeling of optimism\' and \'precious stone\' - combine them',
                    hacker: 'Insurance records: 45.52 carats, allegedly cursed, two-word name as one',
                    insider: 'Tour guide called it \'the most famous blue gem with an unlucky reputation\'',
                    safecracker: 'Lock takes 11 characters - first 4 spell a positive emotion'
                }
            },
            {
                id: 8,
                title: 'Escape Route',
                description: 'Find the code to unlock the emergency exit before alarm triggers.',
                answer: 'EXIT2025',
                hint: 'Emergency exits labeled by year of installation and function.',
                clues: {
                    scout: 'Door labeled \'Emergency ____\' - 4 letters meaning \'way out\'',
                    hacker: 'Building permits: All doors renovated this year, 2025',
                    insider: 'Manager: \'New exits installed this year - code is the label plus the year\'',
                    safecracker: 'Keypad accepts 8 characters: 4 letters + 4 numbers'
                }
            }
        ]
    },

    prison: {
        name: '⛓️ Prison Break',
        emoji: '🚔',
        description: 'Escape before the guards return!',
        rooms: [
            {
                id: 1,
                title: 'Cell Block',
                description: 'Find the master key code to unlock your cell door.',
                answer: '8634',
                hint: 'Guard rotation schedule digits. Combine the numbers in the right order.',
                clues: {
                    scout: 'Wall scratches show 8 guards patrol this block, 4 are at the gate',
                    hacker: 'Shift system: Station 6 covers our wing, 3 guards per shift',
                    insider: 'Old prisoner whispered: \'Number of guards, number of station, number per shift, number at gate\'',
                    safecracker: 'Lock tumblers worn at 8, 6, 3, 4 positions - that\'s the sequence'
                }
            },
            {
                id: 2,
                title: 'Guard Station',
                description: 'Access the guard computer to disable cell blocks.',
                answer: 'FREEDOM',
                hint: 'Password is what every prisoner wants. 7 letters.',
                clues: {
                    scout: 'Motivational poster has word blanked out: \'F______\' - 7 letters, what you\'re fighting for',
                    hacker: 'Password hint in system: \'What do prisoners dream of? The opposite of captivity\'',
                    insider: 'Guard complained: \'These prisoners and their constant talk about [REDACTED]\'',
                    safecracker: 'Keyboard shows wear on F-R-E-D-O-M keys - but that\'s only 6 letters, missing one \'E\''
                }
            },
            {
                id: 3,
                title: 'Cafeteria',
                description: 'The kitchen exit code is hidden in the menu.',
                answer: 'MEATLOAF',
                hint: 'Tuesday\'s dinner special. One word, no spaces.',
                clues: {
                    scout: 'Menu board: Tuesday = ground beef baked dish, 8 letters',
                    hacker: 'Kitchen inventory: \'M.L. - 200 servings ordered for Tuesday\'',
                    insider: 'Cook groaned: \'Not the Tuesday special again - rhymes with "beat loaf"\'',
                    safecracker: 'Kitchen safe combo is the most hated dinner, all one word, all caps'
                }
            },
            {
                id: 4,
                title: 'Infirmary',
                description: 'Medical supply room has chemicals to dissolve the bars.',
                answer: '350ML',
                hint: 'Prescription dosage for acid. Amount and unit.',
                clues: {
                    scout: 'Prescription pad shows: \'Administer 350 of the liquid\'',
                    hacker: 'Medical database: \'Dosage measured in milliliters, not grams\'',
                    insider: 'Nurse said: \'Three-fifty of the solution, abbreviated unit\'',
                    safecracker: 'Cabinet lock: 5 characters - 3 numbers followed by 2 letters for the unit'
                }
            },
            {
                id: 5,
                title: 'Yard Fence',
                description: 'Fence gate lock needs wire cutter location code.',
                answer: 'SHED3',
                hint: 'Maintenance shed number where tools are stored.',
                clues: {
                    scout: 'Map shows three maintenance buildings on east side - the third has tools',
                    hacker: 'Work order #3: \'Wire cutters stored at maintenance structure\'',
                    insider: 'Trustee whispered: \'Look in the SHED, but which one? The third\'',
                    safecracker: 'Gate lock: 5 characters - building type (4 letters) plus number'
                }
            },
            {
                id: 6,
                title: 'Warden\'s Office',
                description: 'Safe contains escape route map. Find the combination.',
                answer: '197845',
                hint: 'Warden\'s badge number from his framed certificate.',
                clues: {
                    scout: 'Certificate on wall: \'Warden since 1978, badge 197###\'',
                    hacker: 'Personnel file: \'Badge suffix: year appointed (78) minus 33\'',
                    insider: 'Secretary mentioned: \'45 years of service\' - that\'s the last two digits',
                    safecracker: 'Safe dial: 6 digits, starts with 197, ends with 45, middle digit is 8'
                }
            },
            {
                id: 7,
                title: 'Tunnel Entrance',
                description: 'Old escape tunnel locked. Code is prisoner numbers.',
                answer: '24601',
                hint: 'Jean Valjean\'s famous prisoner number from Les Miserables.',
                clues: {
                    scout: 'Book on table: \'Les Miserables\' - the hero\'s number is the code',
                    hacker: 'Historical database: \'Most famous fictional prisoner number from French literature\'',
                    insider: 'Old timer said: \'Like Jean Valjean, we\'re all just numbers here\'',
                    safecracker: 'Tunnel door: 5-digit code, starts with 2, ends with 1'
                }
            },
            {
                id: 8,
                title: 'Perimeter Gate',
                description: 'Final gate code is the prison\'s founding year.',
                answer: '1876',
                hint: 'Check the cornerstone of the main building - the centennial year.',
                clues: {
                    scout: 'Cornerstone reads: \'Established 18##\' - last two digits worn away',
                    hacker: 'Archives: \'Construction completed in the American centennial year\'',
                    insider: 'Tour guide: \'This prison is almost 150 years old\' (current year 2025)',
                    safecracker: 'Gate lock: 4 digits, 18## - America was 100 years old that year'
                }
            }
        ]
    },

    bunker: {
        name: '🎖️ Hitler\'s Bunker',
        emoji: '💣',
        description: 'Escape the Führer\'s underground lair!',
        rooms: [
            {
                id: 1,
                title: 'Guard Quarters',
                description: 'Find the SS code to disable the first checkpoint.',
                answer: '1933',
                hint: 'Year the Nazi party took power in Germany.',
                clues: {
                    scout: 'Propaganda poster: \'Year One of the Thousand Year Reich\' - but what year?',
                    hacker: 'Telegraph: \'Power consolidated, thirties, before \'35, after \'32\'',
                    insider: 'Guard bragged: \'The Führer became Chancellor that year - January\'',
                    safecracker: 'Door lock: 4 digits, 19##, year Hitler became Chancellor of Germany'
                }
            },
            {
                id: 2,
                title: 'Communications Room',
                description: 'Decrypt the radio frequency to jam their signals.',
                answer: 'ENIGMA',
                hint: 'Name of the encryption machine used by Germans.',
                clues: {
                    scout: 'Machine on desk has a Greek-sounding name meaning \'mystery\' or \'puzzle\'',
                    hacker: 'Codebook reference: \'6-letter device name, Allies struggled to break this cipher\'',
                    insider: 'Operator cursed: \'This damn riddle machine\' - but in Latin/Greek',
                    safecracker: 'Machine label starts with E, ends with A, 6 letters total'
                }
            },
            {
                id: 3,
                title: 'War Room',
                description: 'Map room safe contains escape routes. Find the combination.',
                answer: 'BERLIN',
                hint: 'Capital city where the bunker is located.',
                clues: {
                    scout: 'The map shows a red X on the German capital - that\'s where we are',
                    hacker: 'Telegraph routing: \'BER-LIN sector\' - 6 letters total',
                    insider: 'Hitler ranted: \'I will never leave my beloved capital\'',
                    safecracker: 'Safe dial: 6 letters, German capital city, starts with B'
                }
            },
            {
                id: 4,
                title: 'Ammunition Storage',
                description: 'Explosives locker code to blast through the wall.',
                answer: 'PANZER',
                hint: 'German word for tank. What\'s written on the crates.',
                clues: {
                    scout: 'Crates labeled with German word for armored vehicle - like a tank',
                    hacker: 'Inventory code: \'PZR\' expanded to 6 letters, German military term',
                    insider: 'Soldier yelled: \'Load the tanks!\' but in German',
                    safecracker: 'Lock dial: 6 letters, starts with P, German word meaning \'armor\''
                }
            },
            {
                id: 5,
                title: 'Generator Room',
                description: 'Power down sequence requires shutdown code.',
                answer: '010939',
                hint: 'Date WW2 started: Poland invasion, September 1st 1939 in DDMMYY format.',
                clues: {
                    scout: 'Calendar circled: \'Poland invaded - 1st day of the month\'',
                    hacker: 'War log: \'September 1939, format DDMMYY\'',
                    insider: 'Officer remembered: \'The war began the first of September, thirty-nine\'',
                    safecracker: 'Panel format: 6 digits, DD-MM-YY, invasion of Poland date'
                }
            },
            {
                id: 6,
                title: 'Medical Bay',
                description: 'Poison antidote requires doctor\'s safe code.',
                answer: 'MENGELE',
                hint: 'Infamous Nazi doctor\'s surname.',
                clues: {
                    scout: 'Name tag shows \'Dr. M______\' - 7 letters, called the \'Angel of Death\'',
                    hacker: 'Personnel file: \'Infamous doctor, first name Josef, surname 7 letters\'',
                    insider: 'Nurse whispered about \'that monster\' - notorious for twin experiments',
                    safecracker: 'Safe engraved: starts with M, ends with E, 7 letters'
                }
            },
            {
                id: 7,
                title: 'Führer\'s Office',
                description: 'Hitler\'s desk safe has the master exit key.',
                answer: 'EVABRAUN',
                hint: 'His mistress\'s name. No spaces.',
                clues: {
                    scout: 'Photo frame shows a woman - \'His love, 3 letters + 5 letters, no space\'',
                    hacker: 'Marriage records: \'Wed in the bunker, her surname means \'brown\' in German\'',
                    insider: 'Aide whispered: \'The Führer\'s woman - first name is EVA\'',
                    safecracker: 'Safe dial: 8 characters, first name + last name combined'
                }
            },
            {
                id: 8,
                title: 'Emergency Exit',
                description: 'Final escape tunnel requires the fall of Berlin date.',
                answer: '020545',
                hint: 'Day Berlin fell to Allies: May 2nd, 1945. Format: DDMMYY',
                clues: {
                    scout: 'Newspaper headline: \'Berlin falls on the 2nd day\'',
                    hacker: 'Surrender records: \'May 1945, format DDMMYY\'',
                    insider: 'Guard sobbed: \'It ended in May, the second day of the month\'',
                    safecracker: 'Door code: 6 digits, DDMMYY, date Berlin surrendered'
                }
            }
        ]
    },

    space: {
        name: '🚀 Space Station Emergency',
        emoji: '🚀',
        description: 'Escape before oxygen runs out!',
        rooms: [
            {
                id: 1,
                title: 'Airlock',
                description: 'Asteroid impact compromised the station. Override the emergency lockdown code.',
                answer: '91620',
                hint: 'Pressure readings from different modules. Combine the numbers.',
                clues: {
                    scout: 'Module A pressure gauge shows 9 PSI, Module B shows 16 PSI',
                    hacker: 'System log: "Emergency override: 5 digit code, starts with pressure readings"',
                    insider: 'Engineer mentioned: "Always 20 at the end for the escape sequence"',
                    safecracker: 'Keypad wear pattern: 9-1-6-2-0 in that exact order'
                }
            },
            {
                id: 2,
                title: 'Control Room',
                description: 'Re-route power to life support. Find the circuit board code.',
                answer: 'ALPHA7',
                hint: 'Circuit designation on the main panel. Letter plus number.',
                clues: {
                    scout: 'Schematic shows primary life support on circuit "ALPHA"',
                    hacker: 'Power logs: "Life support designation: Greek letter A, bay 7"',
                    insider: 'Captain\'s log: "Always use the ALPHA circuits for critical systems"',
                    safecracker: 'Panel format: 6 characters, first is Greek A, ends with circuit number 7'
                }
            },
            {
                id: 3,
                title: 'Medical Bay',
                description: 'Oxygen reserves locked in medical storage. Chemical formula is the key.',
                answer: 'H2O',
                hint: 'Most essential molecule for human survival after oxygen.',
                clues: {
                    scout: 'Storage label: "Essential compound - 2 hydrogen, 1 oxygen"',
                    hacker: 'Database: "H2O - water reserves for emergency breathing apparatus"',
                    insider: 'Doctor said: "The formula for water - that\'s what keeps us alive"',
                    safecracker: 'Lock accepts 3 characters: element symbol, number, element symbol'
                }
            },
            {
                id: 4,
                title: 'Engine Room',
                description: 'Restart the backup generator. Fuel mixture ratio required.',
                answer: '3TO1',
                hint: 'Oxygen to hydrogen ratio. Format as number-TO-number.',
                clues: {
                    scout: 'Fuel chart shows 3 parts oxidizer needed',
                    hacker: 'Generator specs: "Ratio 3:1, enter as #TO#, oxygen first"',
                    insider: 'Mechanic yelled: "Three parts O2 to one part H2 or we\'re dead!"',
                    safecracker: 'Panel format: 4 characters, digit-T-O-digit'
                }
            },
            {
                id: 5,
                title: 'Crew Quarters',
                description: 'Survival suits in crew lockers. Captain\'s access code needed.',
                answer: 'ARMSTRONG',
                hint: 'First man on the moon - his surname.',
                clues: {
                    scout: 'Photo on wall: "First moonwalk hero" - 9 letter surname',
                    hacker: 'Personnel file: "Captain\'s hero: Neil ____, first moon landing 1969"',
                    insider: 'Crew chatter: "Captain named all codes after his hero - the first moonwalker"',
                    safecracker: 'Locker dial: 9 letters, starts with A, famous astronaut surname'
                }
            },
            {
                id: 6,
                title: 'Cargo Hold',
                description: 'Emergency beacon parts stored here. Unlock the cargo container.',
                answer: 'ISS2025',
                hint: 'Station designation plus current year.',
                clues: {
                    scout: 'Container label: "ISS property - year 2025"',
                    hacker: 'Manifest code: "Station acronym + current mission year"',
                    insider: 'Officer said: "All cargo coded with station name and year"',
                    safecracker: 'Lock format: 7 characters, three letters then four numbers'
                }
            },
            {
                id: 7,
                title: 'Escape Pod Bay',
                description: 'Pod launch requires navigation coordinates. Set course for Earth.',
                answer: 'EARTH00',
                hint: 'Home planet designation in the nav system. Two zeros for safe orbit.',
                clues: {
                    scout: 'Navigation chart shows "EARTH" as primary destination',
                    hacker: 'Computer: "Enter planet name + orbit altitude code 00 for standard"',
                    insider: 'Pilot mentioned: "Always EARTH00 for emergency returns to home"',
                    safecracker: 'Nav panel: 7 characters, planet name + double zero'
                }
            },
            {
                id: 8,
                title: 'Launch Sequence',
                description: 'Final countdown code to launch the escape pod.',
                answer: '321GO',
                hint: 'Classic countdown sequence. Three, two, one, GO.',
                clues: {
                    scout: 'Launch protocol poster: "Standard countdown from 3"',
                    hacker: 'Launch program: "5 character sequence: 3-2-1-G-O"',
                    insider: 'Commander always said: "Three, two, one, and GO!"',
                    safecracker: 'Launch button: 5 characters, numbers count down then letters spell GO'
                }
            }
        ]
    },

    zombie: {
        name: '🧟 Zombie Outbreak',
        emoji: '🧟',
        description: 'Find the cure and escape!',
        rooms: [
            {
                id: 1,
                title: 'Reception',
                description: 'Research facility is overrun. Find the security code to lock the doors.',
                answer: '4RED',
                hint: 'Biohazard level plus color code. Emergency protocol.',
                clues: {
                    scout: 'Warning sign: "Level 4 Biohazard" in red letters',
                    hacker: 'Security system: "Lockdown format: level number + color of alert"',
                    insider: 'Guard screamed: "Lock it down! Code level 4, RED alert!"',
                    safecracker: 'Keypad: 4 characters, single digit then color name'
                }
            },
            {
                id: 2,
                title: 'Lab A',
                description: 'Patient Zero\'s file contains crucial data. Access the terminal.',
                answer: 'ZERO',
                hint: 'The first infected person\'s designation.',
                clues: {
                    scout: 'File cabinet labeled: "Patient 0 - First Infection"',
                    hacker: 'Database login: "4 letters, the first one, numerical word starting with Z"',
                    insider: 'Scientist whispered: "They call the first infected Patient ____"',
                    safecracker: 'Terminal: 4 characters, word for nothing, starts with Z'
                }
            },
            {
                id: 3,
                title: 'Specimen Storage',
                description: 'Blood samples in cryogenic freezer. Temperature code required.',
                answer: 'NEG80C',
                hint: 'Negative 80 degrees Celsius. Format with abbreviations.',
                clues: {
                    scout: 'Temperature gauge reads: "-80°C for safe storage"',
                    hacker: 'Freezer specs: "6 characters: NEG + temperature + C"',
                    insider: 'Lab tech: "Always negative eighty celsius for specimens"',
                    safecracker: 'Panel format: N-E-G-8-0-C'
                }
            },
            {
                id: 4,
                title: 'Server Room',
                description: 'Research data encrypted. DNA sequence is the decryption key.',
                answer: 'ATCG',
                hint: 'Four nucleotide bases in DNA. First letters: Adenine, Thymine, Cytosine, Guanine.',
                clues: {
                    scout: 'Chart on wall: "DNA building blocks" - four letters',
                    hacker: 'Encryption: "4 nucleotide initials: A-T-C-G in that order"',
                    insider: 'Researcher muttered: "The DNA bases - all biology students know them"',
                    safecracker: 'Server code: 4 characters, DNA base abbreviations'
                }
            },
            {
                id: 5,
                title: 'Director\'s Office',
                description: 'Safe contains antivirus formula. Director\'s birthday is the code.',
                answer: '150384',
                hint: 'Director\'s date of birth in DDMMYY format.',
                clues: {
                    scout: 'Birthday card on desk: "Happy Birthday - March 15th!"',
                    hacker: 'Personnel file: "DOB format DDMMYY, born 1984"',
                    insider: 'Secretary mentioned: "Boss born in \'84, month 03, day 15"',
                    safecracker: 'Safe dial: 6 digits, DDMMYY format, March birthday'
                }
            },
            {
                id: 6,
                title: 'Pharmacy',
                description: 'Cure ingredients locked in medicine cabinet. Prescription code needed.',
                answer: 'RX7777',
                hint: 'Prescription symbol plus lucky number four times.',
                clues: {
                    scout: 'Cabinet label: "RX" symbol followed by four sevens',
                    hacker: 'Pharmacy system: "6 characters: prescription symbol + quad lucky number"',
                    insider: 'Pharmacist joked: "R-X and four sevens - super lucky prescription"',
                    safecracker: 'Lock: R-X-7-7-7-7'
                }
            },
            {
                id: 7,
                title: 'Decontamination',
                description: 'UV sterilization chamber password. Wavelength frequency required.',
                answer: '254NM',
                hint: 'UV-C sterilization wavelength: 254 nanometers.',
                clues: {
                    scout: 'Technical manual: "UV-C optimal at 254 nanometers"',
                    hacker: 'Chamber settings: "5 characters: wavelength number + NM"',
                    insider: 'Engineer said: "Set it to 254 nanometers for decontamination"',
                    safecracker: 'Control panel: 2-5-4-N-M'
                }
            },
            {
                id: 8,
                title: 'Helipad',
                description: 'Helicopter ignition code. Radio the extraction team.',
                answer: 'RESCUE',
                hint: 'What you need right now. 6 letters.',
                clues: {
                    scout: 'Radio message: "Send ____! We need extraction!"',
                    hacker: 'Ignition: "6 letter word meaning \'save us\', starts with R"',
                    insider: 'Pilot yelled: "We need RESCUE now! That\'s the startup word!"',
                    safecracker: 'Ignition panel: R-E-S-C-U-E'
                }
            }
        ]
    },

    mansion: {
        name: '🏚️ Haunted Mansion',
        emoji: '👻',
        description: 'Solve the ghost\'s mystery to escape!',
        rooms: [
            {
                id: 1,
                title: 'Foyer',
                description: 'Victorian manor sealed by dark forces. Grandfather clock holds the first clue.',
                answer: '1867',
                hint: 'Year the mansion was built. Check the cornerstone.',
                clues: {
                    scout: 'Cornerstone inscription: "Built 18##" - last two digits hidden by ivy',
                    hacker: 'Deed records: "Construction completed sixty-seven"',
                    insider: 'Portrait caption: "Lord Blackwood, died 1899, age 50" - born 32 years before mansion built',
                    safecracker: 'Clock mechanism: 4 digits, 18##, Victorian era construction year'
                }
            },
            {
                id: 2,
                title: 'Library',
                description: 'Ancient tome reveals the ghost\'s name. Find it among the books.',
                answer: 'BLACKWOOD',
                hint: 'The lord who built this manor. Surname on the portrait.',
                clues: {
                    scout: 'Portrait nameplate: "Lord _______, Master of the Manor" - 9 letters',
                    hacker: 'Property records: "Owned by the Blackwood family since 1867"',
                    insider: 'Ghost whispers: "My name is the color of ebony combined with timber"',
                    safecracker: 'Book spine code: B-L-A-C-K-W-O-O-D'
                }
            },
            {
                id: 3,
                title: 'Dining Room',
                description: 'Table set for 13 guests. The poisoned chalice holds the secret.',
                answer: 'ARSENIC',
                hint: 'Poison used in Victorian era. Chemical element symbol As.',
                clues: {
                    scout: 'Medical journal: "Death by _______ poisoning - 7 letters, starts with A"',
                    hacker: 'Toxicology report: "Element #33, commonly used poison in 1800s"',
                    insider: 'Ghost moans: "They poisoned me with the same chemical as in rat poison"',
                    safecracker: 'Chalice engraving: A-R-S-E-N-I-C'
                }
            },
            {
                id: 4,
                title: 'Kitchen',
                description: 'Servant\'s diary reveals the murder date. Find the date in the pantry.',
                answer: '311099',
                hint: 'Halloween, 1899. Format: DDMMYY',
                clues: {
                    scout: 'Diary entry: "He died on All Hallows Eve, the last day of October"',
                    hacker: 'Death certificate: "31st day, 10th month, year \'99"',
                    insider: 'Cook wrote: "The master poisoned on Halloween night, eighteen ninety-nine"',
                    safecracker: 'Pantry lock: 6 digits, DDMMYY, October 31st Victorian era'
                }
            },
            {
                id: 5,
                title: 'Master Bedroom',
                description: 'Ghost\'s wedding ring inscribed with wife\'s name. Open the jewelry box.',
                answer: 'VICTORIA',
                hint: 'His beloved wife. Named after the Queen of that era.',
                clues: {
                    scout: 'Love letter: "My dearest V_______ - 8 letters, royal name"',
                    hacker: 'Marriage certificate: "Lord Blackwood wed to Victoria Eleanor"',
                    insider: 'Ghost whispers: "My love, named for our Queen"',
                    safecracker: 'Jewelry box: 8 letters, V-I-C-T-O-R-I-A'
                }
            },
            {
                id: 6,
                title: 'Attic',
                description: 'Trunk contains evidence. Combination is number of conspirators.',
                answer: '3KILLERS',
                hint: 'Three people murdered him. Format: number plus word.',
                clues: {
                    scout: 'Letter fragment: "The three of us agreed to end his tyranny"',
                    hacker: 'Police report: "Evidence suggests conspiracy of three individuals"',
                    insider: 'Ghost cries: "Three betrayers! Wife, brother, and butler!"',
                    safecracker: 'Trunk lock: 8 characters, digit + 7 letter word for murderers'
                }
            },
            {
                id: 7,
                title: 'Cellar',
                description: 'Hidden passage behind wine rack. Code carved in the barrels.',
                answer: 'REDWINE',
                hint: 'The drink he was poisoned through. Color and beverage.',
                clues: {
                    scout: 'Barrel label: "His favorite - color of blood plus grape beverage"',
                    hacker: 'Servant log: "Master only drinks the crimson variety, 7 letters total"',
                    insider: 'Ghost moans: "They poisoned my favorite drink - the red kind"',
                    safecracker: 'Wine rack code: R-E-D-W-I-N-E'
                }
            },
            {
                id: 8,
                title: 'Crypt',
                description: 'Final rest disturbed. Speak his full title to release his spirit.',
                answer: 'LORDBLACKWOOD',
                hint: 'His complete title. Noble rank plus surname, no space.',
                clues: {
                    scout: 'Tombstone: "Here lies ____ _________, 1849-1899"',
                    hacker: 'Estate records: "Title: LORD, Surname: BLACKWOOD, combined as one"',
                    insider: 'Ghost demands: "Speak my full title! My rank and my name!"',
                    safecracker: 'Crypt seal: 13 characters, L-O-R-D-B-L-A-C-K-W-O-O-D'
                }
            }
        ]
    },

    casino: {
        name: '🎰 Casino Heist',
        emoji: '💰',
        description: 'Rob the vault before power returns!',
        rooms: [
            {
                id: 1,
                title: 'Lobby',
                description: 'Blackout initiated. Security doors sealed. Find the emergency override.',
                answer: '777JACKPOT',
                hint: 'Lucky number three times plus the big win word.',
                clues: {
                    scout: 'Security panel: "Emergency code uses the luckiest slot number"',
                    hacker: 'System: "10 characters: three sevens + word for big win"',
                    insider: 'Guard mentioned: "Override is 777 followed by what everyone wants"',
                    safecracker: 'Panel format: 7-7-7-J-A-C-K-P-O-T'
                }
            },
            {
                id: 2,
                title: 'Security Office',
                description: 'Camera feeds must be looped. Access the DVR system.',
                answer: 'ROYALFLUSH',
                hint: 'Best poker hand possible. Two words combined.',
                clues: {
                    scout: 'Poker hand chart on wall: "Highest rank: ace-high straight flush"',
                    hacker: 'Password hint: "10 letters, best poker hand, two words no space"',
                    insider: 'Security chief: "I use the unbeatable poker hand as my password"',
                    safecracker: 'DVR login: R-O-Y-A-L-F-L-U-S-H'
                }
            },
            {
                id: 3,
                title: 'Staff Corridor',
                description: 'Employee break room has uniform locker. Need access code.',
                answer: '2136',
                hint: 'Roulette numbers: red, black, red, black in order.',
                clues: {
                    scout: 'Roulette strategy card: "Bet sequence: 21, 13, 6 - but code adds one more"',
                    hacker: 'Locker system: "4 digits from roulette wheel in this order: 21, 13, 6, then..."',
                    insider: 'Dealer said: "My lucky numbers: twenty-one, then third of thirty-nine, then half dozen"',
                    safecracker: 'Lock tumblers worn at: 2-1-3-6'
                }
            },
            {
                id: 4,
                title: 'Cashier Cage',
                description: 'Money counting machine locked. Need the daily take code.',
                answer: '250K',
                hint: 'Today\'s cash total. Amount plus K for thousands.',
                clues: {
                    scout: 'Daily report: "Total collected: $250,000"',
                    hacker: 'System shows: "4 characters: amount + K, quarter million"',
                    insider: 'Manager bragged: "Two hundred fifty thousand today!"',
                    safecracker: 'Machine display: 2-5-0-K'
                }
            },
            {
                id: 5,
                title: 'High Roller Suite',
                description: 'VIP safe contains access cards. Combination is famous player\'s birth year.',
                answer: '1962',
                hint: 'James Bond\'s first film release year - Dr. No.',
                clues: {
                    scout: 'Film poster: "007 in Dr. No - 1962"',
                    hacker: 'VIP notes: "Owner loves Bond, uses first film year as codes"',
                    insider: 'Butler whispered: "The boss is obsessed with sixty-two, the Bond year"',
                    safecracker: 'Safe dial: 4 digits, 19##, early sixties, Bond debut'
                }
            },
            {
                id: 6,
                title: 'Elevator Shaft',
                description: 'Service elevator control panel. Enter the floor code.',
                answer: 'B3',
                hint: 'Basement level 3. B plus number.',
                clues: {
                    scout: 'Blueprint shows vault on "Basement 3" - three levels down',
                    hacker: 'Elevator system: "2 characters: B + level number for vault floor"',
                    insider: 'Engineer said: "Vault is on B3 - three floors below ground"',
                    safecracker: 'Control panel: B-3'
                }
            },
            {
                id: 7,
                title: 'Vault Antechamber',
                description: 'Biometric bypass requires manager\'s employee ID number.',
                answer: 'MGR001',
                hint: 'Manager designation plus employee number one.',
                clues: {
                    scout: 'Name tag on desk: "MGR" - three letter abbreviation for manager',
                    hacker: 'Personnel database: "6 characters: M-G-R plus employee number 001"',
                    insider: 'Manager boasted: "I\'m employee number one - MGR001"',
                    safecracker: 'Biometric pad: M-G-R-0-0-1'
                }
            },
            {
                id: 8,
                title: 'Vault',
                description: 'Final vault door. Code is the casino\'s founding year.',
                answer: '1985',
                hint: 'Grand opening year. Check the dedication plaque.',
                clues: {
                    scout: 'Dedication plaque: "Opened 19## - year of Live Aid concert"',
                    hacker: 'Corporate records: "Casino established in nineteen eighty-five"',
                    insider: 'Owner reminisced: "We opened forty years ago" (current year 2025)',
                    safecracker: 'Vault door: 4 digits, 19##, mid-eighties'
                }
            }
        ]
    },

    pirate: {
        name: '🏴‍☠️ Pirate Ship',
        emoji: '⚓',
        description: 'Find Blackbeard\'s treasure and escape!',
        rooms: [
            {
                id: 1,
                title: 'Brig',
                description: 'Locked in the ship\'s prison. Rusty lock needs the cell number.',
                answer: 'CELL7',
                hint: 'Your cell designation. Word plus number.',
                clues: {
                    scout: 'Door marking: "C_LL 7" - two missing letters in first word',
                    hacker: 'Prison log: "Prisoner in CELL number 7"',
                    insider: 'Guard yelled: "Back in cell seven, ye scurvy dog!"',
                    safecracker: 'Lock plate: 5 characters, C-E-L-L-7'
                }
            },
            {
                id: 2,
                title: 'Gun Deck',
                description: 'Cannon powder magazine locked. Code is ship\'s cannon count.',
                answer: '24GUNS',
                hint: 'Number of cannons plus the word guns.',
                clues: {
                    scout: 'Gun ports counted: 12 on each side = 24 total',
                    hacker: 'Ship manifest: "6 characters: cannon count + GUNS"',
                    insider: 'Gunner bragged: "Twenty-four guns make this a fearsome ship!"',
                    safecracker: 'Magazine lock: 2-4-G-U-N-S'
                }
            },
            {
                id: 3,
                title: 'Crew Quarters',
                description: 'Mutineers\' hammock hides a map piece. Locker code needed.',
                answer: 'MUTINY',
                hint: 'What you\'re planning. Rebellion aboard ship.',
                clues: {
                    scout: 'Graffiti on wall: "M_T_N_" - fill in the vowels',
                    hacker: 'Ship\'s log: "Fear of ______ among the crew - 6 letters"',
                    insider: 'Sailor whispered: "We\'re planning you-know-what against the captain"',
                    safecracker: 'Locker dial: M-U-T-I-N-Y'
                }
            },
            {
                id: 4,
                title: 'Galley',
                description: 'Cook\'s pantry has navigation tools. Password is the daily meal.',
                answer: 'HARDTACK',
                hint: 'Dry biscuit sailors eat. 8 letters.',
                clues: {
                    scout: 'Menu board: "Breakfast, lunch, dinner: ________ - same hard bread"',
                    hacker: 'Supply inventory: "H.T. - 8 letters, sailor\'s staple food"',
                    insider: 'Cook complained: "Nothing but hard biscuits again - rhymes with \'tar black\'"',
                    safecracker: 'Pantry lock: H-A-R-D-T-A-C-K'
                }
            },
            {
                id: 5,
                title: 'Captain\'s Cabin',
                description: 'Blackbeard\'s desk contains the treasure map. Safe combination needed.',
                answer: 'QUEENANNE',
                hint: 'Name of Blackbeard\'s ship. Two words, no space.',
                clues: {
                    scout: 'Ship model labeled: "Queen Anne\'s _______ - two words combined"',
                    hacker: 'Naval records: "Blackbeard\'s flagship - QUEENANNE plus REVENGE"',
                    insider: 'Sailor said: "This be the Queen Anne - named for British royalty"',
                    safecracker: 'Safe dial: First part only, 9 letters, Q-U-E-E-N-A-N-N-E'
                }
            },
            {
                id: 6,
                title: 'Navigation Room',
                description: 'Compass locked in case. Direction code required.',
                answer: 'NORTHEAST',
                hint: 'Combine two cardinal directions. Upper right on compass.',
                clues: {
                    scout: 'Chart marked: "Treasure bearing: between N and E on the compass"',
                    hacker: 'Navigation log: "9 letters: NORTH combined with EAST, no space"',
                    insider: 'Navigator muttered: "Head to the northeast quadrant"',
                    safecracker: 'Case lock: N-O-R-T-H-E-A-S-T'
                }
            },
            {
                id: 7,
                title: 'Treasure Hold',
                description: 'X marks the spot. Final chest needs Blackbeard\'s real name.',
                answer: 'TEACH',
                hint: 'Blackbeard\'s actual surname. 5 letters.',
                clues: {
                    scout: 'Wanted poster: "Edward _____ - known as Blackbeard"',
                    hacker: 'Historical records: "Real name: Edward Teach, 5 letters"',
                    insider: 'Prisoner whispered: "The captain\'s true name rhymes with \'beach\'"',
                    safecracker: 'Chest lock: T-E-A-C-H'
                }
            },
            {
                id: 8,
                title: 'Escape Longboat',
                description: 'Lower the rowboat. Davit mechanism code required.',
                answer: '1718',
                hint: 'Year Blackbeard died. Historic pirate era.',
                clues: {
                    scout: 'Captain\'s journal: "This be my last voyage - seventeen eighteen"',
                    hacker: 'Historical marker: "Blackbeard killed in battle, 17##, second decade"',
                    insider: 'Old salt said: "The captain died three hundred years ago, give or take"',
                    safecracker: 'Davit wheel: 4 digits, 17##, early 1700s'
                }
            }
        ]
    }
};
