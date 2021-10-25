function edit_button (record) {
  record = JSON.parse(record);
  $('#mentorData').html(`
    <div>
      <label class="block mt-4 text-sm">
        <span class="font-semibold text-gray-700 dark:text-gray-400">
          Name:
        </span>
        <div
          class="relative text-gray-500 focus-within:text-purple-600"
        >
          <input
            class="block w-full pr-20 mt-1 text-sm text-black dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input"
            placeholder= ${record.name} 
            disabled
          />
          <button
            class="absolute inset-y-0 right-0 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-r-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            Edit
          </button>
        </div>
      </label>
      <label class="block mt-4 text-sm">
        <span class="font-semibold text-gray-700 dark:text-gray-400">
          Email:
        </span>
        <div
          class="relative text-gray-500 focus-within:text-purple-600"
        >
          <input
            class="block w-full pr-20 mt-1 text-sm text-black dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input"
            placeholder= ${record.email} 
            disabled
          />
          <button
            class="absolute inset-y-0 right-0 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-r-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            Edit
          </button>
        </div>
      </label>
      <label class="block mt-4 text-sm">
        <span class="font-semibold text-gray-700 dark:text-gray-400">
          ZoomID:
        </span>
        <div
          class="relative text-gray-500 focus-within:text-purple-600"
        >
          <input
            class="block w-full pr-20 mt-1 text-sm text-black dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input"
            placeholder= ${record.zoomID}
            disabled
          />
          <button
            class="absolute inset-y-0 right-0 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-r-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            Edit
          </button>
        </div>
      </label>
      <label class="block mt-4 text-sm">
        <span class="font-semibold text-gray-700 dark:text-gray-400">
          Gender:
        </span>
        <div
          class="relative text-gray-500 focus-within:text-purple-600"
        >
          <input
            class="block w-full pr-20 mt-1 text-sm text-black dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input"
            placeholder= ${record.gender}
            disabled
          />
          <button
            class="absolute inset-y-0 right-0 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-r-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            Edit
          </button>
        </div>
      </label>
      <label class="block mt-4 text-sm">
        <span class="font-semibold text-gray-700 dark:text-gray-400">
          RegionalLang:
        </span>
        <div
          class="relative text-gray-500 focus-within:text-purple-600"
        >
          <input
            class="block w-full pr-20 mt-1 text-sm text-black dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input"
            placeholder= ${record.regionalLang} 
            disabled
          />
          <button
            class="absolute inset-y-0 right-0 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-r-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            Edit
          </button>
        </div>
      </label>
      <label class="block mt-4 text-sm">
        <span class="font-semibold text-gray-700 dark:text-gray-400">
          WorkingHour:
        </span>
        <div
          class="relative text-gray-500 focus-within:text-purple-600"
        >
          <input
            class="block w-full pr-20 mt-1 text-sm text-black dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input"
            placeholder= ${record.workingHour}
            disabled
          />
          <button
            class="absolute inset-y-0 right-0 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-r-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            Edit
          </button>
        </div>
      </label>
      <label class="block mt-4 text-sm">
        <span class="font-semibold text-gray-700 dark:text-gray-400">
          BreakHours:
        </span>
        <div
          class="relative text-gray-500 focus-within:text-purple-600"
        >
          <input
            class="block w-full pr-20 mt-1 text-sm text-black dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input"
            placeholder= ${record.breakHours}
            disabled
          />
          <button
            class="absolute inset-y-0 right-0 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-r-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            Edit
          </button>
        </div>
      </label>
    </div>
  `);
}