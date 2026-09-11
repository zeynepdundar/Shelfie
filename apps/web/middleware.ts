import createMiddleware from 'next-intl/middleware';
import nextIntlConfig from './next-intl.config';

export default createMiddleware(nextIntlConfig);

export const config = {
  // i18n uygulanacak yollar
  matcher: [
    '/',
    '/(en|tr)/:path*'
  ]
};


