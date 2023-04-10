import { Markup } from 'telegraf';

export const startConversationKeyboard = Markup.inlineKeyboard([
  Markup.button.callback('Start conversation', 'start_conversation'),
  Markup.button.callback('Conversation archive', 'conversation_archive'),
]);

export const endConversationKeyboard = Markup.inlineKeyboard([
  Markup.button.callback('End conversation', 'end_conversation'),
]);

export const startConversationAfterArchiveKeyboard = Markup.inlineKeyboard([
  Markup.button.callback('Start conversation', 'start_conversation'),
]);
