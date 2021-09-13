import { chromium } from 'playwright';
import sendgrid from '@sendgrid/mail';
import streamToArray from 'stream-to-array';

const raizStatementsUrl = 'https://app.raizinvest.com.au/statements';

const raizUser = process.env.RAIZSIGHT_RAIZ_USER;
const raizPassword = process.env.RAIZSIGHT_RAIZ_PASSWORD;
const sender = process.env.RAIZSIGHT_SENDER;
const receiver = process.env.RAIZSIGHT_RECEIVER;

(async () => {
  const browser = await chromium.launch();

  const page = await browser.newPage({ acceptDownloads: true });

  // will redirect to login
  await page.goto(raizStatementsUrl);

  await page.fill('input[name="email"]', raizUser);
  await page.fill('input[name="password"]', raizPassword);
  await page.click('button[type="submit"]');

  // on successful login, redirected back to /statements

  // switch to Confirmation tab
  await page.click('button:has-text("Confirmation")');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click(':nth-match(button.statements-item__button:has-text("Download"), 1)'), // first download
  ]);

  const stream = await download.createReadStream();

  streamToArray(stream, (arrErr, arr) => {
    if (arrErr) {
      console.error(arrErr);
      process.exit(1);
    }

    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

    const content = Buffer.concat(arr).toString('base64');

    const mail = {
      from: sender,
      to: receiver,
      subject: 'Raiz Trade Confirmation',
      text: 'Raiz trade confirmation is attached.',
      attachments: [
        {
          filename: 'raiz-confirmation.pdf',
          contentType: 'application/pdf',
          content,
        },
      ],
    };

    sendgrid.send(mail, false, (sendErr, info) => {
      if (sendErr) {
        console.error(sendErr);
        process.exit(1);
      } else {
        console.log('SUCCESS');
        console.log(info);
        process.exit(0);
      }
    });
  });
})();
