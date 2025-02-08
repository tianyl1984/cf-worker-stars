import auth from './auth.js';

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
	// const authResult = await auth.auth(req, env, ctx);
	// if (authResult.resp != null) {
	// 	return authResult.resp;
	// }
	// console.log('login success');
	// const user = authResult.user;
	return new Response(`Hello`);
}
