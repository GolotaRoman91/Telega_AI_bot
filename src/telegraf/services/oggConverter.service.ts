import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { DIRNAME_TOKEN } from '../telegraf.constants';

@Injectable()
export class OggConverterService {
  private __dirname: string;

  constructor(@Inject(DIRNAME_TOKEN) __dirname: string) {
    this.__dirname = __dirname;
  }

  async create(url, filename) {
    try {
      const voicesDir = resolve(this.__dirname, '../../voices');
      if (!existsSync(voicesDir)) {
        mkdirSync(voicesDir);
      }
      const oggPath = resolve(voicesDir, `${filename}.ogg`);
      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream',
      });
      return new Promise((resolve, reject) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);
        stream.on('finish', () => resolve(oggPath));
        stream.on('error', (error) => reject(error));
      });
    } catch (e) {
      console.log('Error while creating ogg', e.message);
    }
  }
}
