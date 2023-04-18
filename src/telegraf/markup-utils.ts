import { Markup } from 'telegraf';

export const startConversationKeyboard = Markup.inlineKeyboard([
  Markup.button.callback('Start conversation', 'start_conversation'),
]);
