import { Markup } from 'telegraf';

export const startConversationKeyboard = Markup.inlineKeyboard([
  Markup.button.callback('Start conversation', 'start_conversation'),
]);

export const endConversationKeyboard = Markup.inlineKeyboard([
  Markup.button.callback('End conversation', 'end_conversation'),
]);

export const postConversationKeyboard = Markup.inlineKeyboard([
  Markup.button.callback('Start Conversation', 'start_conversation'),
  Markup.button.callback('Archive Conversation', 'archive_conversation'),
]);
