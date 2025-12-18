import { EmailTemplateData, EmailTemplate } from '../types/index.js';

export const generateEmailTemplate = ({
  userName,
  subscriptionName,
  renewalDate,
  planName,
  price,
  paymentMethod,
  accountSettingsLink = '#',
  supportLink = '#',
  daysLeft = 0,
}: EmailTemplateData): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.03); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%); padding: 12px 24px; border-radius: 50px; margin-bottom: 20px;">
                <span style="color: #fff; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">⏰ Renewal Reminder</span>
              </div>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 20px 0 10px; letter-spacing: -0.5px;">
                ${daysLeft === 1 ? 'Tomorrow is the day!' : `${daysLeft} Days Until Renewal`}
              </h1>
              <p style="color: rgba(255, 255, 255, 0.6); font-size: 16px; margin: 0;">
                Your subscription needs attention
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="color: rgba(255, 255, 255, 0.8); font-size: 16px; line-height: 1.6; margin: 0;">
                Hey <span style="color: #e94560; font-weight: 600;">${userName}</span> 👋
              </p>
              <p style="color: rgba(255, 255, 255, 0.6); font-size: 15px; line-height: 1.6; margin: 15px 0 0;">
                Just a friendly heads-up that your <strong style="color: #fff;">${subscriptionName}</strong> subscription is set to renew on <strong style="color: #e94560;">${renewalDate}</strong>.
              </p>
            </td>
          </tr>

          <!-- Subscription Card -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(233, 69, 96, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%); border-radius: 16px; border: 1px solid rgba(233, 69, 96, 0.2);">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                          <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Subscription</span>
                          <p style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 5px 0 0;">${planName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%">
                                <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Amount</span>
                                <p style="color: #e94560; font-size: 24px; font-weight: 700; margin: 5px 0 0;">${price}</p>
                              </td>
                              <td width="50%">
                                <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Payment</span>
                                <p style="color: #ffffff; font-size: 16px; font-weight: 500; margin: 5px 0 0;">${paymentMethod}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                          <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Renewal Date</span>
                          <p style="color: #ffffff; font-size: 16px; font-weight: 500; margin: 5px 0 0;">📅 ${renewalDate}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <a href="${accountSettingsLink}" style="display: inline-block; background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 10px 30px rgba(233, 69, 96, 0.3);">
                Manage Subscription →
              </a>
            </td>
          </tr>

          <!-- Help Section -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin: 0;">
                      Questions? We're here to help.<br>
                      <a href="${supportLink}" style="color: #e94560; text-decoration: none; font-weight: 500;">Contact Support</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
              <p style="color: rgba(255, 255, 255, 0.3); font-size: 12px; margin: 0 0 10px;">
                © 2024 Subscriptions. All rights reserved.
              </p>
              <p style="margin: 0;">
                <a href="#" style="color: rgba(255, 255, 255, 0.4); text-decoration: none; font-size: 12px; margin: 0 10px;">Unsubscribe</a>
                <a href="#" style="color: rgba(255, 255, 255, 0.4); text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy</a>
                <a href="#" style="color: rgba(255, 255, 255, 0.4); text-decoration: none; font-size: 12px; margin: 0 10px;">Terms</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const emailTemplates: EmailTemplate[] = [
  {
    label: '7 days before reminder',
    generateSubject: (data) =>
      `⏰ ${data.subscriptionName} renews in 7 days`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 7 }),
  },
  {
    label: '5 days before reminder',
    generateSubject: (data) =>
      `📅 5 days left - ${data.subscriptionName} renewal`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 5 }),
  },
  {
    label: '2 days before reminder',
    generateSubject: (data) =>
      `⚡ ${data.subscriptionName} renews in 2 days`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 2 }),
  },
  {
    label: '1 days before reminder',
    generateSubject: (data) =>
      `🔔 Final notice: ${data.subscriptionName} renews tomorrow!`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 1 }),
  },
];
