<head>
    <meta charset="UTF-8" />
    <title>Form Example</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="../app.css" rel="stylesheet" />
</head>

<body class="bg-linear-to-br from-blue-50 to-indigo-100 min-h-screen p-8">
    <back></back>
    <div class="max-w-md mx-auto mb-5">
        <form id="sif" class="bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100">
            <h2 class="text-3xl font-bold text-center text-gray-800">Sign In</h2>
            <usr username="Username"></usr>
            <pwd password="Password"></pwd>
            <sub></sub>
            <div class="text-center text-sm text-gray-600">
                Don't have an account?
                <a href="#" onclick="${tglf('sif')}"
                   class="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">
                   Sign Up</a>
           </div>
        </form>
        <form id="suf" class="bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100 hidden">
            <h2 class="text-3xl font-bold text-center text-gray-800">Sign Up</h2>
            <usr username="Username"></usr>
            <pwd password="Password"></pwd>
            <pwd password="Confirm Password" placeholder="Confirm your password"></pwd>
            <sub></sub>
            <div class="text-center text-sm text-gray-600">
                Already have an account?
                <a href="#" onclick="${tglf('suf')}"
                   class="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">
                   Sign In</a>
           </div>
        </form>
    </div>

    ${tglf.init}

</body>

<script type="module">
    import { usr, pwd, sub } from './form.js';
    import { back } from '../app.js';
    import { tgl } from '../../short.js';

    const tglf = tgl({ sif: false, suf: true });
    return {
        usr, pwd, sub, back, tglf
    };
</script>
