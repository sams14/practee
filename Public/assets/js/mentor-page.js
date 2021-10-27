function edit_button (record) {
  var record = JSON.parse(record);
  $('#mentorData').html(`
    <div>
      <label class="block mt-4 text-sm hidden">
        <div
          class="relative text-gray-500 focus-within:text-purple-600"
        >
          <input
            class="block w-full pr-20 mt-1 text-sm text-black dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input"
            placeholder= ${record._id} 
            value= ${record._id} 
            name= "_id"
            disabled
          />
        </div>
      </label>
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
            value= '${record.name}'
            name= "name"
            disabled
          />
          <a name = "togglename"
            onclick="toggleInput('name', \`${record.name}\`)"
            class="absolute inset-y-0 right-0 py-2 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-r-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            Edit
          </a>
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
            value= ${record.email} 
            name = "email"
            disabled
          />
          <span class="text-xs text-gray-600 dark:text-gray-400">
            You're Not Allowed To Edit This Field.
          </span>
        </div>
      </label>
      <label class="block mt-4 text-sm hidden">
        <div
          class="relative text-gray-500 focus-within:text-purple-600"
        >
          <input
            class="block w-full pr-20 mt-1 text-sm text-black dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input"
            placeholder= ${record.zoomID}
            value= ${record.zoomID}
            name = "zoomID"
            disabled
          />
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
            value= ${record.gender}
            name = "gender"
            disabled
          />
          <a name = "togglegender"
            onclick="toggleInput('gender', \`${record.gender}\`)"
            class="absolute inset-y-0 right-0 py-2 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-r-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            Edit
          </a>
        </div>
        <span class="text-xs text-gray-600 dark:text-gray-400">
          Possible Values Are : "Male", "Female", "NA"
        </span>
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
            value = ${record.regionalLang} 
            name = "regionalLang"
            disabled
          />
          <a name = "toggleregionalLang"
            onclick="toggleInput('regionalLang', \`${record.regionalLang}\`)"
            class="absolute inset-y-0 right-0 py-2 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-r-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            Edit
          </a>
        </div>
        <span class="text-xs text-gray-600 dark:text-gray-400">
          Keep The Starting Letter In Caps. For Multiple Entries Use Comma To Separate.
        </span>
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
            placeholder = ${record.workingHour}
            value = ${record.workingHour}
            name = "workingHour"
            disabled
          />
          <a name = "toggleworkingHour"
            onclick="toggleInput('workingHour', \`${record.workingHour}\`)"
            class="absolute inset-y-0 right-0 py-2 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-r-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            Edit
          </a>
        </div>
        <span class="text-xs text-gray-600 dark:text-gray-400">
          Specify Time Only In 24hr Formatting : "HH:MM-HH:MM"
        </span>
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
            value = ${record.breakHours}
            name = "breakHours"
            disabled
          />
          <a name = "togglebreakHours"
            onclick="toggleInput('breakHours', \`${record.breakHours}\`)"
            class="absolute inset-y-0 right-0 py-2 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-r-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            Edit
          </a>
        </div>
        <span class="text-xs text-gray-600 dark:text-gray-400">
          Use 24hr Formatting : "HH:MM-HH:MM". For Multiple Entries Use Comma To Separate.
        </span>
      </label>
    </div>
  `);
}

function toggleInput (name, resetValue) {
  if ($('input[name='+name+']').prop('disabled')){
    $('input[name='+name+']').attr("disabled",false);
    $('a[name=toggle'+name+']').html("Reset");
  }
  else if (!$('input[name='+name+']').prop('disabled')) {
      $('input[name='+name+']').val(resetValue);
      $('a[name=toggle'+name+']').html("Edit");
      $('input[name='+name+']').attr("disabled",true);
  }
}

$('form').submit(function(e) {
  $(':disabled').each(function(e) {
      $(this).removeAttr('disabled');
  })
});