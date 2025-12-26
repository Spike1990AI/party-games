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
    }
};
