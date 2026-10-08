const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const sendEmail = async ({ to, subject, html, user = null, order = null }) => {
  let status = 'QUEUED';
  let providerResponse = null;

  try {
    if (transporter) {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Aarrudh Fashion" <noreply@aarrudhfashion.com>',
        to,
        subject,
        html,
      });
      status = 'SENT';
      providerResponse = { messageId: info.messageId };
      console.log(`[Email] Sent to ${to}: ${subject}`);
    } else {
      status = 'SENT';
      providerResponse = { mock: true, sentAt: new Date().toISOString() };
      console.log(`[Email Console Mock] To: ${to} | Subject: "${subject}"`);
    }
  } catch (err) {
    status = 'FAILED';
    providerResponse = { error: err.message };
    console.error(`[Email Error] Failed to send email to ${to}:`, err.message);
  }

  try {
    await Notification.create({
      user: user ? user._id || user : null,
      order: order ? order._id || order : null,
      channel: 'EMAIL',
      recipient: to,
      message: `${subject} - ${html.slice(0, 200)}...`,
      status,
      provider: transporter ? 'nodemailer' : 'console',
      providerResponse,
    });
  } catch (dbErr) {
    console.error('[Notification DB Error] Failed to persist email log:', dbErr.message);
  }

  return { success: status === 'SENT' };
};

const sendShipmentEmail = async ({ user, order, shipment }) => {
  const subject = `Your Aarrudh Fashion Order #${order.orderNumber} has Shipped!`;
  const html = `
    <div style="font-family: 'Georgia', serif; color: #2B2B2B; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EADDC6; background: #FFF9EC;">
      <h2 style="color: #C2185B; border-bottom: 2px solid #B8860B; padding-bottom: 8px;">Aarrudh Fashion</h2>
      <p style="font-size: 16px;">Dear ${order.address.name},</p>
      <p>Good news! Your festive attire for order <strong>#${order.orderNumber}</strong> has been handed over to our delivery partner.</p>
      
      <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #EADDC6; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #B8860B;">Shipment Details:</h4>
        <p style="margin: 4px 0;"><strong>Courier:</strong> ${shipment.courier || 'Express Logistics'}</p>
        <p style="margin: 4px 0;"><strong>Delivery Agent:</strong> ${shipment.agentName || 'Assigned'} (${shipment.agentPhone || 'N/A'})</p>
        <p style="margin: 4px 0;"><strong>Tracking ID:</strong> ${shipment.trackingId || 'N/A'}</p>
        ${shipment.trackingUrl ? `<p style="margin: 4px 0;"><a href="${shipment.trackingUrl}" style="color: #C2185B; font-weight: bold;">Track Package Online</a></p>` : ''}
      </div>

      <p>Thank you for choosing Aarrudh Fashion Women's Boutique.</p>
    </div>
  `;

  return await sendEmail({
    to: (user && user.email) || 'customer@aarrudhfashion.com',
    subject,
    html,
    user,
    order,
  });
};

module.exports = {
  sendEmail,
  sendShipmentEmail,
};
