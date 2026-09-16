const nextIntlConfig = {
  locales: ['en', 'tr'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // Tarayıcının Accept-Language başlığına bakılmaz: "/" her zaman İngilizceyle
  // açılır. Dil değişimi yalnızca kullanıcının Hesabım > Tercihler'den yaptığı
  // seçimle olur.
  localeDetection: false
} as const;

export default nextIntlConfig;
