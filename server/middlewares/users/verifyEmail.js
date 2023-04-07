const nodemailer = require("nodemailer");
const UserPreferece = require("../../models/UserPreference");
const EmailVerification = require("../../models/EmailVerification");
const { decryptData } = require("../../utils/encryption");

const BASE_URL = process.env.BASE_URL;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;

const sendVerificationEmail = async (req, res) => {
  const USER = decryptData(process.env.EMAIL);
  const PASS = decryptData(process.env.PASSWORD);
  const { email, name } = req.body;

  const verificationCode = Math.floor(10000 + Math.random() * 90000);
  const verificationLink = `${BASE_URL}/verify?code=${verificationCode}&email=${email}`;

  try {
    // transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: USER,
        pass: PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"SocialEcho" <${USER}>`,
      to: email,
      subject: "Verify your email address",
      html: `
      <div style="max-width: 600px; margin: auto; background-color: #F4F4F4; padding: 20px; border-radius: 10px; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #FFFFFF; padding: 20px; border-radius: 10px;">
    <img src="https://raw.githubusercontent.com/nz-m/SocialEcho/main/client/src/assets/SocialEcho.png" alt="SocialEcho Logo" style="display: block; margin: auto; margin-bottom: 20px; max-width: 60%;">
    <h2 style="font-size: 20px; margin-bottom: 15px; text-align: center; color: #3B82F6;">Verify Your Email Address</h2>
    <p style="font-size: 18px; margin-bottom: 20px; text-align: center; color: #4B5563;">Hi ${name},</p>
    <p style="font-size: 18px; margin-bottom: 20px; text-align: center; color: #4B5563;">Welcome to SocialEcho! Please click the button below to verify your email address and activate your account:</p>
    <div style="text-align: center; margin-bottom: 20px;">
      <a href="${verificationLink}" style="background-color: #3B82F6; color: #FFFFFF; padding: 14px 28px; border-radius: 5px; text-decoration: none; display: inline-block; font-size: 18px; font-weight: bold;">Verify Email Address</a>
    </div>
    <p style="font-size: 18px; margin-bottom: 20px; text-align: center; color: #4B5563;">Alternatively, you can copy and paste the following link in your browser:</p>
    <p style="font-size: 18px; margin-bottom: 20px; text-align: center; color: #4B5563;">${verificationLink}</p>
    <p style="font-size: 18px; margin-bottom: 20px; text-align: center; color: #6B7280;">The link will expire in 24 hours.</p>
    <p style="font-size: 20px; margin-bottom: 15px; text-align: center; color: #3B82F6;">Your verification code is: <strong>${verificationCode}</strong></p>
    <p style="font-size: 18px; margin-bottom: 20px; text-align: center; color: #4B5563;">If you did not create an account, please ignore this email.</p>
    </div>
    </div>`,
    });

    const newVerification = new EmailVerification({
      email,
      verificationCode,
      messageId: info.messageId,
    });

    await newVerification.save();

    console.log("Message sent: %s", info.messageId);
    res.status(200).json({
      message: `Verification email was successfully sent to ${email}`,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  sendVerificationEmail,
};
