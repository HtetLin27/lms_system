import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import config  from '../config/config';


if(config.ffmpeg.path) {
  ffmpeg.setFfmpegPath(config.ffmpeg.path);
}

const writeTempFile = (buffer, extension) => {
    const tmpPath = path.join(os.tmpdir(), `${uuidv4()}.${extension}`);
    fs.writeFileSync(tmpPath, buffer);
    return tmpPath;
}

const getVideoDuration = (filePath) =>{
    return new Promise((resolve,reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) =>{
            if(err) return reject(err);
            resolve(metadata.format.duration);
        })
    })
}

const convertToMp4 = (inputPath) =>{
    return new Promise((resolve, reject) =>{
        const outputPath = path.join(os.tmpdir(), `${uuidv4()}.mp4`);

        ffmpeg(inputPath)
         .videoCodec('libx264')
         .audioCodec('aac')
         .outputOptions([`-crf ${config.ffmpeg.videoCrf}`,
        '-movflags faststart',
        '-pix_fmt yuv420p'
    ])
        .output(outputPath)
    .on('end',()=>{
        const buffer = fs.readFileSync(outputPath);

        fs.unlinkSync(inputPath);
        resolve(buffer);
    })

    .on('error',(err)=>{
        if(fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        reject(err);
    })

    .run();
    })
}

const generateThumbnail = (inputPath) => {
    return new Promise((resolve, reject) => {
        const outputDir = os.tmpdir();
        const outputName = `thumb-${uuidv4()}.jpg`;
        const outputPath = path.join(outputDir, outputName);

        ffmpeg(inputPath)
         .screenshot({
            count: 1,
            timemarks: ['5'],
            filename: outputName,
            folder: outputDir,
            size: '1280x720',
         })
         .on('end', () =>{
            const buffer = fs.readFileSync(outputPath);
            fs.unlinkSync(outputPath);
            resolve(buffer);
         })
         .on('error',(err) => {
            if(fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            resolve(null);
         })
    })
}

const processVideo = async (buffer, originalname) => {
    const ext = originalname.split('.').pop().toLowerCase();
    const tmpInput = writeTempFile(buffer, ext);

    try {
        const durationSeconds = await getVideoDuration(tmpInput);

        const [mp4Buffer, thumbnailBuffer] = await Promise.all([
            convertToMp4(tmpInput),
            generateThumbnail(tmpInput)
        ])

        return {mp4Buffer, thumbnailBuffer, durationSeconds};
    } finally{
        if(fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput)
    }
}


export default processVideo;

