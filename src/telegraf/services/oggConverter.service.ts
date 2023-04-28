import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as ffmpeg from 'fluent-ffmpeg';
import * as installer from '@ffmpeg-installer/ffmpeg';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { DIRNAME_TOKEN } from '../telegraf.constants';
import * as fs from 'fs';

@Injectable()
export class OggConverterService {
  private __dirname: string;

  constructor(@Inject(DIRNAME_TOKEN) __dirname: string) {
    this.__dirname = __dirname;
    ffmpeg.setFfmpegPath(installer.path);
  }

  async toMp3(input: string, output: string): Promise<string> {
    try {
      const voicesDir = resolve(this.__dirname, '../../voices');
      const outputPath = resolve(voicesDir, `${output}.mp3`);

      // Check if input file exists before calling ffmpeg()
      if (fs.existsSync(input)) {
        return new Promise((resolve, reject) => {
          ffmpeg(input)
            .audioBitrate(128)
            .save(outputPath)
            .on('end', () => resolve(outputPath))
            .on('error', reject);
        });
      } else {
        throw new Error(`Input file ${input} does not exists.`);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async create(url: string, filename: string): Promise<string> {
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
