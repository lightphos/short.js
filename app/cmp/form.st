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

            <sub click="alert('click')"></sub>
            <div class="text-center text-sm text-gray-600">
                Don't have an account?
                <a href="#" class="text-indigo-600 hover:text-indigo-800 font-medium">Sign up</a>
            </div>
        </form>

        <form class="bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100">
            <h2 class="text-3xl font-bold text-center text-gray-800">Sign Up</h2>
            <usr></usr>
            <pwd></pwd>
            <pwd placeholder="confirm"></pwd>
            
            <sub ></sub>
            <div class="text-center text-sm text-gray-600">
                Already have an account?
                <a href="#" class="text-indigo-600 hover:text-indigo-800 font-medium">Sign in</a>
            </div>
        </form>
    </div>
</body>


<script type="module">
    import {usr, pwd, sub} from './form.js';

    return {
        usr, pwd, sub
    };
</script>
