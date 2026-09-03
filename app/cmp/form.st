<head>
    <meta charset="UTF-8" />
    <title>Form Example</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="../app.css" rel="stylesheet" />
</head>

<body class="bg-linear-to-br from-blue-50 to-indigo-100 min-h-screen p-8">
    <div class="max-w-md mx-auto space-y-8">

        <auth></auth>
    </div>
</body>


<script type="module">
    import {auth, usr, pwd, sub} from './form.js';

    return {
        auth, usr, pwd, sub
    };
</script>
