export default {
  supportedLngs: ['vi', 'es', 'pt', 'pt-BR'],
  fallbackLng: 'vi',
  // Disabling suspense is recommended
  react: { useSuspense: false },
  backend: {
    loadPath: '../public/locales/{{lng}}/{{ns}}.json',
  },
};
