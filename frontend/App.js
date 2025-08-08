import { useState, useMemo, useEffect } from 'react';
import { Check, CreditCard, Rocket, Scale, FileText, Database, Shield, Globe, HeartPulse, Award, MessageSquare, Briefcase, TrendingUp, Mail, Code, Wallet, Zap, Gift, Smartphone } from 'lucide-react';

const pricing = {
  'social-media-management': {
    name: 'Social Media Management',
    description: 'Creation and scheduling of engaging content. Select your platforms below.',
    icon: MessageSquare,
    options: [
      { id: 'facebook-instagram', name: 'Facebook & Instagram', onceOff: 2500, monthly: 1500 },
      { id: 'tiktok', name: 'TikTok', onceOff: 1500, monthly: 1000 },
      { id: 'linkedin', name: 'LinkedIn', onceOff: 2000, monthly: 1200 },
      { id: 'twitter-x', name: 'Twitter (X)', onceOff: 1800, monthly: 1100 },
    ],
  },
  'seo-optimization': {
    name: 'SEO Optimization',
    description: 'Improving your search engine rankings for visibility.',
    icon: TrendingUp,
    options: [{ id: 'standard-seo', name: 'Standard SEO Package', onceOff: 9000, monthly: 4500 }],
  },
  'content-creation': {
    name: 'Content Creation',
    description: 'High-quality blog posts, articles, and visuals.',
    icon: FileText,
    options: [{ id: 'standard-content', name: 'Standard Content Package', onceOff: 7200, monthly: 3600 }],
  },
  'email-marketing': {
    name: 'Email Marketing',
    description: 'Designing and executing effective email campaigns.',
    icon: Mail,
    options: [{ id: 'standard-email', name: 'Standard Email Package', onceOff: 4600, monthly: 2300 }],
  },
  'web-design-development': {
    name: 'Web Design and Development',
    description: 'Custom website creation, from design to launch and beyond.',
    icon: Code,
    options: [
      { id: 'basic-website', name: '3-5 Page Basic Website', onceOff: 15000, monthly: 3500 },
      { id: 'bespoke-website', name: 'Bespoke/Complex Website', onceOff: 0, monthly: 0, isBespoke: true },
    ],
  },
  'company-compliance': {
    name: 'Company Registration & Compliance',
    description: 'Achieve and maintain regulatory compliance in South Africa. Select required areas below.',
    icon: Briefcase,
    options: [
      { id: 'legal-compliance', name: 'Legal Compliance (CIPC)', onceOff: 3000, monthly: 1000, icon: Scale },
      { id: 'fica-compliance', name: 'Financial Compliance (FICA)', onceOff: 4000, monthly: 1500, icon: CreditCard },
      { id: 'popia-compliance', name: 'Data Protection (POPIA)', onceOff: 3500, monthly: 1200, icon: Shield },
      { id: 'paia-compliance', name: 'Access to Information (PAIA)', onceOff: 2500, monthly: 800, icon: Database },
      { id: 'environmental-compliance', name: 'Environmental Compliance', onceOff: 5000, monthly: 1800, icon: Globe },
      { id: 'health-safety-compliance', name: 'Health & Safety Compliance', onceOff: 4500, monthly: 1600, icon: HeartPulse },
      { id: 'bbbee-compliance', name: 'BBEEE Compliance', onceOff: 6000, monthly: 2000, icon: Award },
    ],
  },
};

const bbtGateways = [
  { id: 'stripe', name: 'Credit/Debit Card', icon: CreditCard },
];

const genZGateways = [
  { id: 'ozow', name: 'Instant EFT (Ozow)', icon: Zap },
  { id: 'payfast', name: 'Instant EFT (Payfast)', icon: Wallet },
  { id: 'payflex', name: 'Payflex (BNPL)', icon: Gift },
  { id: 'apple-pay', name: 'Apple Pay', icon: Smartphone },
  { id: 'google-pay', name: 'Google Pay', icon: Smartphone },
];

