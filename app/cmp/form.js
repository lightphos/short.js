export function usr({username}) {
    return `<p>
        <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input type="text" 
          class='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
          name="username" placeholder="username" />
    </p>`;
}

export function pwd({password, placeholder}) {
    let ph = placeholder ? placeholder : 'password';
    return `<p>
        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input type="password" name="password" placeholder="${ph}"
            class='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition' />
    </p>`;
}

export function sub({click}) {
    console.log('onClick', click);
    let clk = click ? click : 'submitForm()';
    console.log('clk', clk);
    return `
      <button 
        onclick="${clk}"
        class='mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md hover:shadow-lg'>
        Submit
      </button>
    `;
}