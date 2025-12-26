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
                hint: 'Each player has one digit. Combine in order: Scout → Hacker → Insider → Safecracker',
                clues: {
                    scout: 'Note on desk: "Master code first digit: 7"',
                    hacker: 'Screen shows: "Security digit 2 = 3"',
                    insider: 'Sticky note: "Third digit is 9"',
                    safecracker: 'Blueprint marks: "Final: 2"'
                }
            },
            {
                id: 2,
                title: 'Guard Rotation Schedule',
                description: 'Find when guards change shifts to know your window of opportunity.',
                answer: 'MIDNIGHT',
                hint: 'Each player has two letters. Combine them in role order.',
                clues: {
                    scout: 'Patrol log shows: "MI" circled in red',
                    hacker: 'Email fragment: "...shifts at DN..."',
                    insider: 'Whispered gossip: "They say IG..."',
                    safecracker: 'Old schedule torn: "...HT break"'
                }
            },
            {
                id: 3,
                title: 'Laser Grid Gallery',
                description: 'Navigate the laser grid. Calculate safe path coordinates.',
                answer: 'B4D2A3C1',
                hint: 'Each player has two coordinates. Path spells ESCAPE when connected.',
                clues: {
                    scout: 'Map shows: "Start B4, move to D2"',
                    hacker: 'Logs indicate: "D2 to A3 is safe"',
                    insider: 'Guard notes: "A3 to C1 pattern"',
                    safecracker: 'Blueprint: "C1 final position"'
                }
            },
            {
                id: 4,
                title: 'Curator\'s Office',
                description: 'The curator\'s safe contains the vault blueprints. Crack the combination.',
                answer: '251990',
                hint: 'Birth dates hidden in personal items. Format: DDMMYY',
                clues: {
                    scout: 'Family photo dated: "25th"',
                    hacker: 'Email signature: "Since 1990"',
                    insider: 'Overheard: "January is his favorite month"',
                    safecracker: 'Safe dial shows wear at: 2, 5, 1, 9, 0'
                }
            },
            {
                id: 5,
                title: 'Alarm System Panel',
                description: 'Bypass the alarm by entering the correct sequence of wire colors.',
                answer: 'REDGREENBLUEYELLOW',
                hint: 'Wire colors must be entered in the order they connect to terminals A-D',
                clues: {
                    scout: 'Terminal A connects to RED wire',
                    hacker: 'System diagram shows B→GREEN',
                    insider: 'Electrician said: "C is always BLUE"',
                    safecracker: 'Wiring schematic: D=YELLOW'
                }
            },
            {
                id: 6,
                title: 'Vault Keypad',
                description: 'The vault door requires a 6-digit code derived from historical dates.',
                answer: '141789',
                hint: 'French Revolution started it all. Day and month only.',
                clues: {
                    scout: 'Plaque reads: "Bastille Day 14th"',
                    hacker: 'Database shows: "July 1789"',
                    insider: 'Curator obsessed with: "17..."',
                    safecracker: 'Door inscription: "...89 Revolution"'
                }
            },
            {
                id: 7,
                title: 'Diamond Case Lock',
                description: 'The diamond is behind a lock requiring the name of the stone.',
                answer: 'HOPEDIAMOND',
                hint: 'Famous cursed blue diamond. Combine the two-word name.',
                clues: {
                    scout: 'Placard shows: "The HOPE..."',
                    hacker: 'Insurance doc: "...DIAMOND value"',
                    insider: 'Heard whispers: "Blue curse of..."',
                    safecracker: 'Case engraving: "H.D. 45.52 carats"'
                }
            },
            {
                id: 8,
                title: 'Escape Route',
                description: 'Find the code to unlock the emergency exit before alarm triggers.',
                answer: 'EXIT2025',
                hint: 'Emergency exits labeled by year of installation and function.',
                clues: {
                    scout: 'Sign says: "EXIT installed..."',
                    hacker: 'Building permits: "2025 renovation"',
                    insider: 'Manager mentioned: "New exits this year"',
                    safecracker: 'Door model number: EX1T-2025'
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
                hint: 'Guard rotation schedule digits. Each prisoner has one number.',
                clues: {
                    scout: 'Scratched on wall: "8 guards"',
                    hacker: 'Overhead PA: "Shift 6 reporting"',
                    insider: 'Whisper from next cell: "3 o\'clock"',
                    safecracker: 'Lock shows wear on: 4'
                }
            },
            {
                id: 2,
                title: 'Guard Station',
                description: 'Access the guard computer to disable cell blocks.',
                answer: 'FREEDOM',
                hint: 'Password is what every prisoner wants. 7 letters.',
                clues: {
                    scout: 'Poster on wall: "FRE..."',
                    hacker: 'Sticky note: "...EDO..."',
                    insider: 'Guard complained: "...DOM is overrated"',
                    safecracker: 'Dictionary marked at: F-section'
                }
            },
            {
                id: 3,
                title: 'Cafeteria',
                description: 'The kitchen exit code is hidden in the menu.',
                answer: 'MEATLOAF',
                hint: 'Tuesday\'s dinner special. One word, no spaces.',
                clues: {
                    scout: 'Menu board: "Tuesday: MEAT..."',
                    hacker: 'Inventory list: "...LOAF supplies"',
                    insider: 'Cook muttered: "I hate making..."',
                    safecracker: 'Recipe book marked: M.L. page 47'
                }
            },
            {
                id: 4,
                title: 'Infirmary',
                description: 'Medical supply room has chemicals to dissolve the bars.',
                answer: '350ML',
                hint: 'Prescription dosage for acid. Amount and unit.',
                clues: {
                    scout: 'Prescription reads: "350..."',
                    hacker: 'Database shows: "...ML hydrochloric"',
                    insider: 'Nurse said: "Milliliters, not grams"',
                    safecracker: 'Bottle label: 3-5-0'
                }
            },
            {
                id: 5,
                title: 'Yard Fence',
                description: 'Fence gate lock needs wire cutter location code.',
                answer: 'SHED3',
                hint: 'Maintenance shed number where tools are stored.',
                clues: {
                    scout: 'Map shows: "SHED..."',
                    hacker: 'Work order: "...3 repairs"',
                    insider: 'Inmate tip: "Third shed, east side"',
                    safecracker: 'Gate marked: S-3'
                }
            },
            {
                id: 6,
                title: 'Warden\'s Office',
                description: 'Safe contains escape route map. Find the combination.',
                answer: '197845',
                hint: 'Warden\'s badge number from his framed certificate.',
                clues: {
                    scout: 'Certificate shows: "197..."',
                    hacker: 'Personnel file: "Badge 8..."',
                    insider: 'Secretary gossiped: "...45 years service"',
                    safecracker: 'Safe dial favorites: 1-9-7-8-4-5'
                }
            },
            {
                id: 7,
                title: 'Tunnel Entrance',
                description: 'Old escape tunnel locked. Code is prisoner numbers.',
                answer: '24601',
                hint: 'Jean Valjean\'s famous prisoner number.',
                clues: {
                    scout: 'Book on desk: "Les Miserables"',
                    hacker: 'Database search: "24601 historical"',
                    insider: 'Old timer said: "Like Valjean..."',
                    safecracker: 'Tunnel door engraved: 2-4-6-0-1'
                }
            },
            {
                id: 8,
                title: 'Perimeter Gate',
                description: 'Final gate code is the prison\'s founding year.',
                answer: '1876',
                hint: 'Check the cornerstone of the main building.',
                clues: {
                    scout: 'Cornerstone reads: "Est. 18..."',
                    hacker: 'Archives show: "...76 construction"',
                    insider: 'Tour guide mentioned: "Over 140 years old"',
                    safecracker: 'Gate mechanism stamped: 1-8-7-6'
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
                    scout: 'Propaganda poster: "1933 Victory"',
                    hacker: 'Telegraph dated: "33 regime"',
                    insider: 'Guard bragged: "Since \'33..."',
                    safecracker: 'Door marked: 19-33'
                }
            },
            {
                id: 2,
                title: 'Communications Room',
                description: 'Decrypt the radio frequency to jam their signals.',
                answer: 'ENIGMA',
                hint: 'Name of the encryption machine used by Germans.',
                clues: {
                    scout: 'Manual cover: "ENIG..."',
                    hacker: 'Codebook: "...MA cipher"',
                    insider: 'Operator cursed: "Damn ENIGMA again"',
                    safecracker: 'Machine label: E-N-I-G-M-A'
                }
            },
            {
                id: 3,
                title: 'War Room',
                description: 'Map room safe contains escape routes. Find the combination.',
                answer: 'BERLIN',
                hint: 'Capital city where the bunker is located.',
                clues: {
                    scout: 'Map labeled: "BERL..."',
                    hacker: 'Coordinates show: "...LIN center"',
                    insider: 'Hitler ranted about: "My beloved..."',
                    safecracker: 'Safe dial letters: B-E-R-L-I-N'
                }
            },
            {
                id: 4,
                title: 'Ammunition Storage',
                description: 'Explosives locker code to blast through the wall.',
                answer: 'PANZER',
                hint: 'German word for tank. What\'s written on the crates.',
                clues: {
                    scout: 'Crates stenciled: "PAN..."',
                    hacker: 'Inventory: "...ZER rounds"',
                    insider: 'Soldier yelled: "More for the..."',
                    safecracker: 'Lock dial shows: P-A-N-Z-E-R'
                }
            },
            {
                id: 5,
                title: 'Generator Room',
                description: 'Power down sequence requires shutdown code.',
                answer: '091939',
                hint: 'Date WW2 started: Poland invasion, September 1st 1939.',
                clues: {
                    scout: 'Calendar marked: "01 Sept"',
                    hacker: 'Log entry: "War began 39"',
                    insider: 'Officer remembered: "September \'39..."',
                    safecracker: 'Panel shows: 09-19-39'
                }
            },
            {
                id: 6,
                title: 'Medical Bay',
                description: 'Poison antidote requires doctor\'s safe code.',
                answer: 'MENGELE',
                hint: 'Infamous Nazi doctor\'s surname.',
                clues: {
                    scout: 'Name tag: "Dr. MEN..."',
                    hacker: 'File cabinet: "...GELE, Josef"',
                    insider: 'Nurse whispered: "That monster..."',
                    safecracker: 'Safe engraved: M-E-N-G-E-L-E'
                }
            },
            {
                id: 7,
                title: 'Führer\'s Office',
                description: 'Hitler\'s desk safe has the master exit key.',
                answer: 'EVABRAUN',
                hint: 'His mistress\'s name. No spaces.',
                clues: {
                    scout: 'Photo frame: "EVA..."',
                    hacker: 'Letter signed: "...BRAUN"',
                    insider: 'Aide mentioned: "The Führer\'s..."',
                    safecracker: 'Safe dial: E-V-A-B-R-A-U-N'
                }
            },
            {
                id: 8,
                title: 'Emergency Exit',
                description: 'Final escape tunnel requires the fall of Berlin date.',
                answer: '020545',
                hint: 'Day Berlin fell to Allies: May 2nd, 1945. Format: DDMMYY',
                clues: {
                    scout: 'Newspaper: "2nd May..."',
                    hacker: 'Telegraph: "...45 surrender"',
                    insider: 'Guard sobbed: "It\'s over, May..."',
                    safecracker: 'Door scratched: 02-05-45'
                }
            }
        ]
    }
};
