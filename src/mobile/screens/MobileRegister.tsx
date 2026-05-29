/**
 * MobileRegister Screen
 *
 * Multi-step registration form for mobile
 * Step 1: Basic data (name, email, password)
 * Step 2: Document and contact (document type, number, phone)
 * Step 3: Profile and delegation (gender, birth date, country → state → filial)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRegisterForm } from '@/components/auth/hooks/useRegisterForm';
import { useLocationSelection } from '@/hooks/useLocationSelection';
import MobilePrivacyPolicyModal from '../components/MobilePrivacyPolicyModal';
import { usePrivacyPolicy } from '@/hooks/usePrivacyPolicy';
import { createRegisterSchema, type RegisterFormData } from '@/components/auth/types/form-types';

function MobileRegister() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    // Privacy Policy Hook
    const { latestPolicy, acceptPolicy } = usePrivacyPolicy();

    // Location Selection Hook (same approach as web)
    const {
        countries,
        states,
        branches,
        selectedCountry,
        selectedState,
        setSelectedCountry,
        setSelectedState,
        isLoading: loadingLocation,
        error: locationError,
    } = useLocationSelection('Brasil');

    const { handleSubmit: onSubmit, isSubmitting: isRegistering } = useRegisterForm();

    // Dynamically create schema with translations
    const schema = createRegisterSchema(t);

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            nome: '',
            email: '',
            ddi: '+55',
            telefone: '',
            password: '',
            confirmPassword: '',
            tipo_documento: 'CPF',
            numero_documento: '',
            genero: '' as any,
            data_nascimento: undefined,
            country: 'Brasil',
            state: '',
            branchId: '',
            acceptPrivacyPolicy: false as any,
        },
        mode: 'onChange',
    });

    // Sync form with location selection hook
    useEffect(() => {
        form.setValue('country', selectedCountry);
    }, [selectedCountry, form]);

    useEffect(() => {
        form.setValue('state', selectedState);
        form.setValue('branchId', ''); // Reset branch when state changes
    }, [selectedState, form]);

    // Watch form values
    const watchedCountry = form.watch('country');
    const tipoDocumento = form.watch('tipo_documento');

    // Update DDI based on country
    useEffect(() => {
        if (watchedCountry === 'Brasil') {
            form.setValue('ddi', '+55');
        }
    }, [watchedCountry, form]);

    const nextStep = async () => {
        let isValid = false;

        if (step === 1) {
            isValid = await form.trigger(['nome', 'email', 'password', 'confirmPassword']);
        } else if (step === 2) {
            isValid = await form.trigger(['tipo_documento', 'numero_documento', 'ddi', 'telefone']);
        }

        if (isValid) {
            setStep(step + 1);
        }
    };

    // Handlers for inputs
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
        form.setValue('telefone', value);
    };

    const handleDDIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^\d+]/g, '');
        if (!value.startsWith('+')) {
            value = '+' + value.replace(/\+/g, '');
        }
        if (value.length > 4) value = value.slice(0, 4);
        form.setValue('ddi', value);
    };

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const docType = form.getValues('tipo_documento');
        let value = e.target.value;

        if (docType === 'CPF') {
            // Only numbers, max 11 digits
            value = value.replace(/\D/g, '').slice(0, 11);
        } else if (docType === 'PASSAPORTE') {
            // Alphanumeric, uppercase, max 9 chars
            value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
        }

        form.setValue('numero_documento', value);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = e.target.value;
        setSelectedCountry(country);

        // Update document type based on country
        if (country === 'Brasil') {
            form.setValue('tipo_documento', 'CPF');
            form.setValue('ddi', '+55');
        } else {
            form.setValue('tipo_documento', 'PASSAPORTE');
        }
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const state = e.target.value;
        setSelectedState(state);
    };

    const handleFormSubmit = async (data: RegisterFormData) => {
        try {
            await onSubmit(data);

            // Record privacy acceptance if successful
            if (data.acceptPrivacyPolicy && latestPolicy) {
                acceptPolicy.mutate({
                    policyId: latestPolicy.id,
                    version: latestPolicy.versao_termo,
                    text: latestPolicy.texto
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 pt-12">
            {/* Header */}
            <div className="bg-green-800 text-white p-4 shadow-md">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => step === 1 ? navigate('/m/login') : prevStep()}
                        className="p-2 -ml-2 rounded-full hover:bg-white/10"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold">
                        {t('register.createAccount')} ({step}/3)
                    </h1>
                    <div className="w-10" />
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            {/* Form Content */}
            <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="flex-1 p-6 overflow-y-auto"
            >
                {/* Step 1: Dados Básicos */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-2">{t('register.step1')}</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('register.fullName')} *
                            </label>
                            <input
                                {...form.register('nome')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder={t('register.fullNamePlaceholder')}
                            />
                            {form.formState.errors.nome && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.nome.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('auth.email')} *
                            </label>
                            <input
                                {...form.register('email')}
                                type="email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder={t('auth.emailPlaceholder')}
                            />
                            {form.formState.errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('auth.password')} *
                            </label>
                            <input
                                {...form.register('password')}
                                type="password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder={t('auth.passwordPlaceholder')}
                            />
                            {form.formState.errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('auth.confirmPassword')} *
                            </label>
                            <input
                                {...form.register('confirmPassword')}
                                type="password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder={t('auth.passwordPlaceholder')}
                            />
                            {form.formState.errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Documento e Contato */}
                {step === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-2">{t('register.step2')}</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('register.documentType')} *
                            </label>
                            <select
                                {...form.register('tipo_documento')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="CPF">CPF</option>
                                <option value="PASSAPORTE">{t('register.passport')}</option>
                                <option value="OUTRO">{t('register.other')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {tipoDocumento === 'PASSAPORTE' ? t('register.passport') : t('register.documentNumber')} *
                            </label>
                            <input
                                value={form.watch('numero_documento')}
                                onChange={handleDocumentChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder={tipoDocumento === 'CPF' ? '00000000000' : 'A12345678'}
                                maxLength={tipoDocumento === 'CPF' ? 11 : 9}
                            />
                            {form.formState.errors.numero_documento && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.numero_documento.message}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <div className="w-24">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    DDI *
                                </label>
                                <input
                                    value={form.watch('ddi')}
                                    onChange={handleDDIChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="+55"
                                    maxLength={4}
                                />
                                {form.formState.errors.ddi && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {form.formState.errors.ddi.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('register.phone')} *
                                </label>
                                <input
                                    value={form.watch('telefone')}
                                    onChange={handlePhoneChange}
                                    type="tel"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="11999999999"
                                    maxLength={11}
                                />
                                {form.formState.errors.telefone && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {form.formState.errors.telefone.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Perfil e Delegação */}
                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-2">{t('register.step3')}</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('register.gender')} *
                            </label>
                            <select
                                {...form.register('genero')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="">{t('register.select')}</option>
                                <option value="Masculino">{t('register.male')}</option>
                                <option value="Feminino">{t('register.female')}</option>
                            </select>
                            {form.formState.errors.genero && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.genero.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('register.birthDate')} *
                            </label>
                            <input
                                {...form.register('data_nascimento', {
                                    setValueAs: (v) => (v ? new Date(v) : undefined),
                                })}
                                type="date"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                            {form.formState.errors.data_nascimento && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.data_nascimento.message}
                                </p>
                            )}
                        </div>

                        {/* Country Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('register.country')} *
                            </label>
                            <select
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                disabled={loadingLocation}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
                            >
                                {loadingLocation ? (
                                    <option value="">Carregando...</option>
                                ) : (
                                    countries.map((country) => (
                                        <option key={country} value={country}>
                                            {country}
                                        </option>
                                    ))
                                )}
                            </select>
                            {locationError && (
                                <p className="text-red-500 text-sm mt-1">
                                    Erro ao carregar países: {locationError.message}
                                </p>
                            )}
                        </div>

                        {/* State Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('register.state')} *
                            </label>
                            <select
                                value={selectedState}
                                onChange={handleStateChange}
                                disabled={loadingLocation || states.length === 0}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
                            >
                                <option value="">{t('register.selectState')}</option>
                                {states.map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </select>
                            {form.formState.errors.state && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.state.message}
                                </p>
                            )}
                        </div>

                        {/* Branch Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('register.branch')} *
                            </label>
                            <select
                                {...form.register('branchId')}
                                disabled={!selectedState || branches.length === 0}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">{t('register.selectBranch')}</option>
                                {branches.map((filial) => (
                                    <option key={filial.id} value={filial.id}>
                                        {filial.nome} - {filial.cidade}
                                    </option>
                                ))}
                            </select>
                            {form.formState.errors.branchId && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.branchId.message}
                                </p>
                            )}
                        </div>

                        {/* Privacy Policy Checkbox */}
                        <div className="flex items-start gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="privacy"
                                {...form.register('acceptPrivacyPolicy')}
                                className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                            />
                            <label htmlFor="privacy" className="text-sm text-gray-600">
                                {t('register.acceptTerms')}{' '}
                                <button
                                    type="button"
                                    onClick={() => setShowPrivacyModal(true)}
                                    className="text-green-800 underline"
                                >
                                    {t('register.privacyPolicy')}
                                </button>
                            </label>
                        </div>
                        {form.formState.errors.acceptPrivacyPolicy && (
                            <p className="text-red-500 text-sm mt-1">
                                {form.formState.errors.acceptPrivacyPolicy.message}
                            </p>
                        )}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 space-y-3">
                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="w-full py-3 bg-green-800 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-900 transition"
                        >
                            {t('register.next')}
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isRegistering}
                            className="w-full py-3 bg-green-800 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                            {isRegistering ? t('register.submitting') : t('register.submit')}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate('/m/login')}
                        className="w-full text-center text-sm text-green-800 font-medium"
                    >
                        {t('register.haveAccount')} <strong>{t('register.doLogin')}</strong>
                    </button>
                </div>
            </form>

            {/* Privacy Policy Modal */}
            <MobilePrivacyPolicyModal
                isOpen={showPrivacyModal}
                onClose={() => setShowPrivacyModal(false)}
            />
        </div>
    );
}

export default MobileRegister;
