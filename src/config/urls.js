export const URL_API_BASE = import.meta.env.VITE_APP_URL_API_BASE;
export const URL_API = import.meta.env.VITE_APP_URL_API;

export const withApiUrl                                 = (path= null) => `${URL_API}${!!path ? `/${path}` : null}`;

/** Authentication **/
export const URL_API_AUTH                       = withApiUrl('auth');
export const URL_API_AUTH_LOGIN                 = withApiUrl('auth/login');
export const URL_API_AUTH_REFRESH               = withApiUrl('auth/refresh');
export const URL_API_AUTH_REGISTER              = withApiUrl('auth/register');
export const URL_API_AUTH_USER                  = withApiUrl('auth/user');
export const URL_API_AUTH_LOGOUT                = withApiUrl('auth/logout');

/** Posts **/
export const URL_API_POSTS                      = withApiUrl('posts');

/** Comments **/
export const URL_API_COMMENTS                   = withApiUrl('comments');
export const URL_API_COMMENTS_REPLY             = withApiUrl('comments/reply');
export const URL_API_COMMENTS_REPLIES           = withApiUrl('comments/replies');

/** Gallery **/
export const URL_API_GALLERY                    = withApiUrl('gallery');

/** Likes **/
export const URL_API_LIKES_LIKE                 = withApiUrl('likes/like');
export const URL_API_LIKES_UNLIKE               = withApiUrl('likes/unlike');

/** Profile **/
export const URL_API_PROFILE                    = withApiUrl('profile');