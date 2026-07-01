export const buildWelcomeEmail = (options: {
  firstName?: string;
}): { subject: string; html: string; text: string } => {
  const { firstName } = options;
  const recipientName = firstName?.trim() || 'cher client Pizza King';

  const subject = 'Bienvenue chez Pizza King 🍕';

  const html = `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; }
      .wrapper { background-color: #f7f7f7; padding: 40px 0; }
      .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #ff6b00, #ff9500); color: #fff; padding: 32px 32px 24px; text-align: center; }
      .title { margin: 12px 0 8px; font-size: 28px; font-weight: 700; }
      .subtitle { margin: 0; font-size: 16px; opacity: 0.9; }
      .content { padding: 32px; color: #333333; line-height: 1.6; font-size: 16px; }
      .cta { display: inline-block; margin-top: 24px; padding: 14px 28px; background-color: #ff6b00; color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; }
      .cta:hover { background-color: #ff7f1a; }
      .pill { display: inline-block; background: rgba(255, 107, 0, 0.1); color: #ff6b00; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; }
      .highlights { margin: 28px 0; padding: 0; list-style: none; }
      .highlight-item { display: flex; gap: 12px; margin-bottom: 16px; }
      .highlight-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(255, 107, 0, 0.1); color: #ff6b00; display: flex; align-items: center; justify-content: center; font-size: 18px; }
      .footer { padding: 24px 32px 32px; background: #fafafa; font-size: 13px; color: #6b7280; text-align: center; }
      .socials { margin-top: 16px; }
      .social-link { margin: 0 6px; text-decoration: none; color: #ff6b00; font-weight: 600; }
      @media (max-width: 600px) {
        .container { margin: 0 16px; }
        .content { padding: 24px; }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <div style="font-size: 42px;">🍕</div>
          <p class="pill">Bienvenue parmi les rois de la pizza</p>
          <h1 class="title">Bienvenue ${recipientName} !</h1>
          <p class="subtitle">Ta meilleure expérience pizza commence maintenant.</p>
        </div>
        <div class="content">
          <p>Nous sommes ravis de t'accueillir dans la famille Pizza King. À partir de maintenant, tu profites de nos recettes signature, de promos exclusives et d'un suivi de livraison aux petits oignons.</p>
          <p>Voici comment débuter :</p>
          <ul class="highlights">
            <li class="highlight-item">
              <div class="highlight-icon">🎁</div>
              <div>
                <strong>10% de réduction</strong><br />
                Utilise le code <strong>WELCOME10</strong> sur ta première commande.
              </div>
            </li>
            <li class="highlight-item">
              <div class="highlight-icon">🔥</div>
              <div>
                <strong>Nouveautés chaque semaine</strong><br />
                Découvre nos pizzas saisonnières et offres flash.
              </div>
            </li>
            <li class="highlight-item">
              <div class="highlight-icon">⭐</div>
              <div>
                <strong>Programme fidélité</strong><br />
                Cumule des points à chaque commande pour débloquer des surprises.
              </div>
            </li>
          </ul>
          <p>Tu peux gérer ton profil, ajouter tes adresses préférées et suivre tes commandes directement depuis ton espace client.</p>
          <p style="text-align: center;">
            <a href="{{WEB_APP_URL}}/menu" class="cta">Explorer le menu</a>
          </p>
          <p style="margin-top: 24px;">Si tu as la moindre question, notre service client est disponible dans la rubrique support ou par email à <a href="mailto:support@pizzaking.com" style="color: #ff6b00; text-decoration: none;">support@pizzaking.com</a>.</p>
          <p>À très vite autour d'une pizza,<br /><strong>L'équipe Pizza King</strong></p>
        </div>
        <div class="footer">
          <p>Pizza King · Livraison de pizzas premium</p>
          <div class="socials">
            <a href="https://www.instagram.com" class="social-link">Instagram</a> ·
            <a href="https://www.facebook.com" class="social-link">Facebook</a> ·
            <a href="https://www.tiktok.com" class="social-link">TikTok</a>
          </div>
          <p style="margin-top: 16px;">
            Tu reçois cet email suite à ton inscription.<br />
            <a href="{{WEB_APP_URL}}/account" style="color: #ff6b00; text-decoration: none;">Gérer mes préférences</a>
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim();

  const text = [
    `Bienvenue ${recipientName} !`,
    '',
    "Nous sommes ravis de t'accueillir chez Pizza King. Profite de 10% de réduction avec le code WELCOME10 sur ta première commande.",
    'Découvre nos nouveautés, cumule des points fidélité et suis tes commandes depuis ton espace client.',
    '',
    'Pour commander : {{WEB_APP_URL}}/menu',
    '',
    'Besoin d’aide ? support@pizzaking.com',
    '',
    "À très vite autour d'une pizza,",
    "L'équipe Pizza King",
  ].join('\n');

  return { subject, html, text };
};
