
const GIST_FILE_NAME = 'star.json';

async function createGist(token) {
	const url = 'https://api.github.com/gists';
	const header = _getHeader(token);
	const resp = await fetch(url, {
		method: 'POST',
		headers: header,
		body: JSON.stringify({
			description: '描述',
			public: false,
			files: {
				GIST_FILE_NAME: {
					content: '内容'
				}
			}
		})
	})
	return resp.json();
}

async function updateGist(token, gistId, data) {
	const url = `https://api.github.com/gists/${gistId}`;
	const header = _getHeader(token);
	const resp = await fetch(url, {
		method: 'PATCH',
		headers: header,
		body: JSON.stringify({
			description: 'star data *DO NOT DELETE* ',
			public: false,
			files: {
				[GIST_FILE_NAME]: {
					content: data
				}
			}
		})
	})
	return resp.json();
}

async function getGist(token, gistId) {
	const url = `https://api.github.com/gists/${gistId}`;
	const header = _getHeader(token);
	const resp = await fetch(url, {
		method: 'GET',
		headers: header,
	});
	return resp.json();
}

async function getGistContent(token, gistId) {
	const gist = await getGist(token, gistId);
	return gist.files[GIST_FILE_NAME].content;
}

async function getAllStar(token) {
	const max = 100;
	const result = [];
	let page = 1;
	while (true) {
		const temp = await _getStarByPage(token, max, page);
		const repos = temp.map(item => {
			return {
				name: item.full_name,
				description: item.description,
				startCnt: item.stargazers_count,
				language: item.language,
				topics: item.topics
			}
		});
		result.push(...repos);
		if (temp.length < max) {
			break;
		}
		page++;
	}
	return result;
}

async function _getStarByPage(token, max, page) {
	const url = `https://api.github.com/user/starred?per_page=${max}&page=${page}`;
	const header = _getHeader(token);
	const resp = await fetch(url, {
		method: 'GET',
		headers: header,
	});
	return resp.json();
}

function _getHeader(token) {
	return {
		'Accept': 'application/vnd.github+json',
		'Authorization': `Bearer ${token}`,
		'X-GitHub-Api-Version': '2022-11-28',
		'User-Agent': 'cf-worker-stars',
	}
}

async function getReadmeHtml(repoName) {
	const url = `https://api.github.com/repos/${repoName}/readme`;
	const header = _getHeader(token);
	header['Accept'] = 'application/vnd.github.v3.html';
	const resp = await fetch(url, {
		method: 'GET',
		headers: header,
	});
	return resp.text();
}

export default {
	createGist,
	updateGist,
	getGist,
	getGistContent,
	getAllStar,
	getReadmeHtml,
}
