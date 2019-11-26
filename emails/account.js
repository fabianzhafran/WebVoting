const sgMail = require('@sendgrid/mail');
const sendGridKey = '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';

sgMail.setApiKey(sendGridKey);

const sendEmail = (name, email, nrp, token) => {
    sgMail.send({
        to : email,
        from : 'fabianzhafransyah@gmail.com',
        subject : `Voting Psikologi Maranatha`,
        text : `Nama    : ${name}\n Email   : ${email}\n NRP    : ${nrp}\n Token login anda : ${token}\n Silakan gunakan untuk login dan voting.`
    })
} 

// const sendCancelationEmail = (email) => {
//     sgMail.send({
//         to : email,
//         from : 'fabianzhafransyahharahap@gmail.com',
//         subject : 'We\'re sad that you have to go! :(',
//         text : 'Hello, we are very sorry that you have to go! You can let us know how we can improve to make you stay here though :) Thanks for the journey with us, we hope to see you again soon!'
//     })
// }

module.exports = {
    sendEmail
}