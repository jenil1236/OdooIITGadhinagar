import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOTP = async (to, otp) => {
  const htmlTemplate = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 30px;">
    <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
      
      <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔒 Password Reset OTP</h1>
      </div>

      <div style="padding: 25px; text-align: center;">
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333; margin: 0;">Here’s your One-Time Password (OTP) to reset your password:</p>

        <h2 style="font-size: 32px; letter-spacing: 4px; color: #4f46e5; margin: 20px 0;">${otp}</h2>

        <p style="font-size: 14px; color: #666;">This OTP is valid for <strong>10 minutes</strong>.  
        Please do not share this code with anyone.</p>

        <a href="#" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
      </div>

      <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} Your Company. All rights reserved.
      </div>

    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"Transit Flow" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP for Password Reset',
    html: htmlTemplate
  });
};



export const sendPassword = async (to, password) => {
  const htmlTemplate = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 30px;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
        
        <div style="background: linear-gradient(135deg, #16a34a, #22d3ee); padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔑 Your Account Password</h1>
        </div>

        <div style="padding: 25px; text-align: center;">
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333; margin: 0;">Here is your account password:</p>

          <h2 style="font-size: 28px; letter-spacing: 2px; color: #16a34a; margin: 20px 0;">${password}</h2>

          <p style="font-size: 14px; color: #666;">Please keep your password secure and do not share it with anyone.</p>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          © ${new Date().getFullYear()} Your Company. All rights reserved.
        </div>

      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Transit Flow" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Account Password',
    html: htmlTemplate
  });
};
