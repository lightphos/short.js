<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Short App</title>
    <style src="./app.css"></style>
</head>

<body class="bg-gradient-to-br from-indigo-100 to-purple-100 min-h-screen">
    <div id="short" class="max-w-2xl mx-auto p-8">
       <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">My App</h1>

       <div class="flex flex-col gap-6">
           <cmp v="1"></cmp>
           <cmp v="2"></cmp>
       </div>

       <div class="mt-8 text-center">
           <bcmp v="Click me" class=""></bcmp>
       </div>

       <div class="mt-6 flex flex-wrap gap-4 justify-center">
           <txts v="some text"></txts>
           <txt2 v="some moretext"></txt2>
       </div>

       <nav class="mt-10 flex gap-4 justify-center">
           <a href="./cmp/user.html" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">User</a>
           <a href="./cmp/form.html" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">Form</a>
           <a href="./cmp/count.html" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">Count</a>
       </nav>

    </div>

</body>

</html>

<script type="module">
    import { txts, txt2, bcmp, cmp } from './app.js';
    return {
        txts, txt2, bcmp, cmp
    };
</script>
