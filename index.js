require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cheerio = require('cheerio');

const token = process.env.BOT_TOKEN;

if (!token) {
    console.error('❌ Ошибка: Токен не найден! Укажите его в .env');
    process.exit(1);
}

// 🛠️ Запускаем бота в режиме polling (без Webhook)
const bot = new TelegramBot(token, { polling: true });

console.log("🚀 Бот запущен в режиме polling!");

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'бро';
    bot.sendMessage(chatId, `Привет, ${firstName}! 👋  
Я бот, который поможет тебе найти аниме.
Просто напиши название аниме, и я скину ссылку на просмотр! 🎬. Создатель бота: @Bad3st`);
});

// Обработчик поиска аниме
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    if (!text || text.startsWith('/')) return;

    bot.sendMessage(chatId, 'Ищем аниме... Подожди немного ⏳');

    try {
        const searchUrl = encodeURI(`https://animego.org/search/all?q=${text}`);
        const response = await axios.get(searchUrl);
        const $ = cheerio.load(response.data);

        const firstAnime = $('.h5 a').first();
        if (firstAnime.length) {
            const animeUrl = `https://animego.org${firstAnime.attr('href')}`;
            const title = firstAnime.text().trim();
            bot.sendMessage(chatId, `Нашёл для тебя! 😎\n🎌 *${title}*\n🔗 [Смотреть на AnimeGo](${animeUrl})`, { parse_mode: 'Markdown' });
        } else {
            bot.sendMessage(chatId, '🥲 Не нашёл аниме с таким названием... Попробуй написать по-другому.');
        }
    } catch (error) {
        bot.sendMessage(chatId, '🚨 Ошибка! Попробуй ещё раз позже.');
        console.error(error);
    }
});
