import * as functions from 'firebase-functions';
import sgMail, { MailDataRequired } from '@sendgrid/mail';

type SendEmailOptions = Omit<MailDataRequired, 'from'> & {
  from?: MailDataRequired['from'];
  category?: string;
};

let isInitialized = false;

const getApiKey = (): string => {
  const fromEnv = process.env.SENDGRID_API_KEY;
  if (fromEnv) return fromEnv;

  const fromConfig = functions.config()?.sendgrid?.key;
  if (fromConfig) return fromConfig as string;

  throw new Error(
    'Missing SendGrid API key. Set SENDGRID_API_KEY environment variable or firebase functions:config:set sendgrid.key="YOUR_KEY".'
  );
};

const getDefaultFrom = () => {
  const email =
    process.env.SENDGRID_FROM_EMAIL ||
    (functions.config()?.sendgrid?.from_email as string | undefined);
  const name =
    process.env.SENDGRID_FROM_NAME ||
    (functions.config()?.sendgrid?.from_name as string | undefined);

  if (!email) {
    throw new Error(
      'Missing SendGrid sender email. Set SENDGRID_FROM_EMAIL or firebase functions:config:set sendgrid.from_email="you@example.com".'
    );
  }

  return name ? { email, name } : { email };
};

const ensureInitialized = () => {
  if (isInitialized) return;
  sgMail.setApiKey(getApiKey());
  isInitialized = true;
};

export const sendEmail = async (options: SendEmailOptions) => {
  ensureInitialized();

  const { category, ...rest } = options;
  const mail = {
    ...rest,
    from: rest.from ?? getDefaultFrom(),
  } as MailDataRequired;

  if (category) {
    const existing =
      (Array.isArray((rest as MailDataRequired).categories) &&
        ((rest as MailDataRequired).categories as string[])) ||
      [];
    mail.categories = [...existing, category];
  }

  try {
    await sgMail.send(mail);
  } catch (error) {
    functions.logger.error('Failed to send email via SendGrid', {
      error,
      to: mail.to,
      subject: mail.subject,
    });
    throw error;
  }
};
