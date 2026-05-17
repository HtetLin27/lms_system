import dotevn from 'dotenv';

dotevn.config();

const required = (key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return process.env[key];
}

const toInt = (key,fallback) =>{
    return parseInt(process.env[key] || fallback , 10) 
}

const config = {
    app:{
        env: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5001,
        clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
        isDev : process.env.NODE_ENV === 'development',
        isTest: process.env.NODE_ENV === 'test',
    },
    db:{
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME || 'lms_dev',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres'
    },
    jwt:{
        secret: required('JWT_SECRET'),
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    },
    // Cloudflare R2 --------------------
    r2:{
        endpoint: required('R2_ENDPOINT'),
        accessKeyId: required('R2_ACCESS_KEY_ID'),
        secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
        bucketName: required('R2_BUCKET_NAME'),
        token: process.env.R2_TOKEN
    },
    // File upload limits --------------------
    upload:{
        maxImageSize: toInt('MAX_FILE_SIZE_IMAGE', 5 * 1024 * 1024), 
        maxVideoSize: toInt('MAX_FILE_SIZE_VIDEO', 500 * 1024 * 1024),
        maxPdfSize: toInt('MAX_FILE_SIZE_PDF',   50 * 1024 * 1024),
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedVideoTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo','video/x-matroska', 'video/webm'],
        allowedPdfTypes:   ['application/pdf'],
    },
    // Video processing --------------------
    ffmpeg:{
        path: process.env.FFMPEG_PATH || null,
        videoCrf:  toInt('VIDEO_QUALITY_CRF', 23),
    },
    signedUrl: {
        expiresIn: toInt('SIGNED_URL_EXPIRES', 3600),
    },
    mail: {
        host: process.env.MAIL_HOST,
        port: toInt('MAIL_PORT', 2525),
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
        from: process.env.MAIL_FROM || 'noreply@lms.dev',
    },
}

export default config;