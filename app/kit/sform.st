<head>
    <meta charset="UTF-8" />
    <title>Short Form</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="../app.css" rel="stylesheet" />
</head>

<body class="bg-linear-to-br from-blue-50 to-indigo-100 min-h-screen p-8">
    <back></back>
    <div class="max-w-md mx-auto mb-5">
        <frm id="signin" title="Sign In" cls="frm-sh" hdrcls="hdr-sh" btncls="btn-sh"
            fields="${[ usr({username: 'Username'}),  pwd({password: 'Password'}) ]}"
            postfield="${noacc()}"
        >
        </frm>

    </div>

</body>

<script type="module">
    import { usr, pwd } from './form.js';
    import { back } from '../app.js';
    import { frm, inp, tgl } from '../../short.js';

    export function noacc() {
       return `<div class="text-center text-sm text-gray-600">
            Don't have an account?
            <a href="#" onclick=""
                class="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">
                Sign Up</a>
        </div>`
    }

    const tglf = tgl({ sif: false, suf: true });
    return {
        frm, inp, usr, pwd, back, tglf, noacc
    };
</script>
