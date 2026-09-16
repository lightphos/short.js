<head>
    <meta charset="UTF-8" />
    <title>Counter Demo</title>
    <link href="../app.css" rel="stylesheet" />
</head>

<body class="bg-linear-to-br from-indigo-100 to-purple-100 min-h-screen flex flex-col items-center justify-center">
    <div class="max-w-md mx-auto">

       <back></back>

       <br/>
       <state of="counter"></state>
       <p/>
       <hr/>
       <gets of="counter"></gets>
       <hr/>
        <button class="ct-btn" onclick="${upds('counter', 3)}">
            Set Counter</button>
       <p/>
       <banner v="Counter Banner"></banner>
       <div class="ct-card">
            <h2 class="ct-title">Counter</h2>
            <p class="ct-value">[
                <getState gfn="${getCount}"></getState>
                ]
            </p>
            <div class="ct-btn-group">
                <button class="ct-btn ct-btn-dec"
                    onclick="${setCount(c => c - 1)}">−</button>
                <button class="ct-btn ct-btn-inc"
                    onclick="${setCount(c => c + 1)}">+</button>
                <button class="ct-btn ct-btn-reset"
                    onclick="${setCount(0)}">Reset</button>
            </div>
        </div>
    </div>
</body>

<init></init>
<script type="module">
    import { st, state, gets, upds } from '../../short.js';
    import { back } from '../app.js';
    import { getState, banner } from './count.js';

    const { getCount, setCount, init } = st.define({ count: 0 }, ['count']);

    return { back, getCount, setCount, getState, banner, init, state, gets, upds };

</script>
