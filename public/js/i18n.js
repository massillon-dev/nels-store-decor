/* ==========================================================================
   NEL'S STORE & DECOR — Système bilingue Français / Kréyòl
   Traduit tout le texte statique du site public via des attributs data-i18n.
   Le contenu venant de la base de données (titres de photos, produits,
   témoignages saisis par l'administrateur) N'EST PAS traduit automatiquement
   — seul le "cadre" du site (menus, boutons, titres, formulaires) l'est.
   ========================================================================== */

const LANG_STORAGE_KEY = 'nels_lang';

const TRANSLATIONS = {
  fr: {
    // Navbar
    nav_home: 'Accueil', nav_about: 'À propos', nav_services: 'Services',
    nav_shop: 'Boutique', nav_gallery: 'Galerie', nav_realisations: 'Réalisations',
    nav_contact: 'Contact', nav_quote: 'Demander un devis',

    // Boutons génériques
    btn_discover: 'Découvrir nos créations', btn_quote: 'Demander un devis',
    btn_contact_us: 'Nous contacter', btn_see_creations: 'Voir nos créations',
    btn_learn_more: 'En savoir plus', btn_see_all_gallery: 'Voir toute la galerie',
    btn_send_message: 'Envoyer le message', btn_send_request: 'Envoyer ma demande',
    btn_confirm_order: 'Confirmer ma commande', btn_continue_shopping: 'Continuer mes achats',
    btn_add_to_cart: 'Ajouter au panier', btn_checkout: 'Passer la commande',
    btn_whatsapp: 'WhatsApp',

    // Accueil — héro
    home_eyebrow: "Nel's Store & Decor",
    home_hero_title: "L'art floral qui transforme vos moments en souvenirs.",
    home_hero_subtitle: 'Créations florales, décoration et arrangements personnalisés pour vos moments les plus précieux.',
    home_scroll: 'Découvrir',

    // Accueil — bienvenue
    home_welcome_eyebrow: 'Bienvenue',
    home_welcome_title: "Bienvenue chez Nel's Store & Decor",
    home_welcome_text: "Chez Nel's Store & Decor, chaque création est pensée pour raconter une histoire. Nous transformons les fleurs, les couleurs et les espaces en expériences uniques et mémorables.",
    home_creations_count_label: 'Créations florales',

    // Accueil — services
    home_services_eyebrow: 'Nos services',
    home_services_title: 'Une expertise florale, pour chaque occasion',
    svc1_title: 'Bouquets personnalisés', svc1_desc: "Création de bouquets adaptés à chaque occasion, dans le respect de vos goûts et de vos couleurs préférées.",
    svc2_title: 'Décoration de mariage', svc2_desc: "Décoration florale et mise en scène de mariages, de la cérémonie à la réception.",
    svc3_title: 'Décoration événementielle', svc3_desc: "Création d'ambiances florales sur mesure pour vos événements professionnels et privés.",
    svc4_title: 'Anniversaires & célébrations', svc4_desc: "Décoration personnalisée pour rendre chaque célébration réellement spéciale et mémorable.",
    svc5_title: 'Décoration intérieure', svc5_desc: "Compositions florales et arrangements élégants pour embellir durablement vos espaces.",
    svc6_title: 'Créations personnalisées', svc6_desc: "Des créations conçues sur mesure selon les besoins, les envies et le budget du client.",
    svc1_full_desc: "Création de bouquets adaptés à chaque occasion : anniversaire, romance, remerciement ou simple envie de faire plaisir. Nous choisissons les fleurs, les couleurs et le style selon vos goûts.",
    svc2_full_desc: "Décoration florale complète de votre mariage : cérémonie, allée, arche, table d'honneur, centres de table et bouquet de la mariée. Une mise en scène florale pensée dans les moindres détails.",
    svc3_full_desc: "Création d'ambiances florales pour vos événements professionnels ou privés : lancements de produits, galas, cocktails, conférences et célébrations d'entreprise.",
    svc4_full_desc: "Décoration personnalisée pour rendre chaque célébration spéciale : anniversaires, baby showers, fiançailles et retrouvailles familiales.",
    svc5_full_desc: "Compositions florales et arrangements durables pour embellir votre maison, votre bureau ou votre commerce, avec un entretien simple et un rendu élégant.",
    svc6_full_desc: "Vous avez une idée précise ou un thème particulier en tête ? Nous concevons des créations 100% sur mesure, adaptées à votre budget et à votre vision.",

    // Accueil — galerie/témoignages/CTA
    home_gallery_eyebrow: 'Galerie', home_gallery_title: 'Nos plus belles créations',
    home_testimonials_eyebrow: 'Témoignages', home_testimonials_title: 'Ce que disent nos clients',
    home_cta_title: 'Prêt à donner vie à votre projet floral ?',
    home_cta_text: 'Contactez-nous dès aujourd\'hui pour une décoration florale sur mesure.',
    showcase_eyebrow: 'Nos créations', showcase_title: 'Un aperçu de notre univers floral',

    // À propos
    about_hero_title: 'À propos de nous',
    about_hero_subtitle: "Une histoire de passion pour les fleurs, l'art et les moments qui comptent.",
    about_history_eyebrow: 'Notre histoire', about_history_title: 'Une passion devenue une signature',
    about_history_text1: "Nel's Store & Decor est né d'une passion sincère pour l'art floral et la décoration. Ce qui a commencé comme une envie de sublimer des instants précieux est devenu, avec le temps, une véritable signature créative reconnue pour son raffinement et son sens du détail.",
    about_history_text2: "Chaque création — qu'il s'agisse d'un bouquet, d'une décoration de mariage ou d'un aménagement floral d'intérieur — est pensée comme une œuvre unique, à l'image de la personne ou de l'événement qu'elle célèbre.",
    about_mission_eyebrow: 'Notre raison d\'être', about_mission_title: 'Mission & Vision',
    about_mission_h: 'Notre mission', about_mission_text: "Offrir à chaque client une expérience florale sur mesure, alliant créativité, qualité et service attentionné, pour transformer chaque occasion en souvenir durable.",
    about_vision_h: 'Notre vision', about_vision_text: "Devenir la référence incontournable de l'art floral et de la décoration événementielle, reconnue pour son élégance, son originalité et son excellence artistique.",
    about_engagement_h: 'Notre engagement', about_engagement_text: "Accompagner chaque client avec écoute et professionnalisme, du premier échange jusqu'à la réalisation finale de son projet floral.",
    about_values_eyebrow: 'Nos valeurs', about_values_title: 'Ce qui nous définit',
    val1_h: 'Créativité', val1_p: 'Des créations originales et uniques.',
    val2_h: 'Élégance', val2_p: 'Un style raffiné en toute circonstance.',
    val3_h: 'Qualité', val3_p: 'Des matériaux et fleurs sélectionnés avec soin.',
    val4_h: 'Passion', val4_p: 'Un amour sincère du métier et du détail.',
    val5_h: 'Personnalisation', val5_p: 'Chaque projet est unique, comme vous.',
    val6_h: 'Satisfaction client', val6_p: 'Votre bonheur est notre plus belle récompense.',
    about_cta_title: 'Envie de collaborer avec nous ?', about_cta_text: 'Parlons de votre projet floral dès aujourd\'hui.',

    // Services page
    services_hero_title: 'Nos services',
    services_hero_subtitle: 'Une expertise florale complète, pour sublimer chaque occasion de votre vie.',
    services_process_eyebrow: 'Notre méthode', services_process_title: 'Comment ça se passe ?',
    step1_h: '1. Échange', step1_p: 'Nous discutons de votre projet, vos envies et votre budget.',
    step2_h: '2. Proposition', step2_p: 'Nous vous envoyons une proposition détaillée et personnalisée.',
    step3_h: '3. Création', step3_p: 'Nos artisans donnent vie à votre projet avec soin et précision.',
    step4_h: '4. Livraison', step4_p: 'Installation ou livraison le jour J, selon vos besoins.',
    services_cta_title: 'Un projet en tête ?', services_cta_text: 'Obtenez une proposition personnalisée en quelques minutes.',

    // Galerie
    gallery_filter_all: 'Toutes',
    gallery_cta_title: 'Une création vous inspire ?', gallery_cta_text: 'Parlons de votre projet et donnons-lui vie ensemble.',

    // Réalisations
    realisations_empty: 'Aucune réalisation publiée pour le moment.',
    realisations_cta_title: 'Votre projet pourrait être le prochain',
    realisations_cta_text: 'Parlons-en et donnons-lui vie ensemble.',

    // Boutique
    shop_filter_all: 'Tous',
    shop_cta_title: 'Vous cherchez une création sur mesure ?',
    shop_cta_text: 'Nos produits prêts-à-offrir ne suffisent pas à votre projet ? Contactez-nous pour une proposition personnalisée.',
    shop_out_of_stock: 'Rupture de stock',

    // Contact
    contact_hero_title: 'Contactez-nous', contact_hero_subtitle: 'Une question, un projet ? Nous sommes à votre écoute.',
    contact_phone_h: 'Téléphone', contact_whatsapp_h: 'WhatsApp', contact_email_h: 'Email',
    contact_address_h: 'Adresse', contact_hours_h: 'Horaires',
    contact_form_title: 'Envoyez-nous un message', contact_form_subtitle: 'Remplissez le formulaire ci-dessous, nous vous répondrons dans les meilleurs délais.',
    lbl_fullname: 'Nom complet', lbl_phone: 'Téléphone', lbl_email: 'Email', lbl_subject: 'Sujet', lbl_message: 'Message',

    // Devis
    quote_hero_title: 'Demandez votre devis', quote_hero_subtitle: 'Parlez-nous de votre projet, nous vous répondrons avec une proposition personnalisée.',
    lbl_service_type: 'Type de prestation', lbl_event_date: "Date de l'événement", lbl_location: 'Lieu',
    lbl_guest_count: 'Nombre de personnes', lbl_budget: 'Budget approximatif', lbl_description: 'Description du projet',
    lbl_inspiration: "Photo d'inspiration (facultatif)",

    // Panier / commande
    cart_title: 'Votre panier', cart_empty: 'Votre panier est vide.', cart_total: 'Total',
    checkout_title: 'Finaliser ma commande', checkout_subtitle: 'Vérifiez votre panier et indiquez vos coordonnées. Nous vous contacterons rapidement pour confirmer et organiser le paiement et la livraison.',
    checkout_summary_title: 'Récapitulatif de votre panier',
    lbl_address: 'Adresse de livraison', lbl_delivery_date: 'Date de livraison souhaitée', lbl_notes: 'Remarques (optionnel)',
    checkout_success_title: 'Merci pour votre commande !',
    checkout_success_text: 'Nous avons bien reçu votre commande et vous contacterons très rapidement pour confirmer les détails, le paiement et la livraison.',

    // Footer
    footer_nav: 'Navigation', footer_contact: 'Contact', footer_need_info: 'Besoin d\'informations ?',
    footer_tagline: 'Art floral & décoration', footer_desc: "Nous transformons les fleurs, les couleurs et les espaces en expériences uniques et mémorables.",
    footer_rights: 'Tous droits réservés.',
    footer_contact_whatsapp_text: 'Contactez-nous directement sur WhatsApp, nous répondons rapidement.',
    wa_contact_title: 'Contactez-nous sur WhatsApp',
  },

  ht: {
    // Navbar
    nav_home: 'Akèy', nav_about: 'Konsènan nou', nav_services: 'Sèvis',
    nav_shop: 'Boutik', nav_gallery: 'Galri', nav_realisations: 'Reyalizasyon',
    nav_contact: 'Kontakte', nav_quote: 'Mande yon devi',

    // Boutons génériques
    btn_discover: 'Dekouvri kreyasyon nou yo', btn_quote: 'Mande yon devi',
    btn_contact_us: 'Kontakte nou', btn_see_creations: 'Gade kreyasyon nou yo',
    btn_learn_more: 'Aprann plis', btn_see_all_gallery: 'Gade tout galri a',
    btn_send_message: 'Voye mesaj la', btn_send_request: 'Voye demann mwen',
    btn_confirm_order: 'Konfime kòmann mwen', btn_continue_shopping: 'Kontinye achte',
    btn_add_to_cart: 'Mete nan panye', btn_checkout: 'Fè kòmann nan',
    btn_whatsapp: 'WhatsApp',

    // Accueil — héro
    home_eyebrow: "Nel's Store & Decor",
    home_hero_title: "Atizay flè ki tranfòme moman ou yo an bèl souvni.",
    home_hero_subtitle: 'Kreyasyon flè, dekorasyon ak aranjman pèsonalize pou moman ki pi presye pou ou yo.',
    home_scroll: 'Dekouvri',

    // Accueil — bienvenue
    home_welcome_eyebrow: 'Byenveni',
    home_welcome_title: "Byenveni lakay Nel's Store & Decor",
    home_welcome_text: "Lakay Nel's Store & Decor, chak kreyasyon fèt pou rakonte yon istwa. Nou tranfòme flè, koulè ak espas an eksperyans inik ak memorab.",
    home_creations_count_label: 'Kreyasyon flè',

    // Accueil — services
    home_services_eyebrow: 'Sèvis nou yo',
    home_services_title: 'Yon eksperyans nan flè, pou chak okazyon',
    svc1_title: 'Bouke pèsonalize', svc1_desc: "Kreyasyon bouke ki adapte ak chak okazyon, respektan gou ak koulè ou pi renmen yo.",
    svc2_title: 'Dekorasyon maryaj', svc2_desc: "Dekorasyon flè ak mizansèn maryaj, depi seremoni a jiska resepsyon an.",
    svc3_title: 'Dekorasyon evènman', svc3_desc: "Kreyasyon anbyans flè sou mezi pou evènman pwofesyonèl ak prive ou yo.",
    svc4_title: 'Anivèsè & selebrasyon', svc4_desc: "Dekorasyon pèsonalize pou fè chak selebrasyon vrèman espesyal ak memorab.",
    svc5_title: 'Dekorasyon enteryè', svc5_desc: "Konpozisyon flè ak aranjman elegan pou anbeli espas ou yo pou lontan.",
    svc6_title: 'Kreyasyon pèsonalize', svc6_desc: "Kreyasyon ki fèt sou mezi selon bezwen, anvi ak bidjè kliyan an.",
    svc1_full_desc: "Kreyasyon bouke ki adapte ak chak okazyon : anivèsè, womans, remèsiman oswa senpleman anvi fè plezi. Nou chwazi flè, koulè ak stil selon gou ou.",
    svc2_full_desc: "Dekorasyon flè konplè pou maryaj ou : seremoni, ale, ach, tab onè, sant tab ak bouke lamarye a. Yon mizansèn flè panse nan pi piti detay yo.",
    svc3_full_desc: "Kreyasyon anbyans flè pou evènman pwofesyonèl oswa prive ou yo : lansman pwodwi, gala, koktèl, konferans ak selebrasyon antrepriz.",
    svc4_full_desc: "Dekorasyon pèsonalize pou fè chak selebrasyon espesyal : anivèsè, baby shower, fiyansay ak rankont fanmi.",
    svc5_full_desc: "Konpozisyon flè ak aranjman ki dire lontan pou anbeli kay ou, biwo ou oswa komès ou, ak yon antretyen senp ak yon rezilta elegan.",
    svc6_full_desc: "Ou gen yon lide presi oswa yon tèm patikilye nan tèt ou? Nou konsevwa kreyasyon 100% sou mezi, adapte ak bidjè ak vizyon ou.",

    // Accueil — galerie/témoignages/CTA
    home_gallery_eyebrow: 'Galri', home_gallery_title: 'Pi bèl kreyasyon nou yo',
    home_testimonials_eyebrow: 'Temwayaj', home_testimonials_title: 'Sa kliyan nou yo di',
    home_cta_title: 'Pare pou ba pwojè flè ou a lavi?',
    home_cta_text: 'Kontakte nou jodi a pou yon dekorasyon flè sou mezi.',
    showcase_eyebrow: 'Kreyasyon nou yo', showcase_title: 'Yon apèsi sou inivè flè nou an',

    // À propos
    about_hero_title: 'Konsènan nou',
    about_hero_subtitle: "Yon istwa pasyon pou flè, atizay ak moman ki konte.",
    about_history_eyebrow: 'Istwa nou', about_history_title: 'Yon pasyon ki vin yon siyati',
    about_history_text1: "Nel's Store & Decor te fèt ak yon pasyon sensè pou atizay flè ak dekorasyon. Sa ki te kòmanse kòm yon anvi pou anbeli moman presye vin, avèk tan, yon vrè siyati kreyatif rekonèt pou rafinman ak souci pou detay li.",
    about_history_text2: "Chak kreyasyon — kit se yon bouke, yon dekorasyon maryaj oswa yon amenajman flè andedan — fèt kòm yon travay inik, ki reprezante moun oswa evènman li selebre a.",
    about_mission_eyebrow: 'Rezon dèt nou', about_mission_title: 'Misyon & Vizyon',
    about_mission_h: 'Misyon nou', about_mission_text: "Ofri chak kliyan yon eksperyans flè sou mezi, ki mele kreyativite, kalite ak yon sèvis atantif, pou tranfòme chak okazyon an yon bèl souvni k ap dire.",
    about_vision_h: 'Vizyon nou', about_vision_text: "Vin referans nimewo en nan atizay flè ak dekorasyon evènman, rekonèt pou eleganse, orijinalite ak ekselans atistik li.",
    about_engagement_h: 'Angajman nou', about_engagement_text: "Akonpaye chak kliyan avèk atansyon ak pwofesyonalis, depi premye kontak la jiska realizasyon final pwojè flè a.",
    about_values_eyebrow: 'Valè nou yo', about_values_title: 'Sa ki defini nou',
    val1_h: 'Kreyativite', val1_p: 'Kreyasyon orijinal ak inik.',
    val2_h: 'Eleganse', val2_p: 'Yon stil rafine nan tout sikonstans.',
    val3_h: 'Kalite', val3_p: 'Materyèl ak flè chwazi ak anpil swen.',
    val4_h: 'Pasyon', val4_p: 'Yon renmen sensè pou metye a ak detay yo.',
    val5_h: 'Pèsonalizasyon', val5_p: 'Chak pwojè inik, tankou ou menm.',
    val6_h: 'Satisfaksyon kliyan', val6_p: 'Kè kontan ou se pi bèl rekonpans nou.',
    about_cta_title: 'Ou ta renmen kolabore avèk nou?', about_cta_text: 'Ann pale de pwojè flè ou a jodi a.',

    // Services page
    services_hero_title: 'Sèvis nou yo',
    services_hero_subtitle: 'Yon eksperyans flè konplè, pou anbeli chak okazyon nan lavi ou.',
    services_process_eyebrow: 'Metòd nou', services_process_title: 'Kijan sa fonksyone?',
    step1_h: '1. Diskisyon', step1_p: 'Nou diskite sou pwojè ou, anvi ou ak bidjè ou.',
    step2_h: '2. Pwopozisyon', step2_p: 'Nou voye ba ou yon pwopozisyon detaye ak pèsonalize.',
    step3_h: '3. Kreyasyon', step3_p: 'Atizan nou yo ba pwojè ou lavi avèk swen ak presizyon.',
    step4_h: '4. Livrezon', step4_p: 'Enstalasyon oswa livrezon jou evènman an, selon bezwen ou.',
    services_cta_title: 'Ou gen yon pwojè nan tèt ou?', services_cta_text: 'Jwenn yon pwopozisyon pèsonalize nan kèk minit.',

    // Galerie
    gallery_filter_all: 'Tout',
    gallery_cta_title: 'Yon kreyasyon enspire ou?', gallery_cta_text: 'Ann pale de pwojè ou epi ba li lavi ansanm.',

    // Réalisations
    realisations_empty: 'Pa gen okenn reyalizasyon pibliye pou kounye a.',
    realisations_cta_title: 'Pwojè ou a ka pwochen an',
    realisations_cta_text: 'Ann pale de li e ba li lavi ansanm.',

    // Boutique
    shop_filter_all: 'Tout',
    shop_cta_title: 'W ap chèche yon kreyasyon sou mezi?',
    shop_cta_text: 'Pwodwi pare pou ofri nou yo pa sifi pou pwojè ou? Kontakte nou pou yon pwopozisyon pèsonalize.',
    shop_out_of_stock: 'Pa gen ankò',

    // Contact
    contact_hero_title: 'Kontakte nou', contact_hero_subtitle: 'Yon kesyon, yon pwojè? Nou la pou koute ou.',
    contact_phone_h: 'Telefòn', contact_whatsapp_h: 'WhatsApp', contact_email_h: 'Imèl',
    contact_address_h: 'Adrès', contact_hours_h: 'Orè',
    contact_form_title: 'Voye yon mesaj ba nou', contact_form_subtitle: 'Ranpli fòm ki anba a, n ap reponn ou nan pi bref delè.',
    lbl_fullname: 'Non konplè', lbl_phone: 'Telefòn', lbl_email: 'Imèl', lbl_subject: 'Sijè', lbl_message: 'Mesaj',

    // Devis
    quote_hero_title: 'Mande devi ou', quote_hero_subtitle: 'Pale nou de pwojè ou, n ap reponn ou ak yon pwopozisyon pèsonalize.',
    lbl_service_type: 'Kalite sèvis', lbl_event_date: "Dat evènman an", lbl_location: 'Kote',
    lbl_guest_count: 'Kantite moun', lbl_budget: 'Bidjè apeprè', lbl_description: 'Deskripsyon pwojè a',
    lbl_inspiration: "Foto enspirasyon (opsyonèl)",

    // Panier / commande
    cart_title: 'Panye ou', cart_empty: 'Panye ou vid.', cart_total: 'Total',
    checkout_title: 'Konplete kòmann mwen', checkout_subtitle: 'Verifye panye ou epi bay kowòdone ou. N ap kontakte ou rapid pou konfime ak òganize peman ak livrezon.',
    checkout_summary_title: 'Rezime panye ou',
    lbl_address: 'Adrès livrezon', lbl_delivery_date: 'Dat livrezon ou pito', lbl_notes: 'Remak (opsyonèl)',
    checkout_success_title: 'Mèsi pou kòmann ou!',
    checkout_success_text: 'Nou byen resevwa kòmann ou epi n ap kontakte ou byen vit pou konfime detay yo, peman an ak livrezon an.',

    // Footer
    footer_nav: 'Navigasyon', footer_contact: 'Kontak', footer_need_info: 'Bezwen enfòmasyon?',
    footer_tagline: 'Atizay flè & dekorasyon', footer_desc: "Nou tranfòme flè, koulè ak espas an eksperyans inik ak memorab.",
    footer_rights: 'Tout dwa rezève.',
    footer_contact_whatsapp_text: 'Kontakte nou dirèkteman sou WhatsApp, nou reponn rapid.',
    wa_contact_title: 'Kontakte nou sou WhatsApp',
  },
};

function getCurrentLang() {
  return localStorage.getItem(LANG_STORAGE_KEY) || 'fr';
}

function setLang(lang) {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  applyTranslations(lang);
  updateLangToggleUI(lang);
}

function t(key, lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  return dict[key] || TRANSLATIONS.fr[key] || key;
}

function applyTranslations(lang) {
  document.documentElement.lang = lang === 'ht' ? 'ht' : 'fr';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key, lang);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key, lang));
  });
}

function updateLangToggleUI(lang) {
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.textContent = lang === 'ht' ? 'FR' : 'HT';
    btn.title = lang === 'ht' ? 'Passer en français' : 'Chanje an kreyòl';
  });
}

function setupLangToggle() {
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = getCurrentLang() === 'ht' ? 'fr' : 'ht';
      setLang(next);
    });
  });
  updateLangToggleUI(getCurrentLang());
}

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations(getCurrentLang());
  setupLangToggle();
});
