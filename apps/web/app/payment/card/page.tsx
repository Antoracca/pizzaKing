'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCartContext } from '@/providers/CartProvider';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';

// Composants pour les icônes de cartes
const VisaIcon = () => (
  <div className="relative h-full w-full bg-white rounded overflow-hidden flex items-center justify-center">
    <Image
      src="https://www.svgrepo.com/show/328144/visa.svg"
      alt="Visa"
      fill
      className="object-contain p-0.5"
      style={{ opacity: 1 }}
      unoptimized
    />
  </div>
);

const MastercardIcon = () => (
  <div className="relative h-full w-full bg-white rounded overflow-hidden flex items-center justify-center">
    <Image
      src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
      alt="Mastercard"
      fill
      className="object-contain p-0.5"
      style={{ opacity: 1 }}
      unoptimized
    />
  </div>
);

const AmexIcon = () => (
  <div className="relative h-full w-full bg-white rounded overflow-hidden flex items-center justify-center">
    <Image
      src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg"
      alt="American Express"
      fill
      className="object-contain p-0.5"
      style={{ opacity: 1 }}
      unoptimized
    />
  </div>
);

const GimacIcon = () => (
  <svg viewBox="0 0 48 32" className="h-full w-full">
    <rect width="48" height="32" rx="4" fill="#00A651" />
    <text x="24" y="20" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle">GIMAC</text>
  </svg>
);

// Types de cartes supportées avec leurs patterns de détection
const CARD_TYPES = [
  {
    id: 'visa',
    name: 'Visa',
    pattern: /^4/,
    lengths: [13, 16, 19],
    cvvLength: 3,
    icon: VisaIcon,
    color: 'from-blue-600 to-blue-700',
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    pattern: /^(5[1-5]|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)/,
    lengths: [16],
    cvvLength: 3,
    icon: MastercardIcon,
    color: 'from-orange-600 to-red-600',
  },
  {
    id: 'amex',
    name: 'American Express',
    pattern: /^3[47]/,
    lengths: [15],
    cvvLength: 4,
    icon: AmexIcon,
    color: 'from-teal-600 to-teal-700',
  },
  {
    id: 'gimac',
    name: 'GIMAC',
    pattern: /^9/,
    lengths: [16],
    cvvLength: 3,
    icon: GimacIcon,
    color: 'from-green-600 to-green-700',
  },
];

// Base de données des banques émettrices (BIN = 6 premiers chiffres)
interface BankIssuer {
  name: string;
  colorStart: string;
  colorEnd: string;
  bins: string[];
}

