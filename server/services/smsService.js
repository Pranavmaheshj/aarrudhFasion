const axios = require('axios');
const Notification = require('../models/Notification');

/**
 * Swappable SMS Service
 * Supported providers: 'console' (local default), 'twilio', 'msg91'
 */
const sendSMS = async ({ toMobile, message, order = null, user = null }) => {
  const provider = (process.env.SMS_PROVIDER || 'console').toLowerCase();
  let status = 'QUEUED';
  let providerResponse = null;

  // Sanitize 10-digit mobile number for Indian market
  let cleanMobile = toMobile.replace(/\D/g, '');
  if (cleanMobile.length === 10) {
    cleanMobile = `91${cleanMobile}`;
  }

  try {
    if (provider === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      // Twilio SMS
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_FROM;
      const twilioAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const twilioRes = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        new URLSearchParams({
          To: `+${cleanMobile}`,
          From: from,
          Body: message,
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${twilioAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      providerResponse = { sid: twilioRes.data.sid, status: twilioRes.data.status };
      status = 'SENT';
      console.log(`[SMS: Twilio] Sent successfully to +${cleanMobile}: ${message}`);
    } else if (provider === 'msg91' && process.env.MSG91_AUTH_KEY) {
      // MSG91 SMS
      const msg91Res = await axios.post(
        'https://control.msg91.com/api/v5/flow/',
        {
          template_id: process.env.MSG91_TEMPLATE_ID,
          short_url: '1',
          recipients: [{ mobiles: cleanMobile, message }],
        },
        {
          headers: {
            authkey: process.env.MSG91_AUTH_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      providerResponse = msg91Res.data;
      status = 'SENT';
      console.log(`[SMS: MSG91] Sent successfully to +${cleanMobile}: ${message}`);
    } else {
      // Console mock provider - perfect for development and demonstration
      status = 'SENT';
      providerResponse = {
        mock: true,
        sentAt: new Date().toISOString(),
        to: `+${cleanMobile}`,
        message,
      };
      console.log('\n================== [SMS DISPATCH NOTIFICATION] ==================');
      console.log(`To: +${cleanMobile}`);
      console.log(`Message: "${message}"`);
      console.log('==================================================================\n');
    }
  } catch (err) {
    status = 'FAILED';
    providerResponse = {
      error: err.response ? err.response.data : err.message,
    };
    console.error(`[SMS Error (${provider})] Failed to send to +${cleanMobile}:`, err.message);
  }

  // Persist attempt in Notification collection
  try {
    await Notification.create({
      user: user ? user._id || user : null,
      order: order ? order._id || order : null,
      channel: 'SMS',
      recipient: cleanMobile,
      message,
      status,
      provider,
      providerResponse,
    });
  } catch (dbErr) {
    console.error('[Notification DB Error] Failed to persist SMS log:', dbErr.message);
  }

  return { success: status === 'SENT', provider, status, providerResponse };
};

/**
 * Format and send shipment SMS
 */
const sendShipmentSMS = async ({ user, order, shipment }) => {
  const formattedDate = shipment.expectedDelivery
    ? new Date(shipment.expectedDelivery).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'within 3-5 days';

  const message = `Aarrudh Fashion: Your order #${order.orderNumber} is shipped via ${
    shipment.courier || 'Express Courier'
  }. Agent: ${shipment.agentName || 'Delivery Exec'} (${shipment.agentPhone || 'N/A'}). Tracking ID: ${
    shipment.trackingId || 'N/A'
  }. Expected delivery: ${formattedDate}. Track: ${shipment.trackingUrl || 'https://aarrudhfashion.com/orders'}`;

  const recipientMobile = (order.address && order.address.mobile) || (user && user.mobile);
  return await sendSMS({
    toMobile: recipientMobile,
    message,
    order,
    user,
  });
};

/**
 * Format and send order confirmation SMS
 */
const sendOrderConfirmationSMS = async ({ user, order }) => {
  const message = `Aarrudh Fashion: Thank you for shopping with us! Your order #${order.orderNumber} for ₹${order.amounts.total} has been confirmed. We are carefully preparing your designer ethnic set.`;
  const recipientMobile = (order.address && order.address.mobile) || (user && user.mobile);
  return await sendSMS({
    toMobile: recipientMobile,
    message,
    order,
    user,
  });
};

/**
 * Format and send delivery completion SMS
 */
const sendDeliveredSMS = async ({ user, order }) => {
  const message = `Aarrudh Fashion: Your order #${order.orderNumber} has been delivered. We hope you love your royal attire! Share your look with #AarrudhFashion.`;
  const recipientMobile = (order.address && order.address.mobile) || (user && user.mobile);
  return await sendSMS({
    toMobile: recipientMobile,
    message,
    order,
    user,
  });
};

module.exports = {
  sendSMS,
  sendShipmentSMS,
  sendOrderConfirmationSMS,
  sendDeliveredSMS,
};
