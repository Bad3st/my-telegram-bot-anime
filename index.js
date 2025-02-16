require('dotenv').config(); // Подключение .env

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const process = require('process');

// Токен из .env
const token = process.env.BOT_TOKEN;
if (!token) {
    console.error('❌ Ошибка: Токен не найден! Укажите его в .env');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Функция логирования
function logMessage(message) {
    fs.appendFileSync('bot.log', `${new Date().toISOString()} - ${message}\n`);
}

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'бро';
    bot.sendMessage(chatId, `Привет, ${firstName}! 👋  
Я бот, который поможет тебе найти аниме.
Просто напиши название аниме, и я скину ссылку на просмотр! 🎬. Создатель бота: @Bad3st`);
    logMessage(`Пользователь ${firstName} запустил бота.`);
});

// Обработчик сообщений (поиск аниме)
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    bot.sendMessage(chatId, 'Ищем аниме... Подожди немного ⏳');

try {
    const searchUrl = `https://animego.org/search/all?q=${encodeURIComponent(text)}`;
    const response = await axios.get(searchUrl);
    const html = response.data;

    // Ищем первую ссылку на аниме в результатах поиска
    const regex = /<a class="h5" href="(\/anime\/[^"]+)"[^>]*>(.*?)<\/a>/;
    const match = regex.exec(html);

    if (match) {
        const animeUrl = `https://animego.org${match[1]}`;
        const title = match[2];
        bot.sendMessage(chatId, `Нашёл для тебя! 😎  \n🎌 *${title}*  \n🔗 [Смотреть на AnimeGo](${animeUrl})`);
    } else {
        bot.sendMessage(chatId, '🥲 Не нашёл аниме с таким названием... Попробуй написать по-другому.');
    }
} catch (error) {
    logMessage(`Ошибка: ${error.message}`);
    bot.sendMessage(chatId, '🚨 Что-то пошло не так... Попробуй ещё раз чуть позже.');
}

});

// Автоперезапуск при сбоях
process.on('uncaughtException', (err) => {
    logMessage(`❌ Критическая ошибка: ${err.message}`);
    console.error('❌ Бот упал, перезапускаю...');
    setTimeout(() => process.exit(1), 5000);
});

console.log('🔥 Бот запущен и готов к поиску аниме!');
logMessage('🔥 Бот запущен!');

// Убедимся, что программа не завершится
setInterval(() => {}, 1000 * 60 * 60);