const App = () => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isUltimatePackage, setIsUltimatePackage] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedService, setExpandedService] = useState(null);
  
  const [currency, setCurrency] = useState('ZAR');
  const [currencySymbol, setCurrencySymbol] = useState('R');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [selectedGateway, setSelectedGateway] = useState('stripe');
  const [expandedGatewayCategory, setExpandedGatewayCategory] = useState('bbt');

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const detectedCurrency = data.currency || 'ZAR';
        const detectedSymbol = data.currency_symbol || 'R';
        setCurrency(detectedCurrency);
        setCurrencySymbol(detectedSymbol);
      } catch (error) {
        console.error('Failed to fetch location:', error);
      }
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (currency === 'ZAR') {
        setExchangeRate(1);
        return;
      }
      try {
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/ZAR`);
        const data = await res.json();
        if (data.rates && data.rates[currency]) {
          setExchangeRate(data.rates[currency]);
        } else {
          setExchangeRate(1);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        setExchangeRate(1);
      }
    };
    fetchExchangeRate();
  }, [currency]);


  const toggleOption = (serviceKey, optionId, paymentType) => {
    if (isUltimatePackage) return;
    setSelectedOptions(prev => {
      const currentServiceSelections = prev[serviceKey] || {};
      const currentOptionSelections = currentServiceSelections[optionId] || {};
      const newSelection = { ...currentOptionSelections, [paymentType]: !currentOptionSelections[paymentType] };
      if (!newSelection.onceOff && !newSelection.monthly) {
        const { [optionId]: _, ...rest } = currentServiceSelections;
        return { ...prev, [serviceKey]: rest };
      }
      return {
        ...prev,
        [serviceKey]: { ...currentServiceSelections, [optionId]: newSelection },
      };
    });
  };

  const calculateTotal = (paymentType) => {
    let total = 0;
    const servicesToCount = isUltimatePackage ? Object.keys(pricing) : Object.keys(selectedOptions);

    servicesToCount.forEach(serviceKey => {
      const optionsToCount = isUltimatePackage ? pricing[serviceKey].options : pricing[serviceKey].options.filter(o => selectedOptions[serviceKey]?.[o.id]?.[paymentType]);
      
      optionsToCount.forEach(option => {
        if (!option.isBespoke) {
          total += option[paymentType];
        }
      });
    });

    if (isUltimatePackage) {
      return total * 0.8;
    }
    return total;
  };

  const onceOffTotal = useMemo(() => calculateTotal('onceOff'), [selectedOptions, isUltimatePackage]);
  const monthlyTotal = useMemo(() => calculateTotal('monthly'), [selectedOptions, isUltimatePackage]);

  const onceOffConverted = useMemo(() => Math.round(onceOffTotal * exchangeRate), [onceOffTotal, exchangeRate]);
  const monthlyConverted = useMemo(() => Math.round(monthlyTotal * exchangeRate), [monthlyTotal, exchangeRate]);

  const handleUltimatePackage = () => {
    setIsUltimatePackage(prev => {
      if (!prev) {
        const allServicesSelected = {};
        Object.keys(pricing).forEach(serviceKey => {
          const optionsSelected = {};
          pricing[serviceKey].options.forEach(option => {
            if (!option.isBespoke) {
              optionsSelected[option.id] = { onceOff: true, monthly: true };
            }
          });
          allServicesSelected[serviceKey] = optionsSelected;
        });
        setSelectedOptions(allServicesSelected);
        setExpandedService(null);
      } else {
        setSelectedOptions({});
      }
      return !prev;
    });
  };

  const handlePayment = async () => {
    setIsPaymentProcessing(true);
    setMessage('');
    
    let hasBespokeSelected = false;
    Object.keys(selectedOptions).forEach(serviceKey => {
      if (selectedOptions[serviceKey]) {
        Object.keys(selectedOptions[serviceKey]).forEach(optionId => {
          const option = pricing[serviceKey].options.find(o => o.id === optionId);
          if (option?.isBespoke) {
            hasBespokeSelected = true;
          }
        });
      }
    });

    if (hasBespokeSelected) {
      setMessage('You have selected a bespoke service. Please contact us for a custom quote!');
      setIsPaymentProcessing(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4242/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onceOffTotal,
          monthlyTotal,
          gateway: selectedGateway,
          currency,
        }),
      });

      const sessionIds = await response.json();
      if (response.ok) {
        // Handle Stripe's separate once-off and monthly sessions
        if (selectedGateway === 'stripe' && sessionIds.onceOff && sessionIds.monthly) {
          setMessage(`Please complete two payments. Redirecting you to the once-off payment...`);
          window.location.href = `https://checkout.stripe.com/pay/${sessionIds.onceOff}`;
        } else if (selectedGateway === 'stripe' && sessionIds.onceOff) {
          window.location.href = `https://checkout.stripe.com/pay/${sessionIds.onceOff}`;
        } else if (selectedGateway === 'stripe' && sessionIds.monthly) {
          window.location.href = `https://checkout.stripe.com/pay/${sessionIds.monthly}`;
        } else if (sessionIds.combined) {
          setMessage(`Redirecting you to ${selectedGateway} to complete your payment...`);
          window.location.href = sessionIds.combined;
        } else {
          setMessage('Something went wrong. No payment session was created.');
        }
      } else {
        setMessage(sessionIds.error || 'Failed to create a payment session. Please try again.');
      }
    } catch (error) {
      console.error('Error during payment process:', error);
      setMessage('An error occurred during payment. Please try again.');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const isCheckoutDisabled = onceOffTotal === 0 && monthlyTotal === 0 || isPaymentProcessing;

  const getCurrencyDisplay = (amount) => {
    return `${currencySymbol}${Math.round(amount * exchangeRate)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans p-4 flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto my-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300">
        <header className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">DigiSoal</h1>
          <p className="mt-2 text-lg opacity-90">Digital Solutions for Your Business</p>
        </header>

        <main className="p-8 md:p-12">
          <section className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Build Your Custom DSaaS Package</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Select the services and platforms you need below to create a bespoke solution. Prices are shown in {currency}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(pricing).map((serviceKey) => {
              const service = pricing[serviceKey];
              const isExpanded = expandedService === serviceKey;
              const ServiceIcon = service.icon;
              return (
                <div
                  key={serviceKey}
                  className={`border-2 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:scale-105'
                  } ${isUltimatePackage ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div
                    className="p-6 flex items-center justify-between"
                    onClick={() => setExpandedService(isExpanded ? null : serviceKey)}
                  >
                    <div className="flex items-center space-x-4">
                      <ServiceIcon className="text-indigo-500 w-8 h-8 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 pt-0 ${isExpanded ? 'block' : 'hidden'}`}>
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                      {service.options.map(option => (
                        <div key={option.id} className="mt-4 p-4 border rounded-xl bg-white dark:bg-gray-900">
                          <div className="flex items-center space-x-3 mb-2">
                            {option.icon && (
                              <option.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            )}
                            <p className="font-semibold text-gray-900 dark:text-white">{option.name}</p>
                          </div>
                          {option.isBespoke ? (
                            <div className="text-center p-3 bg-fuchsia-100 dark:bg-fuchsia-900 rounded-lg">
                              <p className="text-sm font-medium text-fuchsia-800 dark:text-fuchsia-200">
                                This service requires a custom quote.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleOption(serviceKey, option.id, 'onceOff'); }}
                                className={`p-2 border rounded-lg text-sm font-bold transition-all duration-200 ${
                                  selectedOptions[serviceKey]?.[option.id]?.onceOff
                                    ? 'bg-indigo-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {getCurrencyDisplay(option.onceOff)}
                                <p className="text-xs font-normal mt-1 opacity-80">(Once-off)</p>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleOption(serviceKey, option.id, 'monthly'); }}
                                className={`p-2 border rounded-lg text-sm font-bold transition-all duration-200 ${
                                  selectedOptions[serviceKey]?.[option.id]?.monthly
                                    ? 'bg-purple-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {getCurrencyDisplay(option.monthly)}
                                <p className="text-xs font-normal mt-1 opacity-80">(Monthly)</p>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            <div
              onClick={handleUltimatePackage}
              className={`lg:col-span-1 md:col-span-2 p-8 border-2 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 ${
                isUltimatePackage
                  ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/50'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Rocket className="text-fuchsia-500 w-8 h-8" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ultimate Package</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All services included with a 20% discount.</p>
                  </div>
                </div>
                {isUltimatePackage && <Check className="text-fuchsia-500 w-8 h-8 flex-shrink-0" />}
              </div>
            </div>
          </div>
          
          {/* Payment Gateway Selection */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">Choose Your Payment Method</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <div
                onClick={() => setExpandedGatewayCategory(prev => prev === 'bbt' ? null : 'bbt')}
                className={`w-full md:w-1/2 p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                  expandedGatewayCategory === 'bbt' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/50' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Born Before Technology</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">(Credit/Debit Card)</p>
                </div>
                {expandedGatewayCategory === 'bbt' && (
                  <div className="mt-4 flex flex-col gap-2">
                    {bbtGateways.map(gateway => (
                      <button
                        key={gateway.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedGateway(gateway.id); }}
                        className={`flex items-center space-x-3 px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                          selectedGateway === gateway.id
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        <gateway.icon className="w-5 h-5" />
                        <span>{gateway.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div
                onClick={() => setExpandedGatewayCategory(prev => prev === 'genz' ? null : 'genz')}
                className={`w-full md:w-1/2 p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                  expandedGatewayCategory === 'genz' ? 'border-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-900/50' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Gen Z / ama2K</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">(New Payment Methods)</p>
                </div>
                {expandedGatewayCategory === 'genz' && (
                  <div className="mt-4 flex flex-col gap-2">
                    {genZGateways.map(gateway => (
                      <button
                        key={gateway.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedGateway(gateway.id); }}
                        className={`flex items-center space-x-3 px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                          selectedGateway === gateway.id
                            ? 'bg-fuchsia-600 text-white shadow-lg'
                            : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        <gateway.icon className="w-5 h-5" />
                        <span>{gateway.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">Your Quote ({currency})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Once-off Total</p>
                <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{getCurrencyDisplay(onceOffTotal)}</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Monthly Total</p>
                <p className="text-4xl font-extrabold text-purple-600 dark:text-purple-400">{getCurrencyDisplay(monthlyTotal)}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center">
              <button
                onClick={handlePayment}
                disabled={isCheckoutDisabled}
                className="flex-1 px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 disabled:bg-gray-400 flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>Proceed to Checkout</span>
              </button>
            </div>

            {isPaymentProcessing && (
              <p className="mt-4 text-center text-gray-600 dark:text-gray-400 animate-pulse">Processing your request...</p>
            )}
            {message && (
              <div className="mt-6 p-4 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-xl">
                {message}
              </div>
            )}
          </div>
        </main>

        <footer className="bg-gray-200 dark:bg-gray-700 p-6 text-center text-gray-600 dark:text-gray-400">
          <p>© 2025 DigiSoal. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
