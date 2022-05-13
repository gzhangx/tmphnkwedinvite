const fs = require('fs');
const nodemailer = require('nodemailer');
const Promise = require('bluebird');
const msauth = {
    user: 'user@acxcn.org',
    pass: 'pwd'
}
async function sendEmails() {
    const emailTemplate = fs.readFileSync('template.txt').toString();
    const guests = fs.readFileSync('guests.txt').toString().split('\n').map(g => g.trim()).filter(x => x).map(g => {
        const ind = g.indexOf(' ');
        return {
            email: g.substring(0, ind).trim(),
            name: g.substring(ind+1).trim(),
        }
    });

    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        tls: {
            ciphers: 'SSLv3'
        },
        auth: msauth,
    });
    await Promise.map(guests, async g => {
        const html = emailTemplate.replace(/{name}/g, g.name);
        //console.log(html)
        try {
            console.log(`Sending to ${g.email}  ${g.name} `);            
            await transporter.sendMail({
                from: msauth.user,
                subject: `Welcome to our event`,
                to: g.email,
                //subject: 'Nodemailer is unicode friendly ✔',            
                html,
                //attachments: [
                //    {                        
                //        content,
                //        encoding: 'base64',                        
                //    }
                //]
            });
        } catch (err) {
            console.log(err);
            console.log(`failed email ${g.name} ${g.email}`);
            return null;
        }
    }, {concurrency: 1})
}

sendEmails();