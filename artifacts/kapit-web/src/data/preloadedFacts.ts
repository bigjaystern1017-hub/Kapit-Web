export interface PreloadedFactoid {
  factoid: string;
  year: string;
  category: string;
}

export interface PreloadedLocation {
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
  facts: PreloadedFactoid[];
}

export const PRELOADED_LOCATIONS: PreloadedLocation[] = [
  {
    name: "Times Square",
    lat: 40.758,
    lng: -73.9855,
    radiusKm: 0.8,
    facts: [
      {
        factoid: "Times Square wasn't called Times Square until 1904, when the New York Times built its tower there and hosted the city's first New Year's Eve fireworks — a stunt to promote the paper. The ball drop started three years later because the city banned fireworks. Adolph Ochs got his name on a neighborhood for about $200 in pyrotechnics.",
        year: "1904",
        category: "culture",
      },
      {
        factoid: "In 1937, a horse fell through an open subway grate at 44th and Broadway and had to be lifted out by crane. The incident shut down the block for six hours. The horse was fine. The grate was welded shut the next morning. There is no plaque.",
        year: "1937",
        category: "weird",
      },
      {
        factoid: "The 1929 crash sandwich incident: a stock broker arrested in Times Square for stealing a ham sandwich told the desk sergeant he'd just lost his entire life savings in a single morning. The police blotter entry, in clipped cop handwriting, reads simply: 'theft, ham on rye, despondent.' He was released without charge.",
        year: "1929",
        category: "crime",
      },
      {
        factoid: "Times Square's famous neon signs use roughly 45 million watts of electricity annually — enough to power a small city. During WWII, the entire square was blacked out to prevent German submarines from using the glow as a navigation beacon from the Atlantic. It was the only period in the 20th century when Times Square was genuinely quiet.",
        year: "1942",
        category: "politics",
      },
      {
        factoid: "The 'Naked Cowboy,' the white-underpants-guitar-busking fixture of Times Square, is actually a registered trademark. He successfully sued a candy company for putting a naked cowboy on an M&Ms billboard without his permission, and won. He has since formed a political party.",
        year: "2008",
        category: "weird",
      },
      {
        factoid: "Duffy Square — the little northern triangle of Times Square — was named for Father Francis Duffy, a WWI chaplain so beloved that soldiers carried his photograph as a good luck charm. His statue is the only statue in New York that faces away from traffic as a deliberate artistic choice: he's looking back at his regiment.",
        year: "1937",
        category: "culture",
      },
      {
        factoid: "In 1944, Times Square hosted a ticker-tape parade for a dog. The dog, Chips, was a WWII veteran who had attacked a machine gun nest in Sicily and been awarded the Distinguished Service Cross — then stripped of it, because the Army decided dogs weren't eligible. The city gave him a parade anyway.",
        year: "1944",
        category: "weird",
      },
    ],
  },
  {
    name: "Brooklyn Bridge",
    lat: 40.7061,
    lng: -73.9969,
    radiusKm: 0.5,
    facts: [
      {
        factoid: "Emily Roebling was the first person to cross the finished Brooklyn Bridge — riding in a carriage with a live rooster on her lap as a victory symbol. She had effectively run the project for 11 years after her husband John was paralyzed by caisson disease. The official program on opening day credited him alone. The rooster wasn't mentioned at all.",
        year: "1883",
        category: "architecture",
      },
      {
        factoid: "Caisson disease — 'the bends' — was destroying workers on the Brooklyn Bridge long before anyone understood what it was. Workers would descend into pressurized wooden caissons to dig the riverbed, then surface too fast. Washington Roebling himself was permanently disabled by it. A German physician, Andrew Smith, conducted the first systematic study of the condition using Bridge workers as his subjects.",
        year: "1870s",
        category: "science",
      },
      {
        factoid: "Six days after the Brooklyn Bridge opened, a woman named Elizabeth Thompson stumbled on the stairs and screamed. Twelve people died in the resulting stampede — the crowd believed the bridge was collapsing. P.T. Barnum, sensing an opportunity, led 21 elephants across it to prove it was solid. It worked.",
        year: "1883",
        category: "weird",
      },
      {
        factoid: "The Brooklyn Bridge's main cables contain 3,515 miles of wire — enough to circle the earth once with wire to spare. When they were being laid, the wire contractor, J. Lloyd Haigh, was caught substituting inferior wire for the certified grade and pocketing the difference. Roebling found out midway through, calculated the bridge could hold anyway with extra cables, and added them. Haigh went to prison.",
        year: "1877",
        category: "crime",
      },
      {
        factoid: "The towers of the Brooklyn Bridge are so tall that when they were built, workers had to account for the curvature of the Earth to keep them truly vertical. The tops of the towers are 1.625 inches further apart than the bases — the only structure in New York where the planet's roundness is a measurable engineering factor.",
        year: "1883",
        category: "science",
      },
      {
        factoid: "Robert Odium became the first person to jump off the Brooklyn Bridge in 1885, as a stunt to prove it could be done. He survived the fall but died of internal injuries 45 minutes later. The doctor who examined him said the water's surface tension at that height was equivalent to hitting concrete. That information has not stopped approximately 10,000 people from trying since.",
        year: "1885",
        category: "weird",
      },
    ],
  },
  {
    name: "Wall Street",
    lat: 40.7074,
    lng: -74.0113,
    radiusKm: 0.6,
    facts: [
      {
        factoid: "George Washington wore a suit of American-made brown broadcloth at his inauguration on Wall Street — a deliberate snub to British luxury imports — then fumbled his oath of office. He added 'so help me God' on his own, a line that doesn't appear in the Constitution. The phrase became tradition for 200 years before anyone checked.",
        year: "1789",
        category: "politics",
      },
      {
        factoid: "Wall Street is named for an actual wall — a 12-foot wooden stockade built by Dutch colonists in 1653 to keep the English out. The English knocked it down when they arrived in 1664 anyway. The street named after the wall became the center of American finance, which the Dutch, had they survived, would probably have appreciated.",
        year: "1653",
        category: "politics",
      },
      {
        factoid: "The Buttonwood Agreement of 1792 — the founding document of what became the New York Stock Exchange — was signed by 24 brokers under a buttonwood tree on Wall Street. The original tree is gone, but the NYSE's first headquarters had a buttonwood planted in front of it as a tribute. The NYSE still references it in its founding mythology.",
        year: "1792",
        category: "politics",
      },
      {
        factoid: "On September 16, 1920, a horse-drawn wagon packed with 100 pounds of dynamite and 500 pounds of metal shard exploded in front of 23 Wall Street at noon, killing 38 people and injuring 400. It remains one of the deadliest domestic attacks in U.S. history. The perpetrators were never identified. The pockmarks from the explosion are still visible on the building's facade — the owners deliberately left them.",
        year: "1920",
        category: "crime",
      },
      {
        factoid: "Joseph Seligman, one of Wall Street's most prominent bankers, was turned away from the Grand Union Hotel in Saratoga in 1877 because he was Jewish. He'd just helped finance the Civil War. The resulting scandal was so enormous it became known as the 'Seligman Affair' and accelerated the formation of exclusive Jewish social clubs in New York that persist to this day.",
        year: "1877",
        category: "culture",
      },
      {
        factoid: "The New York Stock Exchange's famous 'Big Board' got its name from the giant chalkboard brokers used to post prices before electronic tickers. The original board was 40 feet wide and updated by hand every few minutes. During the 1929 crash, the chalk crew couldn't keep up — prices were falling faster than they could write.",
        year: "1929",
        category: "weird",
      },
    ],
  },
  {
    name: "Central Park",
    lat: 40.7851,
    lng: -73.9683,
    radiusKm: 0.9,
    facts: [
      {
        factoid: "Central Park was deliberately designed as a class filter. Frederick Law Olmsted's winding paths and hidden meadows were intended to confuse working-class visitors and keep them away from the genteel promenades. The straight roads were meant for carriages, not pedestrians. Olmsted wrote explicitly in his notes that the park should feel 'bewildering' to those without a guide.",
        year: "1858",
        category: "architecture",
      },
      {
        factoid: "Before Central Park was built, the land was home to Seneca Village — a thriving community of roughly 1,600 Black New Yorkers who owned property and had built three churches. The city seized it by eminent domain in 1857, demolished everything, and erased it from maps. The community wasn't mentioned in any Central Park history until archaeologists started digging in the 1990s.",
        year: "1857",
        category: "politics",
      },
      {
        factoid: "The Jacqueline Kennedy Onassis Reservoir in Central Park holds about 1 billion gallons of water. During WWII, the city seriously considered draining it and using the basin as an emergency landing strip for military aircraft. The plan was dropped because the surrounding park was deemed too small for a safe approach.",
        year: "1942",
        category: "politics",
      },
      {
        factoid: "Strawberry Fields — the teardrop-shaped memorial to John Lennon at the western edge of the park — was landscaped and dedicated by Yoko Ono, who also paid for its maintenance. The 'Imagine' mosaic was donated by Italy. More than 2,500 rose bushes were planted there the day of its dedication. The groundskeeper's name is Bruce; he has tended it for 30 years.",
        year: "1985",
        category: "culture",
      },
      {
        factoid: "Central Park has its own police precinct — the Central Park Precinct — with jurisdiction only inside the park. At 843 acres, the park is larger than the principality of Monaco. The precinct has solved crimes ranging from grand theft of the park's Delacorte Theater to a man who was found living in the park's cave system for eleven months before anyone noticed.",
        year: "1975",
        category: "crime",
      },
      {
        factoid: "The Delacorte Clock in Central Park plays a different song every 30 minutes, cycling through 32 nursery rhymes. The bronze animals around it — a bear, hippo, penguin, kangaroo, goat, and dancing monkey — have been rotating to the same songs since 1965. Park workers have learned to use the clock's chime to time their rounds. The monkey plays a tambourine.",
        year: "1965",
        category: "culture",
      },
    ],
  },
  {
    name: "Statue of Liberty",
    lat: 40.6892,
    lng: -74.0445,
    radiusKm: 0.4,
    facts: [
      {
        factoid: "The Statue of Liberty was originally intended for Egypt. Sculptor Frédéric Auguste Bartholdi pitched the idea to the Khedive of Egypt for the entrance of the Suez Canal — a giant lighthouse in the form of a robed Egyptian woman holding a torch. Egypt passed. He repackaged the concept as a gift to America, substituting a French face and calling it Liberty.",
        year: "1867",
        category: "weird",
      },
      {
        factoid: "The torch in the Statue of Liberty's hand has been closed to visitors since 1916, when German saboteurs blew up a nearby munitions depot at Black Tom Island in one of the largest pre-Pearl Harbor attacks on American soil. The blast shattered windows in Manhattan, was felt in Maryland, and damaged the torch arm badly enough that it was sealed permanently.",
        year: "1916",
        category: "crime",
      },
      {
        factoid: "The Statue of Liberty is made of copper so thin — 3/32 of an inch, roughly the thickness of two pennies — that on a hot day the interior temperature can reach 120°F. The copper exterior and iron interior are not in direct contact; they're connected by a system of flexible copper saddles designed by Gustave Eiffel specifically so the two metals can expand at different rates without cracking the statue.",
        year: "1886",
        category: "science",
      },
      {
        factoid: "Emma Lazarus wrote 'The New Colossus' — the 'give me your tired, your poor' poem — in 1883 as a fundraiser for the statue's pedestal, then largely forgot about it. The poem wasn't mounted on the pedestal until 1903, seventeen years after the statue opened, and wasn't widely read until the 1930s when a friend of Lazarus campaigned to have it recognized. By then it was considered synonymous with the statue.",
        year: "1903",
        category: "culture",
      },
      {
        factoid: "The Statue of Liberty was struck by lightning 300 times per year in its early decades. Benjamin Franklin's lightning rod principle was applied to the statue at construction, but the original system was inadequate. A proper lightning protection system wasn't installed until 1932, 46 years after dedication. The copper skin shows the accumulated effect of those decades of strikes in its oxidation patterns.",
        year: "1932",
        category: "science",
      },
    ],
  },
  {
    name: "Eiffel Tower",
    lat: 48.8584,
    lng: 2.2945,
    radiusKm: 0.6,
    facts: [
      {
        factoid: "The Eiffel Tower was supposed to be demolished after twenty years. Gustave Eiffel saved it by mounting a giant radio antenna on top and proving it was militarily useful — French intelligence used the tower to intercept German messages throughout WWI, including transmissions that led to the capture and execution of Mata Hari. The tower survived because spying is more convincing than aesthetics.",
        year: "1909",
        category: "politics",
      },
      {
        factoid: "The Eiffel Tower grows by up to 7 inches in summer. The iron expands in the heat, pushing the top upward measurably. Eiffel, who was an engineer rather than an architect, considered thermal expansion one of his crowning achievements and built the tower specifically to demonstrate it. He kept an apartment at the very top where he entertained guests including Thomas Edison.",
        year: "1889",
        category: "science",
      },
      {
        factoid: "When the Eiffel Tower opened, Parisians were furious. The city's most prominent artists signed a manifesto calling it a 'blot on the face of Paris' and demanding it be torn down. Guy de Maupassant reportedly ate lunch at the base restaurant every day because it was the only spot in Paris where he couldn't see it. He claimed the food was acceptable.",
        year: "1889",
        category: "culture",
      },
      {
        factoid: "A man named Victor Lustig sold the Eiffel Tower. Twice. In 1925, posing as a French government official, he invited scrap metal dealers to secret meetings, told them the tower was being sold for scrap due to maintenance costs, and collected 'processing fees.' He successfully conned one dealer, fled to America, and then flew back and did it again with a different dealer.",
        year: "1925",
        category: "crime",
      },
      {
        factoid: "Franz Reichelt, a tailor known as 'The Flying Tailor,' leapt from the first floor of the Eiffel Tower in 1912 to test a wearable parachute coat he had designed. He had convinced the city to let him use a dummy for the test, then arrived with himself. The coat did not work. The entire event was filmed; the footage still exists on YouTube and is extremely watchable.",
        year: "1912",
        category: "weird",
      },
      {
        factoid: "The Eiffel Tower has a secret apartment. Gustave Eiffel built a private apartment at the very top — 1,000 feet up — furnished with wooden wallpaper, rugs, a piano, and a modest dining table. He received Thomas Edison there in 1889, and the two engineers exchanged phonographs as gifts. The apartment is now a museum exhibit with wax figures of Eiffel and Edison, which is slightly worse than the original.",
        year: "1889",
        category: "architecture",
      },
    ],
  },
  {
    name: "Westminster",
    lat: 51.5007,
    lng: -0.1246,
    radiusKm: 0.8,
    facts: [
      {
        factoid: "The Palace of Westminster — where Parliament meets — burned down in 1834 because of tally sticks. These wooden sticks had been used for centuries to record tax payments, and when they were finally abolished and replaced with paper, someone decided to burn the surplus in the furnaces under the House of Lords. The fire spread, and most of the medieval palace was destroyed. An enormous crowd watched from the Thames and, by multiple accounts, cheered.",
        year: "1834",
        category: "politics",
      },
      {
        factoid: "Big Ben is not the tower — it's the bell inside it. The tower is called Elizabeth Tower, renamed in 2012 (it was previously called just 'Clock Tower'). Big Ben itself weighs 13.7 tons and cracked the first time it was rung, in 1857. The cracked replacement also cracked in 1859 and was rotated 90 degrees to present an un-cracked face to the hammer. It has been rung in that position ever since.",
        year: "1859",
        category: "architecture",
      },
      {
        factoid: "The Houses of Parliament have their own bar — several, actually — and MPs can vote while holding a drink. There's a division bell in the bar that sounds when a vote is called, giving members eight minutes to stagger to the chamber. The bar was only banned from the chamber itself in 1997, when a Speaker finally got tired of finding bottles under benches.",
        year: "1997",
        category: "politics",
      },
      {
        factoid: "Westminster Bridge is where Wordsworth wrote 'Composed Upon Westminster Bridge' in 1802, describing a London so still and clear it 'hath not anything to show more fair.' He wrote it at dawn. Within two hours, the Thames was thick with coal barges and the air was acrid with chimney smoke. The poem captures a window of perhaps 45 minutes.",
        year: "1802",
        category: "culture",
      },
      {
        factoid: "The Victoria Tower at the end of the Palace of Westminster is 98 metres tall and contains four miles of underground shelving holding every Act of Parliament since 1497. The collection includes Edward VI's grammar school charter, signed when the king was nine. There is a conservation team of three people whose entire job is to keep these documents alive.",
        year: "1497",
        category: "architecture",
      },
    ],
  },
  {
    name: "The Vatican",
    lat: 41.9029,
    lng: 12.4534,
    radiusKm: 0.5,
    facts: [
      {
        factoid: "The Vatican is technically a country, and it has a crime rate of about 1.5 crimes per resident per year — the highest per-capita crime rate on earth. This is not because the Pope is dangerous; it's because millions of tourists pass through, and Vatican residents number only around 800 while pickpockets and petty theft are common among the millions of visitors. Most crimes are never prosecuted.",
        year: "2019",
        category: "crime",
      },
      {
        factoid: "The Sistine Chapel ceiling was nearly destroyed twice: once in 1797 when a French gunpowder magazine blew up nearby, cracking part of the ceiling, and once in 1944 when an Allied bomb landed 300 meters away and the overpressure wave cracked the southern wall. Both times it survived by margins that the Vatican called miraculous and engineers called adequate structural engineering.",
        year: "1944",
        category: "architecture",
      },
      {
        factoid: "The Swiss Guard — the Pope's military force — still uses a weapon designed in the 16th century: the halberd, a six-foot pole with an axe-blade and a spike. They also carry concealed pistols and are trained at Swiss military facilities. There is a genuine firearms locker underneath the papal apartments. The uniform was not designed by Michelangelo; that is a myth.",
        year: "1506",
        category: "politics",
      },
      {
        factoid: "Vatican Radio was once one of the most powerful radio transmitters on earth. Its antennas, built in the 1930s with Guglielmo Marconi's personal involvement, caused elevated rates of leukemia in children living near them in the 1990s. Italy sued the Vatican. The Vatican argued it was sovereign territory and immune. The Italian courts agreed. The antennas were moved, eventually.",
        year: "1990s",
        category: "science",
      },
      {
        factoid: "The Vatican Secret Archives — formally the Vatican Apostolic Archive — contain 53 miles of shelving and records going back to the 8th century. Among the documents: Henry VIII's original request to the Pope for an annulment (rejected), a petition from Mary Queen of Scots written on the eve of her execution, and the full transcript of Galileo's trial. Researchers may apply for access, but they can only request 3 files per day.",
        year: "800",
        category: "culture",
      },
    ],
  },
  {
    name: "Hollywood",
    lat: 34.0928,
    lng: -118.3287,
    radiusKm: 2.5,
    facts: [
      {
        factoid: "The Hollywood sign originally read HOLLYWOODLAND and was a real estate advertisement for a housing development, lit by 4,000 light bulbs. The 'LAND' portion fell apart in 1949 after a maintenance worker named Albert Kothe, reportedly drunk, drove his car into the 'H,' then resigned before anyone could fire him. The city decided the truncated version looked better and made it official.",
        year: "1923",
        category: "weird",
      },
      {
        factoid: "D.W. Griffith's 'Birth of a Nation' in 1915 was the first film screened at the White House — Woodrow Wilson called it 'writing history with lightning.' It also directly revived the Ku Klux Klan, which had been largely defunct. The film's villain was a Black politician and its hero rode in KKK robes. Griffith spent the rest of his career trying to apologize without quite admitting what he'd done.",
        year: "1915",
        category: "politics",
      },
      {
        factoid: "The famous Hollywood 'casting couch' scandal had a specific architectural origin: early studio heads required actresses to audition in their personal offices, which were deliberately furnished with a couch and no desk, making the power dynamic spatially explicit. The design spread across studios until it became a grim industry convention. Most of the offices are now open-plan.",
        year: "1920s",
        category: "culture",
      },
      {
        factoid: "Peg Entwistle was an actress who climbed the 'H' of the HOLLYWOODLAND sign and jumped to her death in 1932, becoming the only person known to have died on the sign. The day after her death, the Beverly Hills Community Players mailed her a letter offering her the lead in their next production — a role about a woman who commits suicide. The letter sat uncollected in the post office.",
        year: "1932",
        category: "weird",
      },
      {
        factoid: "The iconic 'star maps' sold to tourists to find celebrity homes started in 1932, run by a man named Frank Hudson who realized there was money in directing starry-eyed Midwesterners toward Pickfair and the like. The studios tried to stop him for decades. He sold the business to his nephew. The company still exists.",
        year: "1932",
        category: "culture",
      },
    ],
  },
  {
    name: "Chicago Loop",
    lat: 41.8819,
    lng: -87.6278,
    radiusKm: 1.2,
    facts: [
      {
        factoid: "Chicago's river was permanently reversed by engineering in 1900 — the city literally changed the direction the Chicago River flows to prevent sewage from contaminating Lake Michigan. The state of Missouri sued, claiming Chicago was now flushing its sewage downstream toward them. The Supreme Court ruled in Chicago's favor. Missouri was wrong but also right.",
        year: "1900",
        category: "politics",
      },
      {
        factoid: "The Great Chicago Fire of 1871 almost certainly did not start because Mrs. O'Leary's cow kicked over a lantern. A newspaper reporter named Michael Ahern admitted in 1893 that he made up the cow story because it was more colorful than 'a fire of uncertain origin.' The real cause is still disputed. Mrs. O'Leary lived in infamy for 22 years for a cow that was, in all probability, perfectly well-behaved.",
        year: "1871",
        category: "weird",
      },
      {
        factoid: "The Willis Tower — still called the Sears Tower by everyone in Chicago — was the world's tallest building for 25 years, from 1973 to 1998. During its construction, the engineering firm rejected 26 preliminary structural systems before landing on the 'bundled tube' concept. The lead architect, Fazlur Rahman Khan, is largely unknown outside Chicago, which is a genuine injustice.",
        year: "1973",
        category: "architecture",
      },
      {
        factoid: "Al Capone ran his Chicago operations largely from the Lexington Hotel at 22nd and Michigan, where he kept an office on the fourth floor with a private escape tunnel into the adjacent building. When Geraldo Rivera famously excavated Capone's 'secret vault' in the hotel in 1986, live on national television, it contained dirt, a few empty bottles, and a stop sign. Thirty million people watched.",
        year: "1920s",
        category: "crime",
      },
      {
        factoid: "Chicago's 'L' — the elevated train — was built partly above the streets because the city had already paved over its sewer infrastructure and couldn't dig underground without dismantling it. The result is that downtown Chicago is effectively two cities: the street level, and the underground network of tunnels built in 1900 to deliver coal without blocking traffic. The coal tunnel system was accidentally flooded in 1992 and cost $1.95 billion to repair.",
        year: "1897",
        category: "architecture",
      },
    ],
  },
];

const EARTH_RADIUS_KM = 6371;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findPreloadedLocation(
  lat: number,
  lng: number,
  nameHint?: string
): PreloadedLocation | null {
  if (nameHint) {
    const byName = PRELOADED_LOCATIONS.find(
      (p) => p.name.toLowerCase() === nameHint.toLowerCase()
    );
    if (byName) return byName;
  }
  for (const loc of PRELOADED_LOCATIONS) {
    const dist = haversineKm(lat, lng, loc.lat, loc.lng);
    if (dist <= loc.radiusKm) return loc;
  }
  return null;
}
