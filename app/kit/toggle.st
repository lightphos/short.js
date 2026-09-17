<head>
    <meta charset="UTF-8" />
    <title>Form Example</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="../app.css" rel="stylesheet" />
</head>

<body class="bg-linear-to-br from-blue-50 to-indigo-100 min-h-screen p-8">
    <back></back>

    <div>
    <banner n="Toggles"></banner>
    
    <button id="bhi" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            onclick="${tglb('bhi')}">Hi</button>
    <button id="bbye" class="hidden bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            onclick="${tglb('bbye')}">Bye</button>

    <p/>
    <br/>
    <button id="byes" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            onclick="${tglyn('byes')}">Yes</button>
    <button id="bno" class="hidden bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            onclick="${tglyn('bno')}">No</button>

    </div>
    ${tglb.init}
    ${tglyn.init}

</body>

<script type="module">
    import { back, banner } from '../app.js';
    import { tgl } from '../../short.js';

    const tglb = tgl({ bhi: false, bbye: true });
    const tglyn = tgl({ byes: false, bno: true });
    return {
        back, banner, tglb, tglyn
    };
</script>
