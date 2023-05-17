import { Injectable } from '@nestjs/common';

@Injectable()
export class HistoryTrimmingService {
  trimToMaxCharacters(
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    maxCharacters: number,
  ) {
    let totalCharacters = history.reduce((total, message) => {
      return total + message.content.length;
    }, 0);

    while (totalCharacters > maxCharacters) {
      const removedMessage = history.shift();
      totalCharacters -= removedMessage.content.length;
    }

    console.log('---------------------------------------');
    console.log(totalCharacters);
    console.log('---------------------------------------');

    return history;
  }
}
