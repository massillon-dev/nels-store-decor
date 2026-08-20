// config/site.js
// Configuration centralisée de l'entreprise.
// TOUTES les informations (téléphones, WhatsApp, email, adresse, réseaux sociaux)
// proviennent du fichier .env. Ne jamais coder ces valeurs en dur ailleurs dans le projet :
// si un numéro change, il suffit de modifier le fichier .env.

require('dotenv').config();

function buildWhatsAppLink(number, message) {
  if (!number) return null;
  const cc = (process.env.WHATSAPP_COUNTRY_CODE || '').replace(/\D/g, '');
  const cleanNumber = String(number).replace(/\D/g, '');
  const fullNumber = cc && !cleanNumber.startsWith(cc) ? `${cc}${cleanNumber}` : cleanNumber;
  const text = encodeURIComponent(message || '');
  return `https://wa.me/${fullNumber}?text=${text}`;
}

// Formate un numéro pour l'affichage à l'écran, ex: "48035688" -> "(+509) 48035688"
function formatPhoneDisplay(number, countryCode) {
  if (!number) return '';
  const cc = String(countryCode || '').replace(/\D/g, '');
  return cc ? `(+${cc}) ${number}` : number;
}

// Formate un numéro pour un lien tel:, ex: "48035688" -> "+50948035688" (appel direct fonctionnel)
function formatPhoneTelLink(number, countryCode) {
  if (!number) return '';
  const cc = String(countryCode || '').replace(/\D/g, '');
  const clean = String(number).replace(/\D/g, '');
  return cc ? `+${cc}${clean}` : clean;
}

function getSiteConfig() {
  const whatsappMessage = process.env.WHATSAPP_DEFAULT_MESSAGE ||
    "Bonjour, je souhaiterais avoir plus d'informations concernant vos services.";
  const countryCode = process.env.WHATSAPP_COUNTRY_CODE || '509';

  return {
    businessName: process.env.BUSINESS_NAME || "Nel's Store & Decor",
    tagline: process.env.BUSINESS_TAGLINE || 'Art Floral & Décoration',

    phone1: process.env.PHONE_NUMBER_1 || '',
    phone2: process.env.PHONE_NUMBER_2 || '',
    // Versions prêtes à afficher, avec l'indicatif international, ex: "(+509) 48035688"
    phone1Display: formatPhoneDisplay(process.env.PHONE_NUMBER_1, countryCode),
    phone2Display: formatPhoneDisplay(process.env.PHONE_NUMBER_2, countryCode),
    // Versions pour les liens tel: (appel direct sur mobile), ex: "+50948035688"
    phone1Tel: formatPhoneTelLink(process.env.PHONE_NUMBER_1, countryCode),
    phone2Tel: formatPhoneTelLink(process.env.PHONE_NUMBER_2, countryCode),

    whatsapp1: process.env.WHATSAPP_NUMBER_1 || process.env.PHONE_NUMBER_1 || '',
    whatsapp2: process.env.WHATSAPP_NUMBER_2 || process.env.PHONE_NUMBER_2 || '',
    whatsappMessage,
    whatsappLink1: buildWhatsAppLink(process.env.WHATSAPP_NUMBER_1 || process.env.PHONE_NUMBER_1, whatsappMessage),
    whatsappLink2: buildWhatsAppLink(process.env.WHATSAPP_NUMBER_2 || process.env.PHONE_NUMBER_2, whatsappMessage),

    email: process.env.CONTACT_EMAIL || '',
    address: process.env.BUSINESS_ADDRESS || '',

    hoursWeekday: process.env.BUSINESS_HOURS_WEEKDAY || '',
    hoursSaturday: process.env.BUSINESS_HOURS_SATURDAY || '',
    hoursSunday: process.env.BUSINESS_HOURS_SUNDAY || '',

    social: {
      instagram: process.env.INSTAGRAM_URL || '',
      facebook: process.env.FACEBOOK_URL || '',
      tiktok: process.env.TIKTOK_URL || '',
      pinterest: process.env.PINTEREST_URL || '',
    },

    maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB || 5),
  };
}

module.exports = { getSiteConfig, buildWhatsAppLink };
