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
        const response = await axios.get(`https://shikimori.one/api/animes?search=${encodeURIComponent(text)}`);
        const results = response.data;

        if (results.length > 0) {
            const anime = results[0];
            const title = anime.russian || anime.name;
            const url = `https://shikimori.one${anime.url}`;
            const synopsis = anime.description || 'Описание недоступно.';
            bot.sendMessage(chatId, `Нашёл для тебя! 😎  \n🎌 *${title}*  \n📖 ${synopsis}  \n🔗 [Смотреть на Shikimori](${url})`);
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
