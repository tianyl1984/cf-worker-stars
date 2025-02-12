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
		const content = await github.getGistContent(env.GITHUB_TOKEN, env.GIST_ID);
		return _resp(content, true);
	}
	// 更新tag关系
	if (url.pathname === '/api/saveTagRepo') {
		const body = await req.text();
		await github.updateGist(env.GITHUB_TOKEN, env.GIST_ID, body);
		return _resp({});
	}
	if (url.pathname === '/api/readme') {
		const repoName = url.searchParams.get('repoName');
		const html = await github.getReadmeHtml(env.GITHUB_TOKEN, repoName);
		return _resp({ html });
	}
	return _error404Resp();
}

function _error404Resp() {
	return _resp({ error: 404 });
}

function _resp(data, flag) {
	const body = flag ? data : JSON.stringify(data);
	return new Response(body, {
		headers: { 'Content-Type': 'application/json' },
	});
}

export default {
	handle
}
