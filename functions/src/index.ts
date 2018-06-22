import * as functions from 'firebase-functions';
const nodemailer = require('nodemailer');

// Configure the email transport using the default SMTP transport and a GMail account.
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});
const APP_NAME = 'Hope House Scheduler';

// [START sendWelcomeEmail]
/**
 * Sends a welcome email to new user.
 */
// [START onCreateTrigger]
export const sendWelcomeEmail = functions.auth.user().onCreate((user) => {
    // [END onCreateTrigger]
    // [START eventAttributes]
    const email = user.email; // The email of the user.
    // [END eventAttributes]

    const mailOptions = {
        from: `${APP_NAME} <noreply@firebase.com>`,
        to: email,
        subject: `Welcome to ${APP_NAME}!`,
        text: `Thanks for signing up to serve a meal at Hope House Mission! We couldn't do what we do without the help of our volunteers. Together, we can help break the cycle of poverty and despair one life at a time.

Below is the vital info you need to plan your meal:

Women's Shelter Meals

  *   1300 Girard Ave., Middletown Ohio
  *   513-217-5056
  *   Parking and entrance are around the back of the building
  *   Plan for 40 servings
  *   Lunch - Arrive no later than 11:30am, ready to serve at 12:00pm
  *   Dinner - Arrive no later than 5:00pm, ready to serve at 5:30pm
  *   We have plates, cups, serving utensils

Men's Shelter Meals

  *   34 S. Main St., Middletown Ohio
  *   513-424-4673
  *   Parking is across the street at the Fifth Third Parking lot. The sign on the outside of the building reads "US Hotel." Items can be unloaded in the back of the building.
  *   Plan for 50 servings
  *   Lunch - Arrive no later than 11:30am, ready to serve at 12:00pm
  *   Dinner - Arrive no later than 5:00pm, ready to serve at 5:30pm
  *   We have plates, cups, serving utensils

Looking forward to seeing you soon!

Volunteer Coordinator
Ph: (513) 424-4673`,
        html: `<p>Thanks for signing up to serve a meal at Hope House Mission! We couldn't do what we do without the help of our volunteers. Together, we can help break the cycle of poverty and despair one life at a time.</p>
  <p>Below is the vital info you need to plan your meal:</p>
  <p><u>Women’s Shelter Meals</u></p>
  <ul>
  <li>1300 Girard Ave., Middletown Ohio</li>
  <li>513-217-5056</li>
  <li>Parking and entrance are around the back of the building</li>
  <li>Plan for 40 servings</li>
  <li>Lunch - Arrive no later than 11:30am, ready to serve at 12:00pm</li>
  <li>Dinner - Arrive no later than 5:00pm, ready to serve at 5:30pm</li>
  <li>We have plates, cups, serving utensils</li>
  </ul>
  <p><u>Men's Shelter Meals</u></p>
  <ul>
  <li>34 S. Main St., Middletown Ohio</li>
  <li>513-424-4673</li>
  <li>Parking is across the street at the Fifth Third Parking lot. The sign on the outside of the building reads "US Hotel." Items can be unloaded in the back of the building.</li>
  <li>Plan for 50 servings</li>
  <li>Lunch - Arrive no later than 11:30am, ready to serve at 12:00pm</li>
  <li>Dinner - Arrive no later than 5:00pm, ready to serve at 5:30pm</li>
  <li>We have plates, cups, serving utensils</li>
  </ul>
  <p>Looking forward to seeing you soon!</p>
  <p>Volunteer Coordinator<br />Ph: (513) 424-4673</p>`
    };

    return mailTransport.sendMail(mailOptions).then(() => {
        console.log('New welcome email sent to:', email);
    });
});
// [END sendWelcomeEmail]

// [START sendByeEmail]
/**
 * Send an account deleted email confirmation to users who delete their accounts.
 */
// [START onDeleteTrigger]
export const sendByeEmail = functions.auth.user()
    .onDelete((user) => {
        // [END onDeleteTrigger]
        const email = user.email;
        const displayName = user.displayName;

        const mailOptions = {
            from: `${APP_NAME} <noreply@firebase.com>`,
            to: email,
            subject: `Bye!`,
            text: `Farewell ${displayName || ''}!, We confirm that we have deleted your ${APP_NAME} account.`
        };

        return mailTransport.sendMail(mailOptions).then(() => {
            console.log('Account deletion confirmation email sent to:', email);
        });
    });
