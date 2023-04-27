import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { resolve } from 'path';
import { DIRNAME_TOKEN } from '../telegraf.constants';

@Injectable()
export class OggConverterService {
  private __dirname: string;

  constructor(@Inject(DIRNAME_TOKEN) __dirname: string) {
    this.__dirname = __dirname;
  }

  //   toMp3() {}

  async create(url, filename) {
    try {
      const oggPath = resolve(__dirname, '../../../voices', `${filename}.ogg`);
      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream',
      });
      return new Promise(() => {
        const straem = createWriteStream(oggPath);
        response.data.pipe(straem);
        straem.on('finish', () => resolve(oggPath));
      });
    } catch (e) {
      console.log('Error while creating ogg', e.message);
    }
  }
}
