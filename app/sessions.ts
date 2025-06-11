import { IS_CF_PAGES, safeRequireNodeDependency } from '~/utils/platform-adapter';
import { SessionStorage } from '@remix-run/server-runtime/dist/sessions';
import { ErrorResult } from '~/generated/graphql';
import { createCookieSessionStorage } from '@remix-run/cloudflare';
import { CreateCookieSessionStorageFunction } from '@remix-run/server-runtime';

let sessionStorage:
  | SessionStorage<{ activeOrderError: ErrorResult } & Record<string, any>>
  | undefined;
async function getCookieSessionStorageFactory(): Promise<CreateCookieSessionStorageFunction> {
  if (IS_CF_PAGES) {
    return createCookieSessionStorage;
  } else {
    const module = await safeRequireNodeDependency('@remix-run/node');

    // Kiểm tra luôn
    if (typeof module.createCookieSessionStorage === 'function') {
      return module.createCookieSessionStorage;
    }

    throw new Error('createCookieSessionStorage not found in @remix-run/node');
  }
}

export async function getSessionStorage(): Promise<
  SessionStorage<{ activeOrderError: ErrorResult } & Record<string, any>>
> {
  if (sessionStorage) {
    return sessionStorage;
  }

  const factory = await getCookieSessionStorageFactory();
  sessionStorage = factory({
    cookie: {
      name: 'vendure_remix_session',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secrets: ['awdbhbjahdbaw'],
    },
  });

  return sessionStorage;
}
