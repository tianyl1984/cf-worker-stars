
async function auth(req, env, ctx) {
	const result = {
		user: null,
		resp: null
	}
	// 完成登录后跳转回来的地址
	const url = new URL(req.url);
	if (url.pathname === '/login') {
		// 读取参数中的token，根据token获取当前用户id，写入cookie，暂时跳转回首页
		result.resp = await loginResp(req, env);
		return result;
	}
	if (url.pathname === '/logout') {
		result.resp = await logoutResp(req, env);
		return result;
	}
	// 读取cookie，判断是否存在已登录信息
	const uid = parseUidCookie(req);
	if (!uid) {
		// 返回登录跳转
		result.resp = await jump2AuthResp(req, env);
		return result;
	}
	// 读取用户信息
	const user = await env.authdata.get(`login-user-${uid}`);
	if (user == null) {
		result.resp = await jump2AuthResp(req, env);
		return result;
	}
	result.user = JSON.parse(user);
	return result;
}

async function logoutResp(req, env) {
	const uid = parseUidCookie(req);
	if (uid) {
		await env.authdata.delete(`login-user-${uid}`);
	}
	// 返回登录跳转
	const html = `
	<!DOCTYPE html>
	<html lang="en">
		<head>
		<meta charset="UTF-8">
		<meta http-equiv="refresh" content="3;url=https://${req.headers.get('host')}/">
		</head>
		<body>
			<p>已退出，3 秒后跳转</p>
		</body>
	</html>
	`
	const resp = new Response(html, {
		headers: { 'Content-Type': 'text/html' },
	});
	resp.headers.append('Set-Cookie', `uid=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0`);
	return resp;
}

async function loginResp(req, env) {
	const url = new URL(req.url);
	const token = url.searchParams.get('token');
	const user = await env.authdata.get(`token-${token}`);
	if (user == null) {
		// 异常token
		console.log(`token error:${token}`);
		return jump2AuthResp(req, env);
	}
	// 登录状态记录到kv
	const uid = genUUID();
	const maxAge = 30 * 24 * 60 * 60;
	await env.authdata.put(`login-user-${uid}`, user, {
		expirationTtl: 30 * 24 * 60 * 60,
	});
	// 写入cookie
	const html = `
	<!DOCTYPE html>
	<html lang="en">
		<head>
		<meta charset="UTF-8">
		<meta http-equiv="refresh" content="3;url=https://${req.headers.get('host')}/">
		</head>
		<body>
			<p>登录成功，3 秒后跳转</p>
		</body>
	</html>
	`
	const resp = new Response(html, {
		headers: { 'Content-Type': 'text/html' },
	});
	resp.headers.append('Set-Cookie', `uid=${uid}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`);
	return resp;
}

async function jump2AuthResp(req, env) {
	const host = req.headers.get('host');
	const callback = `https://${host}/login`;
	const server = await env.authdata.get('auth_server');
	const target = `https://${server}/login?callback=${encodeURIComponent(callback)}`;
	return new Response(JSON.stringify({
		error: '302',
		location: target
	}), {
		headers: { 'Content-Type': 'application/json' },
	});
	// return new Response(null, {
	// 	status: 302,
	// 	headers: {
	// 		"Location": target,
	// 	},
	// });
}

function parseUidCookie(request) {
	const cookieHeader = request.headers.get("Cookie");
	const cookies = {};
	if (cookieHeader) {
		cookieHeader.split(";").forEach(cookie => {
			const [name, value] = cookie.split("=").map(c => c.trim());
			cookies[name] = value;
		});
	}
	return cookies['uid'];
}

function genUUID() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
		const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) | (c === "y" ? 8 : 0);
		return r.toString(16);
	});
}

export default {
	auth
}
