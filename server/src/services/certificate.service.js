import PDFDocument from 'pdfkit';
import { Enrollment, User, Course, Certificate } from '../models/index';
import r2Service   from './r2.service';


const generateVerifyCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return`LMS-${code}-${new Date().getFullYear()}-${Math.random()
    .toString(36)
    .slice(-6)
    .toUpperCase()}`
}

const buildCertificatePdf = ({ studentName, courseTitle, instructorName, verifyCode, issuedAt }) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margin: 50
        });

        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        doc.rect(0, 0, doc.page.width, doc.page.height)
            .fill('#F8F6FF')
        doc.rect(20, 20, doc.page.width - 40, doc.page.height -40)
            .lineWidth(3).strokeColor('#6C47FF').stroke();

        doc.fillColor('#000000');

        doc.fontSize(36)
            .fillColor('#6C47FF').font('Helvetica-Bold').text('Certificate of Completion', { align: 'center' }).moveDown(0.5);
        
        doc.fontSize(16)
            .fillColor('#555555')
            .font('Helvetica')
            .text('This is to certify that', { align: 'center' }).moveDown(0.5);

        doc.fontSize(32)
            .fillColor('#1A1A1A')
            .font('Helvetica-Bold')
            .text(studentName, { align: 'center' })
            .moveDown(0.5);

        doc.fontSize(16)
            .fillColor('#555555')
            .font('Helvetica')
            .text('has successfully completed the course', { align: 'center' })
            .moveDown(0.5);

        doc.fontSize(26)
            .fillColor('#6C47FF')
            .font('Helvetica-Bold')
            .text(courseTitle, { align: 'center' })
            .moveDown(1);

        doc.fontSize(13)
            .fillColor('#555555')
            .font('Helvetica')
            .text(`Instructor: ${instructorName}`, { align: 'center' })
            .moveDown(0.3);

        const dateStr = new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.fontSize(13)
            .text(`Issued: ${dateStr}`, { align: 'center' })
            .moveDown(0.5);

        doc.fontSize(11)
            .fillColor('#888888')
            .text(`Verification Code: ${verifyCode}` , { align: 'center' })

        doc.end();

    })
}

const generateCertificate = async (enrollment) => {
    try {
        const existing = await Certificate.findOne({
            where: { enrollment_id: enrollment.id }
        });
        if(existing) return existing;

        const full = await Enrollment.findByPk(enrollment.id, {
            include: [
                {model: User, as: 'student'},
                {
                    model: Course, as: 'course',
                    include: [
                        { model: User, as: 'instructor' }
                    ]
                }
            ]
        })
        if (!full) throw new Error('Enrollment not found');

        const { student, course } = full;
        const verifyCode = generateVerifyCode();

        const pdfBuffer = await buildCertificatePdf({
            studentName: student.name,
            courseTitle: course.title,
            instructorName: course.instructor.name,
            verifyCode,
            issuedAt: new Date(),
        })

        const { url } = await r2Service.uploadFile({
            buffer: pdfBuffer,
            originalname: `certificate-${verifyCode}.pdf`,
            mimetype: 'application/pdf',
            folder: r2Service.FOLDERS.certificate,
            isPublic: true,
        })

        const certificate = await Certificate.create({
            enrollment_id: enrollment.id,
            file_url: url,
            verify_code: verifyCode,
            issued_at: new Date(),
        });

        console.log(` Certificate issued: ${verifyCode} for ${student.name}`);

        return certificate;


    }catch (error){
        console.error('Certificate generation failed:', error.message);
        return null;
    }
}

export {
    generateCertificate,
    generateVerifyCode
}