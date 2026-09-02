<head>
    <meta charset="UTF-8" />
    <title>Form Example</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="../app.css" rel="stylesheet" />
    <style src="./form.css"></style>
</head>

<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-8">
    <div class="max-w-md mx-auto space-y-8">
        <form class="bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100">
            <h2 class="text-3xl font-bold text-center text-gray-800">Sign In</h2>
            <usr></usr>
            <pwd></pwd>
            <sub></sub>
            <div class="text-center text-sm text-gray-600">
                Don't have an account?
                <a href="#" class="text-indigo-600 hover:text-indigo-800 font-medium">Sign up</a>
            </div>
        </form>

        <form class="bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100">
            <h2 class="text-3xl font-bold text-center text-gray-800">Sign Up</h2>
            <usr></usr>
            <pwd></pwd>
            <cpwd></cpwd>
            <sub></sub>
            <div class="text-center text-sm text-gray-600">
                Already have an account?
                <a href="#" class="text-indigo-600 hover:text-indigo-800 font-medium">Sign in</a>
            </div>
        </form>
    </div>
</body>


<script type="module">
    function usr({sh}) {
        return `<p>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            ${sh.inp({ph: 'username', ty: 'text', cls: 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'})}
        </p>`;
    }

    function pwd({sh}) {
        return `<p>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            ${sh.inp({ph: 'password', ty: 'password', cls: 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'})}
        </p>`;
    }

    function cpwd({sh}) {
        return `<p>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            ${sh.inp({ph: 'confirm password', ty: 'password', cls: 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'})}
        </p>`;
    }

    function sub({sh}) {
        return `${sh.btn({txt:"Submit", clk:"/", cls: "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md hover:shadow-lg"})}`;
    }

    return {
        usr, pwd, cpwd, sub
    };
</script>
