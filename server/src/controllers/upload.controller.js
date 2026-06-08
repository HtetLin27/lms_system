import sharp from 'sharp';
import r2Service from '../services/r2.service'
import processVideo from '../services/video.service';
import { User } from '../models/index'


const uploadImage = async (req, res, next) => {
    try {
        if(!req.file) return res.status(400).json({ error: 'No image file provided'})

        const compressed = await sharp(req.file.buffer).resize(1280, 720, {
            fit: 'cover',
            position: 'centre'
        })
        .jpeg({ quality: 80})
        .toBuffer();

        const {url} = await r2Service.uploadFile({
            buffer: compressed,
            originalname: req.file.originalname,
            mimeType: 'image/jpeg',
            folder: r2Service.FOLDERS.image,
            isPublic: true
        })

        return res.status(201).json({
            message: 'Image uploaded successfully',
            url
        })
    } catch (error) {
        next(err)
    }
}


const uploadAvatar =  async (req, res, next) =>{
    try {
        if(!req.file) return res.status(400).json({ error: 'No image file provided'})

        const compressed = await sharp(req.file.buffer)
        .resize(200, 200,{ fit: 'cover', position: 'centre'})
        .jpeg({ quality: 85})
        .toBuffer();

        const {url} = await r2Service.uploadFile({
            buffer: compressed,
            originalname: req.file.originalname,
            mimeType: 'image/jpeg',
            folder: r2Service.FOLDERS.avatar,
            isPublic: true
        })

        await User.update(
            { avatar_url: url, updated_at: new Date()},
            { where: {id: req.user.id}}
        )

        return res.status(201).json({
            message: 'Avatar uploaded successfully',
            url
        })

    } catch (error) {
        next(err)
    }
}

const uploadPdf = async (req, res, next) => {
    try {
        if(!req.file) return res.status(400).json({ error: 'No PDF file provided'});

        const { key } = await r2Service.uploadFile({
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimeType: 'application/pdf',
            folder: r2Service.FOLDERS.pdf,
            isPublic: false
        })

        return res.status(201).json({ message: 
            'PDF uploaded successfully',
            key
        })
    } catch (error) {
        next(error)
    }
}

const uploadVideo = async (req, res, next) => {
    try {
        if(!req.file) return res.status(400).json({ error: ' No video file provided'})
        
        console.log(`Processing video: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(1)}MB)`)

        const { mp4Buffer, thumbnailBuffer, durationSeconds } = await processVideo(req.file.buffer, req.file.originalname);

        console.log(`Video processed. Duration: ${durationSeconds}s. Uploading to R2...`);

        const [videoResult, thumbnailResult] = await Promise.all([
            r2Service.uploadFile({
                buffer: mp4Buffer,
                originalname: 'video.mp4',
                mimeType: 'video/mp4',
                folder: r2Service.FOLDERS.video,
                isPublic: false
            }),
            thumbnailBuffer ? r2Service.uploadFile({
                buffer: thumbnailBuffer,
                originalname: 'thumbnail.jpg',
                mimeType: 'image/jpeg',
                folder: r2Service.FOLDERS.thumbnail,
                isPublic: true,
            }) : Promise.resolve({ key: null, url: null }),
        ])

        console.log(`Upload complete: ${videoResult.key}`);

        return res.status(201).json({
            message: 'Video uploaded and processed successfully',
            videoKey: videoResult.key,
            thumbnailUrl: thumbnailResult.url,
            durationSeconds
        })


    } catch (error) {
        console.error('Video upload failed:', error.message);
        next(err)
    }
}

export {
    uploadImage,
    uploadAvatar,
    uploadPdf,
    uploadVideo
}