const BANK_ISSUERS: BankIssuer[] = [
  // Banques françaises
  {
    name: 'BNP Paribas',
    colorStart: '#00915A',
    colorEnd: '#007A4D',
    bins: ['497010', '497011', '497012', '484434', '484435', '522371', '522372'],
  },
  {
    name: 'Société Générale',
    colorStart: '#E60028',
    colorEnd: '#C20024',
    bins: ['520489', '545620', '545621', '440066', '491872', '491873'],
  },
  {
    name: 'Crédit Agricole',
    colorStart: '#00814A',
    colorEnd: '#006B3D',
    bins: ['498415', '498416', '498417', '444476', '434826', '434827'],
  },
  {
    name: 'LCL',
    colorStart: '#003D7A',
    colorEnd: '#002D5C',
    bins: ['532908', '532909', '489278', '489279'],
  },
  {
    name: 'Banque Populaire',
    colorStart: '#ED1C24',
    colorEnd: '#C81E23',
    bins: ['517562', '517563', '545301', '545302', '477923', '548747', '514287', '514288'],
  },
  {
    name: 'Caisse d\'Épargne',
    colorStart: '#D50032',
    colorEnd: '#B0002A',
    bins: ['484427', '484428', '522370', '522369'],
  },
  {
    name: 'Crédit Mutuel',
    colorStart: '#003B5C',
    colorEnd: '#002A42',
    bins: ['523401', '523402', '489282', '489283'],
  },
  {
    name: 'La Banque Postale',
    colorStart: '#FFD200',
    colorEnd: '#E6BC00',
    bins: ['491852', '491853', '535801', '535802'],
  },
  {
    name: 'Boursorama',
    colorStart: '#00B4CC',
    colorEnd: '#0098AD',
    bins: ['536765', '536766', '518397', '518398'],
  },
  {
    name: 'Hello Bank',
    colorStart: '#FF6F00',
    colorEnd: '#E66300',
    bins: ['545622', '545623'],
  },
  {
    name: 'Orange Bank',
    colorStart: '#FF7900',
    colorEnd: '#E66A00',
    bins: ['532948', '532949'],
  },
  {
    name: 'Fortuneo',
    colorStart: '#00A859',
    colorEnd: '#008F4C',
    bins: ['520490', '520491'],
  },
  {
    name: 'Monabanq',
    colorStart: '#E2001A',
    colorEnd: '#C00016',
    bins: ['534049', '534050'],
  },
  {
    name: 'N26',
    colorStart: '#36DECC',
    colorEnd: '#1FCBB8',
    bins: ['533441', '533442', '552426', '552427'],
  },
  {
    name: 'Revolut',
    colorStart: '#0075EB',
    colorEnd: '#0062C9',
    bins: ['536462', '536463', '524393', '524394'],
  },
  {
    name: 'Crédit du Nord',
    colorStart: '#CC0000',
    colorEnd: '#A80000',
    bins: ['491874', '491875'],
  },
  {
    name: 'CIC',
    colorStart: '#0057A0',
    colorEnd: '#004682',
    bins: ['535803', '535804', '489284', '489285'],
  },
  {
    name: 'HSBC France',
    colorStart: '#DB0011',
    colorEnd: '#B8000E',
    bins: ['406374', '406375', '457620', '457621'],
  },
  // Banques américaines
  {
    name: 'Chase Bank',
    colorStart: '#1E3A8A',
    colorEnd: '#1E40AF',
    bins: ['414720', '476173'],
  },
  {
    name: 'Bank of America',
    colorStart: '#B91C1C',
    colorEnd: '#991B1B',
    bins: ['480034', '480035'],
  },
  {
    name: 'Wells Fargo',
    colorStart: '#CA8A04',
    colorEnd: '#B45309',
    bins: ['471822', '471823'],
  },
  // Banques centrafricaines
  {
    name: 'Ecobank Centrafrique',
    colorStart: '#005EB8',
    colorEnd: '#004A94',
    bins: ['521478', '521479', '464114', '481448', '537856', '537857'],
  },
  {
    name: 'BGFIBANK Centrafrique',
    colorStart: '#FF6B00',
    colorEnd: '#E05D00',
    bins: ['520145', '520146', '535420', '535421'],
  },
  {
    name: 'Banque Populaire Maroco Centrafricaine (BPMC)',
    colorStart: '#E30613',
    colorEnd: '#C00510',
    bins: ['477923', '548747', '489267', '489268'],
  },
  {
    name: 'Société Générale Centrafrique',
    colorStart: '#E60028',
    colorEnd: '#C20024',
    bins: ['440067', '440068'],
  },
  {
    name: 'Commercial Bank Centrafrique (CBCA)',
    colorStart: '#006837',
    colorEnd: '#00522B',
    bins: ['418849', '418850'],
  },
  {
    name: 'Banque Internationale pour le Centrafrique (BICA)',
    colorStart: '#003DA5',
    colorEnd: '#002D7A',
    bins: ['522819', '522820'],
  },
  {
    name: 'Afriland First Bank Centrafrique',
    colorStart: '#00A550',
    colorEnd: '#008741',
    bins: ['520147', '520148'],
  },
  {
    name: 'Financial Bank Centrafrique',
    colorStart: '#1B75BB',
    colorEnd: '#155E96',
    bins: ['539982', '539981'],
  },
  {
    name: 'Banque Sahélo-Saharienne pour l\'Investissement et le Commerce (BSIC)',
    colorStart: '#0072BC',
    colorEnd: '#005A95',
    bins: ['535422', '535423'],
  },
  // Banques africaines (autres pays)
  {
    name: 'UBA (United Bank for Africa)',
    colorStart: '#DC2626',
    colorEnd: '#B91C1C',
    bins: ['539983', '539984', '446282', '446283'],
  },
  {
    name: 'Banque Atlantique',
    colorStart: '#00A859',
    colorEnd: '#008F4C',
    bins: ['521456', '521457', '489269', '489270'],
  },
  {
    name: 'Bank of Africa',
    colorStart: '#E31E24',
    colorEnd: '#C11A1F',
    bins: ['535424', '535425', '522821', '522822'],
  },
  {
    name: 'Orabank',
    colorStart: '#FF6600',
    colorEnd: '#E05500',
    bins: ['535426', '535427'],
  },
  {
    name: 'Coris Bank',
    colorStart: '#00A651',
    colorEnd: '#008741',
    bins: ['539985', '539986'],
  },
];

interface CardData {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}

interface CardErrors {
  number?: string;
  holder?: string;
  expiry?: string;
  cvv?: string;
}

