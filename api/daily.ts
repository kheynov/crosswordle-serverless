import {VercelRequest, VercelResponse} from '@vercel/node';
import {resolve} from 'path'
import {readFileSync} from 'fs'
import {genCrossword} from "../src/utils/utils";


export default async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== 'GET') {
        return res.status(405).json({
            message: 'Method not allowed',
        });
    }

    const {BASE_SEED} = process.env;

    const {lang = 'ru', seed} = req.query

    const contentsString = readFileSync(
        resolve(__dirname, lang == 'ru' ? '../src/files/words.txt' : '../src/files/words_en.txt')
    )
        .toString()
        .split('\n')

    const date: any = new Date();
    const dateStartYear: any = new Date(date.getFullYear(), 0, 0);
    const dayOfYear: any = Math.floor((date - dateStartYear) / (1000 * 60 * 60 * 24));
    const seedString: string = dayOfYear + date.getFullYear()

    const result = genCrossword(contentsString, <string>seed || BASE_SEED.concat(seedString))

    return res.json({

        data: result,
    });
}
