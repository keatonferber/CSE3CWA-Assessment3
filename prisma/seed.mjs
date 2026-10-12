import { readFile } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const corpus = JSON.parse(await readFile(new URL('../data/hce-corpus.json', import.meta.url), 'utf8'));
const hintData = JSON.parse(await readFile(new URL('../data/phoneme-hints.json', import.meta.url), 'utf8'));

function difficultyForCount(count) {
  if (count <= 3) return 'easy';
  if (count === 4) return 'medium';
  return 'hard';
}

async function ensureConfig(data) {
  const existing = await prisma.activityConfig.findFirst({ where: { name: data.name } });
  if (existing) return prisma.activityConfig.update({ where: { id: existing.id }, data });
  return prisma.activityConfig.create({ data });
}

async function seedCoreData() {
  const uniqueSymbols = [...new Set([
    ...corpus.keyboard,
    ...corpus.words.flatMap((word) => word.phonemes)
  ])];

  for (const symbol of uniqueSymbols) {
    await prisma.phoneme.upsert({
      where: { symbol },
      update: {
        hintLabel: hintData.hints[symbol] || `/${symbol}/`,
        exampleWord: hintData.examples[symbol] || ''
      },
      create: {
        symbol,
        hintLabel: hintData.hints[symbol] || `/${symbol}/`,
        exampleWord: hintData.examples[symbol] || ''
      }
    });
  }

  const lists = {};
  for (const count of [3, 4, 5]) {
    lists[count] = await prisma.wordList.upsert({
      where: { name: `HCE ${count}-phoneme words` },
      update: {
        description: `Official ${count}-phoneme word set supplied in HCE_Wordle_Phoneme_Corpus.docx.`
      },
      create: {
        name: `HCE ${count}-phoneme words`,
        description: `Official ${count}-phoneme word set supplied in HCE_Wordle_Phoneme_Corpus.docx.`
      }
    });
  }

  for (const item of corpus.words) {
    const listId = lists[item.phonemeCount].id;
    const existing = await prisma.word.findUnique({
      where: { listId_english: { listId, english: item.word } }
    });
    if (!existing) {
      await prisma.word.create({
        data: {
          english: item.word,
          difficulty: difficultyForCount(item.phonemeCount),
          hint: `${item.phonemeCount}-phoneme HCE corpus word`,
          listId,
          phonemes: {
            create: item.phonemes.map((symbol, position) => ({
              position,
              phoneme: { connect: { symbol } }
            }))
          }
        }
      });
    }
  }

  const wordle3 = await ensureConfig({
    name: '3-phoneme Wordle practice',
    type: 'wordle',
    listId: lists[3].id,
    difficulty: 'easy',
    wordCount: 5,
    phonemeLength: 3,
    maxAttempts: 6,
    showHints: true,
    showEnglishOnCorrect: true,
    title: 'HCE Phoneme Wordle — 3 phonemes',
    instructions: 'Choose one phoneme per cell. Green means correct position and yellow means the phoneme is present in another position.'
  });

  const wordle4 = await ensureConfig({
    name: '4-phoneme Wordle practice',
    type: 'wordle',
    listId: lists[4].id,
    difficulty: 'medium',
    wordCount: 5,
    phonemeLength: 4,
    maxAttempts: 6,
    showHints: true,
    showEnglishOnCorrect: true,
    title: 'HCE Phoneme Wordle — 4 phonemes',
    instructions: 'Build each target from four HCE phonemes. Hover or focus a phoneme key for a teaching hint.'
  });

  const wordSearch = await ensureConfig({
    name: 'HCE Word Search practice',
    type: 'wordsearch',
    listId: lists[4].id,
    difficulty: 'medium',
    wordCount: 8,
    phonemeLength: null,
    gridRows: 10,
    gridCols: 10,
    showHints: true,
    allowDiagonal: true,
    allowReverse: true,
    showAnswers: true,
    title: 'HCE Phoneme Word Search',
    instructions: 'Drag across a straight line of phoneme cells to find each target sequence.'
  });

  return { wordle3, wordle4, wordSearch, uniqueSymbols };
}

async function seedSimulatedUsage(configs) {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const records = [
    ['generation_success', 'wordle', '/wordle', configs.wordle3.id, null, 'Generated 3-phoneme Wordle', 72],
    ['generation_success', 'wordle', '/wordle', configs.wordle4.id, null, 'Generated 4-phoneme Wordle', 66],
    ['generation_success', 'wordsearch', '/word-search', configs.wordSearch.id, null, 'Generated Word Search', 60],
    ['time_on_page', 'wordle', '/wordle', null, 94000, null, 54],
    ['time_on_page', 'wordsearch', '/word-search', null, 118000, null, 50],
    ['generation_success', 'wordle', '/wordle', configs.wordle3.id, null, 'Generated 3-phoneme Wordle', 47],
    ['generation_failure', 'wordsearch', '/word-search', configs.wordSearch.id, null, 'Simulated warning: no eligible words matched a temporary filter.', 43],
    ['page_view', null, '/dashboard', null, null, null, 40],
    ['generation_success', 'wordsearch', '/word-search', configs.wordSearch.id, null, 'Generated Word Search', 36],
    ['time_on_page', null, '/words', null, 73000, null, 32],
    ['generation_success', 'wordle', '/wordle', configs.wordle3.id, null, 'Generated 3-phoneme Wordle', 29],
    ['generation_success', 'wordle', '/wordle', configs.wordle4.id, null, 'Generated 4-phoneme Wordle', 26],
    ['generation_failure', 'wordle', '/wordle', configs.wordle3.id, null, 'Simulated warning: invalid temporary generation request.', 22],
    ['time_on_page', null, '/activities', null, 81000, null, 19],
    ['generation_success', 'wordsearch', '/word-search', configs.wordSearch.id, null, 'Generated Word Search', 17],
    ['page_view', null, '/', null, null, null, 14],
    ['generation_success', 'wordle', '/wordle', configs.wordle3.id, null, 'Generated 3-phoneme Wordle', 12],
    ['time_on_page', 'wordle', '/wordle', null, 126000, null, 10],
    ['generation_success', 'wordsearch', '/word-search', configs.wordSearch.id, null, 'Generated Word Search', 8],
    ['generation_success', 'wordle', '/wordle', configs.wordle4.id, null, 'Generated 4-phoneme Wordle', 6],
    ['time_on_page', 'wordsearch', '/word-search', null, 102000, null, 5],
    ['page_view', null, '/dashboard', null, null, null, 4],
    ['generation_success', 'wordle', '/wordle', configs.wordle3.id, null, 'Generated 3-phoneme Wordle', 3],
    ['generation_success', 'wordsearch', '/word-search', configs.wordSearch.id, null, 'Generated Word Search', 2],
    ['time_on_page', null, '/dashboard', null, 67000, null, 1]
  ];

  for (let i = 0; i < records.length; i += 1) {
    const [eventType, activityType, page, configId, durationMs, message, hoursAgo] = records[i];
    const sourceKey = `assessment3-seed-${String(i + 1).padStart(2, '0')}`;
    await prisma.usageEvent.upsert({
      where: { sourceKey },
      update: {},
      create: {
        eventType,
        activityType,
        page,
        configId,
        durationMs,
        message,
        source: 'simulated',
        sourceKey,
        createdAt: new Date(now - hoursAgo * hour)
      }
    });
  }
}

async function main() {
  const configs = await seedCoreData();
  await seedSimulatedUsage(configs);
  console.log(`Database ready: ${corpus.words.length} HCE words, ${configs.uniqueSymbols.length} phoneme symbols, 3 activity configurations and simulated A3 usage records.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
