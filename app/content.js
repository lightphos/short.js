export function content({ txt }) {
    return (
        `<div class="mt-2 mb-2">
<form class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
      
      <h2 class="text-2xl font-bold text-gray-800 text-center">${txt}</h2>

      <!-- Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="John Doe"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 transition"
        />
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 transition"
        />
      </div>

      <!-- Message -->
      <div>
        <label for="message" class="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows="4"
          placeholder="Write your message..."
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 transition resize-none"
        ></textarea>
      </div>

      <!-- Checkbox -->
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          id="terms"
          class="w-4 h-4 text-blue-600 border-gray-300 rounded 
                 focus:ring-blue-500"
        />
        <label for="terms" class="text-sm text-gray-600">
          I agree to the terms and conditions
        </label>
      </div>

      <!-- Submit button -->
      <button
        type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold 
               py-3 px-4 rounded-lg transition duration-200 
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Send Message
      </button>

    </form>
        </div>`
    );
}
