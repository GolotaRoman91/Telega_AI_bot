import { Injectable } from '@nestjs/common';

@Injectable()
export class HistoryTrimmingService {
  trimToMaxCharacters(
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    maxCharacters: number,
  ) {
    let totalCharacters = history.reduce((total, message) => {
      const englishLetters = (message.content.match(/[a-zA-Z]/g) || []).length;
      const nonEnglishLetters = (message.content.match(/[^\x00-\x7F]/g) || [])
        .length;
      return total + englishLetters + nonEnglishLetters * 3.1;
    }, 0);

    while (totalCharacters > maxCharacters) {
      const removedMessage = history.shift();
      const englishLetters = (removedMessage.content.match(/[a-zA-Z]/g) || [])
        .length;
      const nonEnglishLetters = (
        removedMessage.content.match(/[^\x00-\x7F]/g) || []
      ).length;
      totalCharacters -= englishLetters + nonEnglishLetters * 3.1;
    }

    console.log('---------------------------------------');
    console.log(totalCharacters);
    console.log('---------------------------------------');

    return history;
  }
}
