'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Loader2, ShieldCheck, ShieldAlert, X } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { User } from '@pizza-king/shared';
import { formatPhone } from './utils';
import { useDetectedCountry } from '@/lib/utils/countryDetection';

type Props = {
  user: User;
  isPasswordProvider: boolean;
  emailForm: {
    value: string;
    newEmail: string;
  };
  phoneForm: {
    phone: string;
    code: string;
    step: 'idle' | 'verify';
  };
  emailSaving: boolean;
  phoneSaving: boolean;
  onEmailFormChange: (updates: Partial<Props['emailForm']>) => void;
  onPhoneFormChange: (updates: Partial<Props['phoneForm']>) => void;
  onEmailUpdate: (event: FormEvent<HTMLFormElement>) => void;
  onSendEmailVerification: () => Promise<boolean>;
  onSendOtp: () => Promise<{ success: boolean; error?: string }>;
  onVerifyOtp: () => Promise<{ success: boolean; error?: string }>;
  emailVerified: boolean;
  phoneVerified: boolean;
};

export default function SecurityTab(props: Props) {
  const {
    user,
    isPasswordProvider,
    emailForm,
    phoneForm,
    phoneSaving,
    onPhoneFormChange,
    onSendEmailVerification,
    onSendOtp,
    onVerifyOtp,
    emailVerified,
    phoneVerified,
  } = props;
  const currentEmail = emailForm.value || user.email || 'Non renseignée';
  const currentPhone = formatPhone(user.phoneNumber ?? phoneForm.phone);
  const { country, detectedCountry, isDetecting } = useDetectedCountry();
  const [phoneInputKey, setPhoneInputKey] = useState(0);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneModalMode, setPhoneModalMode] = useState<'verify' | 'edit'>(
    'edit'
  );
  const [cooldown, setCooldown] = useState(0);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailSending, setEmailSending] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const prevStepRef = useRef(phoneForm.step);

  useEffect(() => {
    if (detectedCountry && !isDetecting) {
      setPhoneInputKey(prev => prev + 1);
    }
  }, [detectedCountry, isDetecting]);

  useEffect(() => {
    if (phoneVerified && phoneForm.step === 'idle') {
      setShowPhoneModal(false);
      setPhoneModalMode('edit');
    }
  }, [phoneVerified, phoneForm.step]);

  const handlePhoneSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPhoneError('');

    if (phoneForm.step === 'verify') {
      const result = await onVerifyOtp();
      if (result.success) {
        setCooldown(0);
        setPhoneError('');
        setShowPhoneModal(false);
      } else if (result.error) {
        setPhoneError(result.error);
      }
      return;
    }

    onPhoneFormChange({ code: '' });
    const result = await onSendOtp();
    if (result.success) {
      onPhoneFormChange({ step: 'verify' });
      setCooldown(24);
      setPhoneError('');
    } else {
      onPhoneFormChange({ step: 'idle' });
      if (result.error) {
        setPhoneError(result.error);
      }
    }
  };

  const handleOpenPhoneModal = (mode: 'verify' | 'edit') => {
    setPhoneModalMode(mode);
    setShowPhoneModal(true);
    setPhoneError('');
    const basePhone =
      mode === 'verify'
        ? user.phoneNumber ?? ''
        : phoneForm.phone || user.phoneNumber || '';
    onPhoneFormChange({
      phone: basePhone,
      code: '',
      step: 'idle',
    });
  };

  const handleClosePhoneModal = () => {
    setShowPhoneModal(false);
    setPhoneModalMode('edit');
    setCooldown(0);
    setPhoneError('');
    onPhoneFormChange({
      phone: user.phoneNumber ?? phoneForm.phone ?? '',
      code: '',
      step: 'idle',
    });
  };

  const disablePhoneInput =
    phoneModalMode === 'verify' && Boolean(user.phoneNumber);
  const verifyMode = phoneModalMode === 'verify';

  useEffect(() => {
    if (!showPhoneModal) {
      prevStepRef.current = phoneForm.step;
      return;
    }

    if (phoneForm.step === 'verify' && prevStepRef.current !== 'verify') {
      setCooldown(24);
    }

    if (phoneForm.step !== 'verify' && prevStepRef.current === 'verify') {
      setCooldown(0);
    }

    prevStepRef.current = phoneForm.step;
  }, [phoneForm.step, showPhoneModal]);

  useEffect(() => {
    if (!showPhoneModal || cooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [showPhoneModal, cooldown]);

  const handleResendCode = async () => {
    if (phoneSaving || cooldown > 0) return;
    setPhoneError('');
    onPhoneFormChange({ code: '', step: 'idle' });
    const result = await onSendOtp();
    if (result.success) {
      onPhoneFormChange({ step: 'verify' });
      setCooldown(24);
      setPhoneError('');
    } else {
      onPhoneFormChange({ step: 'idle' });
      if (result.error) {
        setPhoneError(result.error);
      }
    }
  };

  useEffect(() => {
    if (emailCooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setEmailCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [emailCooldown]);

  const handleSendEmailVerificationClick = async () => {
    if (emailSending || emailCooldown > 0) return;
    setEmailSending(true);
    const success = await onSendEmailVerification();
    if (success) {
      setEmailCooldown(24);
    }
    setEmailSending(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Email principal
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Accès & vérification
                </h2>
                <p className="text-sm text-gray-600">
                  Votre adresse email est le point d’entrée sécurisé de votre
                  compte Pizza&nbsp;King.
                </p>
              </div>
              <StatusBadge verified={emailVerified} />
            </div>

            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email actuel
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900 break-words">
                {currentEmail}
              </p>
            </div>

            {!emailVerified && (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-semibold text-orange-700">
                Votre adresse doit être vérifiée. Consultez votre boîte mail,
                puis confirmez pour synchroniser définitivement votre compte.
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className="text-xs text-gray-500">
                Pour toute mise à jour d’adresse, notre support valide l’opération et
                synchronise vos accès immédiatement.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {!emailVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-full border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:border-orange-300 hover:text-orange-700 sm:w-auto"
                    onClick={handleSendEmailVerificationClick}
                    disabled={emailSending || emailCooldown > 0}
                  >
                    {emailSending ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi en cours…
                      </span>
                    ) : emailCooldown > 0 ? (
                      <span>{`Renvoyer l'email (${emailCooldown}s)`}</span>
                    ) : (
                      "Envoyer l'email de vérification"
                    )}
                  </Button>
                )}
                <Button
                  type="button"
                  className="w-full rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 sm:w-auto"
                  onClick={() => setShowEmailModal(true)}
                >
                  Modifier mon adresse
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Vérification du téléphone
                </h2>
                <p className="text-sm text-gray-600">
                  Activez les codes SMS pour protéger l’accès à vos commandes et
                  accélérer la récupération de compte.
                </p>
                {isPasswordProvider && !user.phoneNumber && (
                  <p className="mt-3 rounded-2xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
                    Ajoutez un numéro pour faciliter vos futures commandes et
                    récupérer votre compte en cas d’oubli de mot de passe.
                  </p>
                )}
              </div>
              <StatusBadge verified={phoneVerified} />
            </div>

            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Numéro enregistré
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {currentPhone}
              </p>
            </div>

            {!phoneVerified && (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-semibold text-orange-700">
                Votre numéro n’est pas encore vérifié. Recevez un code par SMS,
                saisissez-le ici et nous mettrons à jour automatiquement votre
                profil et vos menus.
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className="text-xs text-gray-500">
                Utilisez un numéro actif pour recevoir vos confirmations de
                commande et codes de sécurité.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {!phoneVerified && user.phoneNumber ? (
                  <Button
                    type="button"
                    className="w-full rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-700 sm:w-auto"
                    onClick={() => handleOpenPhoneModal('verify')}
                  >
                    Vérifier mon numéro
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-600 sm:w-auto"
                  onClick={() => handleOpenPhoneModal('edit')}
                >
                  {user.phoneNumber ? 'Modifier mon numéro' : 'Ajouter un numéro'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SecurityModal
        open={showEmailModal}
        title="Modifier mon adresse email"
        description="Notre équipe support s’assure de la sécurité de chaque changement."
        onClose={() => setShowEmailModal(false)}
      >
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Pour mettre à jour votre adresse email, veuillez contacter le support
            Pizza&nbsp;King. Nous vérifierons votre identité puis actualiserons
            votre compte sans interruption de session.
          </p>
          <div className="rounded-2xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
            Email actuel&nbsp;: <span className="font-semibold text-gray-700">{currentEmail}</span>
          </div>
          <p>
            Vous pouvez nous joindre via le chat intégré ou par email à{' '}
            <a
              href="mailto:support@pizzaking.com"
              className="font-semibold text-orange-600 hover:underline"
            >
              support@pizzaking.com
            </a>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-300"
            onClick={() => setShowEmailModal(false)}
          >
            Fermer
          </Button>
        </div>
      </SecurityModal>

      <SecurityModal
        open={showPhoneModal}
        title={
          verifyMode ? 'Vérifier mon numéro' : 'Mettre à jour mon numéro'
        }
        description={
          verifyMode
            ? "Recevez un code SMS et confirmez votre numéro enregistré."
            : 'Saisissez un nouveau numéro puis validez-le par SMS.'
        }
        onClose={handleClosePhoneModal}
      >
        <form className="space-y-4" onSubmit={handlePhoneSubmit}>
          {phoneError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {phoneError}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {verifyMode ? 'Numéro enregistré' : 'Nouveau numéro de téléphone'}
            </label>
            {verifyMode || phoneForm.step === 'verify' ? (
              <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-900">
                {phoneForm.phone ? formatPhone(phoneForm.phone) : 'Numéro non renseigné'}
              </div>
            ) : (
              <PhoneInput
                key={phoneInputKey}
                international
                defaultCountry={country}
                value={phoneForm.phone || undefined}
                onChange={value => {
                  onPhoneFormChange({ phone: value ?? '' });
                  setPhoneError('');
                }}
                className="PhoneInput"
                numberInputProps={{
                  required: true,
                  inputMode: 'tel',
                  className:
                    'w-full rounded-2xl border border-gray-200 px-4 py-3 text-base shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20',
                }}
                countrySelectProps={{
                  className:
                    'rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-base shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20',
                }}
              />
            )}
            <p className="mt-2 text-xs text-gray-500">
              Ce numéro sera utilisé pour vos notifications de commande et la
              récupération de compte.
            </p>
          </div>

          {phoneForm.step === 'verify' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Code SMS
              </label>
              <input
                type="text"
                value={phoneForm.code}
                onChange={event => {
                  onPhoneFormChange({ code: event.target.value });
                  setPhoneError('');
                }}
                inputMode="numeric"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base uppercase tracking-widest shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="123456"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Le code expire après quelques minutes. Vous pouvez demander un
                nouvel envoi si nécessaire.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="submit"
              className="rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-700"
              disabled={
                phoneSaving ||
                (phoneForm.step === 'idle' && !(phoneForm.phone || '').trim()) ||
                (phoneForm.step === 'verify' && !(phoneForm.code || '').trim())
              }
            >
              {phoneSaving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {phoneForm.step === 'verify'
                    ? 'Vérification…'
                    : 'Envoi du code…'}
                </span>
              ) : phoneForm.step === 'verify' ? (
                'Confirmer le code'
              ) : (
                'Envoyer le code SMS'
              )}
            </Button>

            {phoneForm.step === 'verify' && (
              <Button
                type="button"
                variant="ghost"
                className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:cursor-not-allowed disabled:text-gray-400"
                onClick={handleResendCode}
                disabled={phoneSaving || cooldown > 0}
              >
                {cooldown > 0
                  ? `Renvoyer le code (${cooldown}s)`
                  : 'Renvoyer le code'}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              className="rounded-full border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-300"
              onClick={handleClosePhoneModal}
              disabled={phoneSaving}
            >
              Fermer
            </Button>
          </div>
        </form>
      </SecurityModal>
    </div>
  );
}

function StatusBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
        verified
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-orange-100 text-orange-700'
      }`}
    >
      {verified ? (
        <>
          <ShieldCheck className="h-4 w-4" />
          Vérifié
        </>
      ) : (
        <>
          <ShieldAlert className="h-4 w-4" />
          À vérifier
        </>
      )}
    </span>
  );
}

type SecurityModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
};

function SecurityModal({
  open,
  title,
  description,
  onClose,
  children,
}: SecurityModalProps) {
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
            <div className="pr-6">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description ? (
                <p className="mt-1 text-xs text-gray-500">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4 px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
