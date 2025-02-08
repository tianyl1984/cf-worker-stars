import github from "./github.js";

async function handle(req, env, ctx) {
	const url = new URL(req.url);
	// 获取所有star的仓库
	if (url.pathname === '/api/getAllStarRepo') {
		const result = await github.getAllStar(env.GITHUB_TOKEN);
		return _resp(result);
	}
	// 获取所有tag关系
	if (url.pathname === '/api/getTagRepo') {
		return null;
	}
	// 更新tag关系
	if (url.pathname === '/api/saveTagRepo') {
		return null;
	}
	return _error404Resp();
}

function _error404Resp() {
	return _resp({ error: 404 });
}

function _resp(data) {
	return new Response(JSON.stringify(data), {
		headers: { 'Content-Type': 'application/json' },
	});
}

export default {
	handle
}
