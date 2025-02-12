import auth from './auth.js';
import star from './star.js';

export default {
	async fetch(request, env, ctx) {
		try {
			return await _handle(request, env, ctx);
		} catch (err) {
			console.error('Unhandled error:', err);
			return new Response(err.message, { status: 500 });
		}
	},
};

async function _handle(req, env, ctx) {
	const authResult = await auth.auth(req, env, ctx);
	if (authResult.resp != null) {
		return authResult.resp;
	}
	// console.log('login success');
	const user = authResult.user;
	const url = new URL(req.url);
	if (url.pathname.startsWith('/api/user')) {
		return new Response(JSON.stringify({
			name: user.name,
			avatar: user.avatar_url,
			bio: user.bio
		}), {
			headers: { 'Content-Type': 'application/json' },
		});
	}
	if (url.pathname.startsWith('/api/')) {
		return star.handle(req, env, ctx);
	}
	return new Response(`Hello:${req.url}`);
}
