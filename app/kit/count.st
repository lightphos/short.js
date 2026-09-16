<head>
    <meta charset="UTF-8" />
    <title>Counter Demo</title>
    <link href="../app.css" rel="stylesheet" />
</head>

<body class="bg-linear-to-br from-indigo-100 to-purple-100 min-h-screen flex flex-col items-center justify-center">
    <div class="max-w-md mx-auto">

       <back></back>

       <banner v="Counter Banner"></banner>
       <p/>
       <div class="mb-5">
        <button class="ct-btn ct-btn-inc" onclick="setSomething('{some: \'one\'}')">
            To one
        </button>
        <state of="something" val="{ some: 'thing'}"></state>
       </div>
       
       <span class="ct-btn-group">
          <button class="ct-btn ct-btn-inc" onclick="setCounter(getCounter() + 2)">
            Set Counter
            [<state of="counter" val="3"></state>]
          </button>
       </span>

       <p/>
       <div class="ct-card mt-5">
            <h2 class="ct-title">Count</h2>
            <p class="ct-value">
                <state of="count"></state>
            </p>
            <div class="ct-btn-group">
                <button class="ct-btn ct-btn-dec"
                    onclick="setCount(getCount() - 1)">−</button>
                <button class="ct-btn ct-btn-inc"
                    onclick="setCount(getCount() + 1)">+</button>
                <button class="ct-btn ct-btn-reset"
                    onclick="setCount(0)">Reset</button>
            </div>
        </div>
    </div>
</body>

<init></init>
<script type="module">
    import { state } from '../../short.js';
    import { back } from '../app.js';
    import { banner } from './count.js';

    return { back, banner, state };

</script>