export default function CardPaymentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { subtotal } = useCartContext();

  const [cardData, setCardData] = useState<CardData>({
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
  });

  const [errors, setErrors] = useState<CardErrors>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [detectedCardType, setDetectedCardType] = useState<typeof CARD_TYPES[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [detectedBank, setDetectedBank] = useState<BankIssuer | null>(null);

  // Détecter le type de carte automatiquement
  const detectCardType = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '');

    for (const cardType of CARD_TYPES) {
      if (cardType.pattern.test(cleaned)) {
        return cardType;
      }
    }
    return null;
  };

  // Détecter la banque émettrice à partir du BIN (6 premiers chiffres)
  const detectBankIssuer = (cardNumber: string): BankIssuer | null => {
    const cleaned = cardNumber.replace(/\s/g, '');

    // On a besoin d'au moins 6 chiffres pour le BIN
    if (cleaned.length < 6) {
      return null;
    }

    const bin = cleaned.substring(0, 6);

    for (const bank of BANK_ISSUERS) {
      if (bank.bins.includes(bin)) {
        return bank;
      }
    }

    return null;
  };

  // Formater le numéro de carte (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  // Formater la date d'expiration (MM/YY)
  const formatExpiry = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Gérer le changement du numéro de carte
  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    const cleaned = formatted.replace(/\s/g, '');

    if (cleaned.length <= 19) {
      setCardData({ ...cardData, number: formatted });
      const detected = detectCardType(formatted);
      setDetectedCardType(detected);

      // Détecter la banque émettrice
      const bank = detectBankIssuer(formatted);
      console.log('🔍 Détection banque:', {
        cardNumber: cleaned,
        bin: cleaned.substring(0, 6),
        bankDetected: bank?.name || 'Aucune',
      });
      setDetectedBank(bank);

      // Effacer l'erreur si présente
      if (errors.number) {
        setErrors({ ...errors, number: undefined });
      }
    }
  };

  // Gérer le changement de la date d'expiration
  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiry(value);
    const cleaned = formatted.replace(/\D/g, '');

    if (cleaned.length <= 4) {
      setCardData({ ...cardData, expiry: formatted });
      if (errors.expiry) {
        setErrors({ ...errors, expiry: undefined });
      }
    }
  };

  // Gérer le changement du CVV
  const handleCvvChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const maxLength = detectedCardType?.cvvLength || 3;

    if (cleaned.length <= maxLength) {
      setCardData({ ...cardData, cvv: cleaned });
      if (errors.cvv) {
        setErrors({ ...errors, cvv: undefined });
      }
    }
  };

  // Validation complète
  const validate = (): boolean => {
    const newErrors: CardErrors = {};
    const cleanedNumber = cardData.number.replace(/\s/g, '');

    // Validation du numéro de carte
    if (!cleanedNumber) {
      newErrors.number = 'Numéro de carte requis';
    } else if (!detectedCardType) {
      newErrors.number = 'Type de carte non reconnu';
    } else if (!detectedCardType.lengths.includes(cleanedNumber.length)) {
      newErrors.number = `Numéro invalide pour ${detectedCardType.name}`;
    } else if (!luhnCheck(cleanedNumber)) {
      newErrors.number = 'Numéro de carte invalide';
    }

    // Validation du titulaire
    if (!cardData.holder.trim()) {
      newErrors.holder = 'Nom du titulaire requis';
    } else if (cardData.holder.trim().length < 3) {
      newErrors.holder = 'Nom trop court';
    } else if (!/^[a-zA-Z\s]+$/.test(cardData.holder)) {
      newErrors.holder = 'Nom invalide (lettres uniquement)';
    }

    // Validation de la date d'expiration
    if (!cardData.expiry) {
      newErrors.expiry = 'Date d\'expiration requise';
    } else {
      const [month, year] = cardData.expiry.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (!month || !year || monthNum < 1 || monthNum > 12) {
        newErrors.expiry = 'Date invalide (MM/YY)';
      } else if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        newErrors.expiry = 'Carte expirée';
      }
    }

    // Validation du CVV
    const expectedCvvLength = detectedCardType?.cvvLength || 3;
    if (!cardData.cvv) {
      newErrors.cvv = 'CVV requis';
    } else if (cardData.cvv.length !== expectedCvvLength) {
      newErrors.cvv = `CVV doit contenir ${expectedCvvLength} chiffres`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Algorithme de Luhn pour valider le numéro de carte
  const luhnCheck = (cardNumber: string): boolean => {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  // Soumettre le paiement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsProcessing(true);

    // Simuler le traitement du paiement
    setTimeout(() => {
      console.log('Payment data:', {
        ...cardData,
        cardType: detectedCardType?.name,
      });

      // Rediriger vers la confirmation
      router.push('/checkout?step=3');
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Paiement par carte
            </h1>
            <p className="text-sm text-gray-600">
              Montant à payer: <strong>{subtotal + 1000} FCFA</strong>
            </p>
          </div>
        </div>

        {/* Layout Desktop: 2 colonnes / Mobile: 1 colonne */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Colonne gauche: Carte 3D avec flip animation (sticky sur desktop) */}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ perspective: '1000px' }}
            >
              <motion.div
                animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative h-48 sm:h-56"
              >
                {/* Face avant de la carte */}
                <div
                  className="absolute inset-0 rounded-2xl p-6 text-white shadow-2xl transition-all duration-300"
                  style={{
                    background: detectedBank
                      ? `linear-gradient(to bottom right, ${detectedBank.colorStart}, ${detectedBank.colorEnd})`
                      : detectedCardType?.color
                      ? `linear-gradient(to bottom right, ${detectedCardType.color.includes('blue') ? '#2563EB' : detectedCardType.color.includes('orange') ? '#EA580C' : detectedCardType.color.includes('teal') ? '#0D9488' : detectedCardType.color.includes('green') ? '#16A34A' : '#374151'}, ${detectedCardType.color.includes('blue') ? '#1D4ED8' : detectedCardType.color.includes('orange') ? '#C2410C' : detectedCardType.color.includes('teal') ? '#0F766E' : detectedCardType.color.includes('green') ? '#15803D' : '#1F2937'})`
                      : 'linear-gradient(to bottom right, #374151, #1F2937)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {/* Chip */}
                  <div className="mb-8 h-10 w-12 rounded bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-80" />

                  {/* Numéro de carte */}
                  <div className="mb-4 font-mono text-lg sm:text-xl tracking-widest">
                    {cardData.number || '•••• •••• •••• ••••'}
                  </div>

                  {/* Nom et date */}
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-white/60 uppercase mb-1">
                        Titulaire
                      </div>
                      <div className="font-medium text-sm sm:text-base uppercase">
                        {cardData.holder || 'VOTRE NOM'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/60 uppercase mb-1">
                        Expire
                      </div>
                      <div className="font-mono text-sm sm:text-base">
                        {cardData.expiry || 'MM/YY'}
                      </div>
                    </div>
                  </div>

                  {/* Logo du type de carte */}
                  {detectedCardType && (
                    <div className="absolute right-6 top-6 h-10 w-16 bg-white rounded p-1">
                      <detectedCardType.icon />
                    </div>
                  )}
                </div>

                {/* Face arrière de la carte */}
                <div
                  className="absolute inset-0 rounded-2xl text-white shadow-2xl transition-all duration-300"
                  style={{
                    background: detectedBank
                      ? `linear-gradient(to bottom right, ${detectedBank.colorStart}, ${detectedBank.colorEnd})`
                      : detectedCardType?.color
                      ? `linear-gradient(to bottom right, ${detectedCardType.color.includes('blue') ? '#2563EB' : detectedCardType.color.includes('orange') ? '#EA580C' : detectedCardType.color.includes('teal') ? '#0D9488' : detectedCardType.color.includes('green') ? '#16A34A' : '#374151'}, ${detectedCardType.color.includes('blue') ? '#1D4ED8' : detectedCardType.color.includes('orange') ? '#C2410C' : detectedCardType.color.includes('teal') ? '#0F766E' : detectedCardType.color.includes('green') ? '#15803D' : '#1F2937'})`
                      : 'linear-gradient(to bottom right, #374151, #1F2937)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {/* Bande magnétique */}
                  <div className="mt-6 h-12 w-full bg-gray-900" />

                  {/* Zone CVV */}
                  <div className="px-6 mt-6">
                    <div className="bg-white h-10 rounded flex items-center justify-end px-3">
                      <div className="text-gray-900 font-mono text-sm italic">
                        {cardData.cvv ? '•'.repeat(cardData.cvv.length) : 'CVV'}
                      </div>
                    </div>
                    <div className="text-[10px] text-white/80 mt-2 text-right">
                      Code de sécurité
                    </div>
                  </div>

                  {/* Logo du type de carte */}
                  {detectedCardType && (
                    <div className="absolute right-6 bottom-6 h-10 w-16 bg-white rounded p-1">
                      <detectedCardType.icon />
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Affichage de la banque émettrice si détectée */}
            {detectedBank && cardData.number.replace(/\s/g, '').length >= 6 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <div
                  className="rounded-xl border-2 p-4 shadow-lg"
                  style={{
                    background: `linear-gradient(to right, ${detectedBank.colorStart}, ${detectedBank.colorEnd})`,
                    borderColor: detectedBank.colorStart,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md">
                      <svg
                        className="h-6 w-6 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-white/80 uppercase tracking-wide">
                        Banque émettrice détectée
                      </div>
                      <div className="text-lg font-bold text-white">
                        {detectedBank.name}
                      </div>
                    </div>
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Colonne droite: Formulaire */}
          <Card className="border-0 shadow-lg lg:max-w-xl">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Types de cartes acceptées */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <span className="text-sm font-medium text-gray-700">
                    Cartes acceptées
                  </span>
                  <div className="flex items-center gap-2">
                    {CARD_TYPES.map((card) => {
                      const IconComponent = card.icon;
                      return (
                        <div
                          key={card.id}
                          className={`h-7 w-11 rounded border-2 transition-all ${
                            detectedCardType?.id === card.id
                              ? 'scale-110 border-orange-500 shadow-lg ring-2 ring-orange-200'
                              : 'border-gray-300 hover:scale-105'
                          }`}
                          title={card.name}
                          style={{ opacity: 1 }}
                        >
                          <IconComponent />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Numéro de carte */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Numéro de carte <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      onFocus={() => setFocusedField('number')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="1234 5678 9012 3456"
                      className={`w-full rounded-lg border-2 px-4 py-3 pl-12 font-mono text-base outline-none transition-all ${
                        errors.number
                          ? 'border-red-500 focus:border-red-500'
                          : focusedField === 'number'
                          ? 'border-orange-500 ring-4 ring-orange-500/10'
                          : 'border-gray-200 focus:border-orange-500'
                      }`}
                      disabled={isProcessing}
                    />
                    <CreditCard className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  </div>
                  {errors.number && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.number}
                    </p>
                  )}
                </div>

                {/* Nom du titulaire */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nom du titulaire <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardData.holder}
                    onChange={(e) =>
                      setCardData({ ...cardData, holder: e.target.value.toUpperCase() })
                    }
                    onFocus={() => setFocusedField('holder')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="JEAN DUPONT"
                    className={`w-full rounded-lg border-2 px-4 py-3 text-base uppercase outline-none transition-all ${
                      errors.holder
                        ? 'border-red-500 focus:border-red-500'
                        : focusedField === 'holder'
                        ? 'border-orange-500 ring-4 ring-orange-500/10'
                        : 'border-gray-200 focus:border-orange-500'
                    }`}
                    disabled={isProcessing}
                  />
                  {errors.holder && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.holder}
                    </p>
                  )}
                </div>

                {/* Date d'expiration et CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Expiration <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cardData.expiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      onFocus={() => setFocusedField('expiry')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="MM/YY"
                      className={`w-full rounded-lg border-2 px-4 py-3 font-mono text-base outline-none transition-all ${
                        errors.expiry
                          ? 'border-red-500 focus:border-red-500'
                          : focusedField === 'expiry'
                          ? 'border-orange-500 ring-4 ring-orange-500/10'
                          : 'border-gray-200 focus:border-orange-500'
                      }`}
                      disabled={isProcessing}
                    />
                    {errors.expiry && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errors.expiry}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      CVV <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cardData.cvv}
                      onChange={(e) => handleCvvChange(e.target.value)}
                      onFocus={() => {
                        setFocusedField('cvv');
                        setIsCardFlipped(true);
                      }}
                      onBlur={() => {
                        setFocusedField(null);
                        setIsCardFlipped(false);
                      }}
                      placeholder={detectedCardType?.id === 'amex' ? '1234' : '123'}
                      className={`w-full rounded-lg border-2 px-4 py-3 font-mono text-base outline-none transition-all ${
                        errors.cvv
                          ? 'border-red-500 focus:border-red-500'
                          : focusedField === 'cvv'
                          ? 'border-orange-500 ring-4 ring-orange-500/10'
                          : 'border-gray-200 focus:border-orange-500'
                      }`}
                      disabled={isProcessing}
                    />
                    {errors.cvv && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errors.cvv}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sécurité */}
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-center gap-2 text-sm text-green-900">
                    <Lock className="h-4 w-4" />
                    <span className="font-medium">Paiement 100% sécurisé</span>
                  </div>
                  <p className="mt-1 text-xs text-green-800">
                    Vos données sont cryptées et ne sont jamais stockées
                  </p>
                </div>

                {/* Bouton de soumission */}
                <Button
                  type="submit"
                  className="h-12 w-full text-base font-semibold"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Payer {subtotal + 1000} FCFA
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
