export interface Hadith {
  id: number;
  text: string;
  narrator: string;
  source: string;
  category: string;
}

export const hadiths: Hadith[] = [
  {
    id: 1,
    text: "The believer is not one who eats his fill while his neighbor goes hungry.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Al-Adab Al-Mufrad",
    category: "Compassion"
  },
  {
    id: 2,
    text: "Whoever believes in Allah and the Last Day should speak good or keep silent.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Bukhari",
    category: "Speech"
  },
  {
    id: 3,
    text: "The best of people are those who benefit others.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Daraqutni",
    category: "Service"
  },
  {
    id: 4,
    text: "A person is not a believer who fills his stomach while his neighbor is hungry.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Al-Adab Al-Mufrad",
    category: "Compassion"
  },
  {
    id: 5,
    text: "The most beloved of people to Allah are those who are most beneficial to people.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Service"
  },
  {
    id: 6,
    text: "Kindness is a mark of faith, and whoever is not kind has no faith.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Kindness"
  },
  {
    id: 7,
    text: "The strong person is not the one who can wrestle someone else down. The strong person is the one who can control himself when he is angry.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Bukhari",
    category: "Self-Control"
  },
  {
    id: 8,
    text: "Allah does not look at your forms and possessions but He looks at your hearts and your deeds.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Sincerity"
  },
  {
    id: 9,
    text: "The world is green and beautiful, and Allah has appointed you as His stewards over it.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Environment"
  },
  {
    id: 10,
    text: "Whoever removes a worldly grief from a believer, Allah will remove from him one of the griefs of the Day of Judgment.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Help"
  },
  {
    id: 11,
    text: "The best jihad is a word of truth spoken in front of a tyrannical ruler.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan Abu Dawood",
    category: "Justice"
  },
  {
    id: 12,
    text: "He is not of us who does not show mercy to our young ones and does not acknowledge the honor due to our elders.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan Abu Dawood",
    category: "Respect"
  },
  {
    id: 13,
    text: "The seeking of knowledge is obligatory upon every Muslim.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Ibn Majah",
    category: "Knowledge"
  },
  {
    id: 14,
    text: "A good word is charity.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Bukhari",
    category: "Charity"
  },
  {
    id: 15,
    text: "The best of you are those who learn the Quran and teach it.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Bukhari",
    category: "Knowledge"
  },
  {
    id: 16,
    text: "Whoever conceals the faults of a Muslim, Allah will conceal his faults in this world and the Hereafter.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Forgiveness"
  },
  {
    id: 17,
    text: "The merciful will be shown mercy by the Merciful One. Be merciful to others and you will receive mercy.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan Abu Dawood",
    category: "Mercy"
  },
  {
    id: 18,
    text: "None of you truly believes until he loves for his brother what he loves for himself.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Bukhari",
    category: "Brotherhood"
  },
  {
    id: 19,
    text: "The best charity is that given in Ramadan.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Charity"
  },
  {
    id: 20,
    text: "Whoever is not grateful to people is not grateful to Allah.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan Abu Dawood",
    category: "Gratitude"
  },
  {
    id: 21,
    text: "The upper hand is better than the lower hand.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Bukhari",
    category: "Giving"
  },
  {
    id: 22,
    text: "Whoever relieves a believer's distress of the distressful aspects of this world, Allah will rescue him from a difficulty of the difficulties of the Hereafter.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Help"
  },
  {
    id: 23,
    text: "The best of houses is the house in which an orphan is well treated.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Ibn Majah",
    category: "Orphans"
  },
  {
    id: 24,
    text: "Paradise lies at the feet of your mother.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan An-Nasa'i",
    category: "Parents"
  },
  {
    id: 25,
    text: "The best of you is he who is best to his family.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Family"
  },
  {
    id: 26,
    text: "Whoever walks with a wrongdoer to help him, has left Islam.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Justice"
  },
  {
    id: 27,
    text: "The most complete of the believers in faith are those with the best character.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan Abu Dawood",
    category: "Character"
  },
  {
    id: 28,
    text: "Whoever does not thank people, does not thank Allah.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan Abu Dawood",
    category: "Gratitude"
  },
  {
    id: 29,
    text: "The believer's shade on the Day of Resurrection will be his charity.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Charity"
  },
  {
    id: 30,
    text: "Whoever has been given gentleness has been given a good portion of this world and the next.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan Abu Dawood",
    category: "Gentleness"
  },
  {
    id: 31,
    text: "The best of people are those who live longest and excel in their deeds.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Excellence"
  },
  {
    id: 32,
    text: "Whoever believes in Allah and the Last Day, let him honor his guest.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Bukhari",
    category: "Hospitality"
  },
  {
    id: 33,
    text: "The world is a prison for the believer and paradise for the disbeliever.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Perspective"
  },
  {
    id: 34,
    text: "Actions are but by intention and every man shall have but that which he intended.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Bukhari",
    category: "Intention"
  },
  {
    id: 35,
    text: "The best of people are those who are most beneficial to others.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Daraqutni",
    category: "Service"
  },
  {
    id: 36,
    text: "Whoever is kind, Allah will be kind to him; therefore be kind to man on the earth.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan Abu Dawood",
    category: "Kindness"
  },
  {
    id: 37,
    text: "The best charity is to satisfy a hungry person.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Ahmad",
    category: "Charity"
  },
  {
    id: 38,
    text: "Whoever guides someone to virtue will be rewarded equivalent to him who practices that good action.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Guidance"
  },
  {
    id: 39,
    text: "The best of you are those who feed others.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Ahmad",
    category: "Generosity"
  },
  {
    id: 40,
    text: "Whoever suppresses his anger when he has the power to act upon it, Allah will call him before all of creation on the Day of Judgment.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Self-Control"
  },
  {
    id: 41,
    text: "The best of worship is to have hope in Allah.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Hope"
  },
  {
    id: 42,
    text: "Whoever loves to meet Allah, Allah loves to meet him.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Bukhari",
    category: "Love of Allah"
  },
  {
    id: 43,
    text: "The best of deeds is that which is done consistently, even if it is small.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Consistency"
  },
  {
    id: 44,
    text: "Whoever performs ablution perfectly, his sins will depart from his body, even from under his nails.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Purification"
  },
  {
    id: 45,
    text: "The best of prayers is the prayer of David: he used to sleep half the night, pray for a third of it, and sleep for a sixth of it.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Bukhari",
    category: "Prayer"
  },
  {
    id: 46,
    text: "Whoever recites the Quran and acts upon it, his parents will be crowned on the Day of Judgment.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan Abu Dawood",
    category: "Quran"
  },
  {
    id: 47,
    text: "The best of you are those who are best to their wives.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Marriage"
  },
  {
    id: 48,
    text: "Whoever visits a sick person or visits a brother in Islam, a caller calls out: 'May you be happy, may your walking be blessed, and may you occupy a dignified position in Paradise.'",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Visiting"
  },
  {
    id: 49,
    text: "The best of people are those who are most beneficial to people.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Daraqutni",
    category: "Service"
  },
  {
    id: 50,
    text: "Whoever helps a believer in distress, Allah will help him in distress in this world and the next.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Help"
  },
  {
    id: 51,
    text: "The best of people are those who live longest and excel in their deeds.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Excellence"
  },
  {
    id: 52,
    text: "Whoever is patient during hardship and grateful during ease, Allah will grant him security.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Patience"
  },
  {
    id: 53,
    text: "The best of you are those who learn the Quran and teach it to others.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Bukhari",
    category: "Teaching"
  },
  {
    id: 54,
    text: "Whoever makes peace between people, Allah will make peace for him.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan Abu Dawood",
    category: "Peace"
  },
  {
    id: 55,
    text: "The best of worship is waiting for relief.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Patience"
  },
  {
    id: 56,
    text: "Whoever seeks knowledge, Allah will make easy for him the path to Paradise.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Knowledge"
  },
  {
    id: 57,
    text: "The best of you are those who are slow to anger and quick to forgive.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Forgiveness"
  },
  {
    id: 58,
    text: "Whoever gives charity equal to a date from honest earnings, Allah will accept it and nurture it for him.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Bukhari",
    category: "Charity"
  },
  {
    id: 59,
    text: "The best of people are those who are most humble.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Humility"
  },
  {
    id: 60,
    text: "Whoever loves for the sake of Allah and hates for the sake of Allah has perfected his faith.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan Abu Dawood",
    category: "Faith"
  },
  {
    id: 61,
    text: "The best of deeds is to make your parents happy.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Parents"
  },
  {
    id: 62,
    text: "Whoever is grateful for little will be trusted with much.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Gratitude"
  },
  {
    id: 63,
    text: "The best of you are those who are most beneficial to their families.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Daraqutni",
    category: "Family"
  },
  {
    id: 64,
    text: "Whoever controls his tongue will be saved.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Speech"
  },
  {
    id: 65,
    text: "The best of people are those who are most God-conscious.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Taqwa"
  },
  {
    id: 66,
    text: "Whoever seeks forgiveness for the believing men and women, Allah will write for him a good deed for each believing man and woman.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Forgiveness"
  },
  {
    id: 67,
    text: "The best of you are those who are most sincere in their worship.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Sincerity"
  },
  {
    id: 68,
    text: "Whoever is content with what Allah has given him will be the richest of people.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Contentment"
  },
  {
    id: 69,
    text: "The best of people are those who are most trustworthy.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Trust"
  },
  {
    id: 70,
    text: "Whoever remembers Allah much will be loved by Allah.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Remembrance"
  },
  {
    id: 71,
    text: "The best of people are those who are most patient during trials.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Patience"
  },
  {
    id: 72,
    text: "Whoever seeks Allah's pleasure at the expense of people's displeasure, Allah will be pleased with him.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Pleasing Allah"
  },
  {
    id: 73,
    text: "The best of people are those who are most generous with their time.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Generosity"
  },
  {
    id: 74,
    text: "Whoever is easy-going with people, Allah will be easy-going with him.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Ease"
  },
  {
    id: 75,
    text: "The best of people are those who are most hopeful in Allah's mercy.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Hope"
  },
  {
    id: 76,
    text: "Whoever loves to meet Allah, Allah loves to meet him.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Bukhari",
    category: "Love of Allah"
  },
  {
    id: 77,
    text: "The best of people are those who are most fearful of Allah.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Fear of Allah"
  },
  {
    id: 78,
    text: "Whoever is humble for Allah's sake, Allah will elevate him.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Humility"
  },
  {
    id: 79,
    text: "The best of people are those who are most careful about their prayers.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Prayer"
  },
  {
    id: 80,
    text: "Whoever seeks knowledge in order to compete with scholars or to argue with fools has entered the Fire.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tirmidhi",
    category: "Knowledge"
  },
  {
    id: 81,
    text: "The best of people are those who are most beneficial to Allah's creation.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Daraqutni",
    category: "Service"
  },
  {
    id: 82,
    text: "Whoever is patient with people's harm will be rewarded by Allah.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Patience"
  },
  {
    id: 83,
    text: "The best of people are those who are most just in their dealings.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Justice"
  },
  {
    id: 84,
    text: "Whoever forgives and makes reconciliation, his reward is with Allah.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Quran 42:40",
    category: "Forgiveness"
  },
  {
    id: 85,
    text: "The best of people are those who are most mindful of their words.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Speech"
  },
  {
    id: 86,
    text: "Whoever is consistent in his good deeds will enter Paradise.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Consistency"
  },
  {
    id: 87,
    text: "The best of people are those who are most grateful to Allah.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Gratitude"
  },
  {
    id: 88,
    text: "Whoever seeks Allah's forgiveness regularly, Allah will provide him a way out of every difficulty.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan Abu Dawood",
    category: "Forgiveness"
  },
  {
    id: 89,
    text: "The best of people are those who are most devoted to their worship.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Worship"
  },
  {
    id: 90,
    text: "Whoever is truthful in his speech will be trusted by people.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Truthfulness"
  },
  {
    id: 91,
    text: "The best of people are those who are most careful about what they eat.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Halal"
  },
  {
    id: 92,
    text: "Whoever is generous with his wealth will be beloved to Allah.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Generosity"
  },
  {
    id: 93,
    text: "The best of people are those who are most protective of their honor.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Honor"
  },
  {
    id: 94,
    text: "Whoever is moderate in his lifestyle will never be in need.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Moderation"
  },
  {
    id: 95,
    text: "The best of people are those who are most eager to do good.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Good Deeds"
  },
  {
    id: 96,
    text: "Whoever is pleased with Allah as his Lord will find peace.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sahih Muslim",
    category: "Contentment"
  },
  {
    id: 97,
    text: "The best of people are those who are most concerned about the Hereafter.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Hereafter"
  },
  {
    id: 98,
    text: "Whoever purifies his heart will be successful.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Quran 91:9",
    category: "Purification"
  },
  {
    id: 99,
    text: "The best of people are those who are most conscious of their duties to Allah.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Tabarani",
    category: "Duty"
  },
  {
    id: 100,
    text: "Whoever ends his life with 'La ilaha illa Allah' will enter Paradise.",
    narrator: "Prophet Muhammad (ﷺ)",
    source: "Sunan Abu Dawood",
    category: "Faith"
  }
];

export function getHadithOfTheDay(): Hadith {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const hadithIndex = (dayOfYear - 1) % hadiths.length;
  return hadiths[hadithIndex];
}

export function getHadithByDate(date: Date): Hadith {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const hadithIndex = (dayOfYear - 1) % hadiths.length;
  return hadiths[hadithIndex];
}