<html>
<head>
	<meta charset="UTF-8" />
	<title>REST API Example</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<link href="../../app.css" rel="stylesheet" />
</head>

<body class="bg-linear-to-br from-slate-50 to-cyan-100 min-h-screen p-8">
	<div class="max-w-xl mx-auto">
		<back></back>
		<section class="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
			<p class="text-sm font-semibold uppercase tracking-wide text-cyan-700">REST API</p>
			<h1 class="text-3xl font-bold text-slate-900 mt-2">Create a post</h1>
			<p class="text-slate-600 mt-2">Send JSON to a REST endpoint.</p>

			<form id="rest-form" class="space-y-5 mt-6">
				<label class="block">
					<span class="block text-sm font-medium text-slate-700 mb-1">Title</span>
					<input name="title" required value="A post from Short.js"
						class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
				</label>
				<label class="block">
					<span class="block text-sm font-medium text-slate-700 mb-1">Body</span>
					<textarea name="body" required rows="5"
						class="txt-sh">Hello from short</textarea>
				</label>
				<button type="submit"
					class="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-semibold py-3 px-4 rounded-lg transition">
					Send POST request
				</button>
			</form>
			<p id="rest-status" class="mt-5 text-sm text-slate-600" role="status"></p>
			<pre id="rest-result" class="mt-3 hidden overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-cyan-100"></pre>
		</section>
		<rest-call></rest-call>
	</div>
</body>
</html>
<script type="module">
	import { back } from '../../app.js';

	function restCall() {
		return `
			<script type="module">
				import { api, elem, listen } from '/short.js';

				const status = elem('rest-status');
				const result = elem('rest-result');
				listen('rest-form', 'submit', async (event, form) => {
					event.preventDefault();
					const submit = form.querySelector('button[type="submit"]');
					submit.disabled = true;
					status.textContent = 'Sending post...';

					try {
						const post = await api.post('https://jsonplaceholder.typicode.com/posts', {
							title: form.elements.title.value,
							body: form.elements.body.value,
							userId: 1,
						});
						status.textContent = 'Post created successfully.';
						result.textContent = JSON.stringify(post, null, 2);
						result.classList.remove('hidden');
					} catch (error) {
						status.textContent = 'Request failed: ' + error.message;
					} finally {
						submit.disabled = false;
					}
				});
			<\/script>
		`;
	}

	return { back, restCall, 'rest-call': restCall };
</script>
