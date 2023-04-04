var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// BEGINNING OF THE ABILITY TO EDIT TASK'S TEXT 
  // when <p> is clicked, delegating clicks to the parent <ul> with class .list-group
  $(".list-group").on("click", "p", function() {
    var text = $(this)
      .text()
      .trim();

    /* While $("textarea") tells jQuery to find all existing <textarea> elements, 
    as we've seen before, $("<textarea>") tells jQuery to create a new <textarea> element. */
    var textInput= $("<textarea>") //create new <textarea> element
      .addClass("form-control")
      .val(text);
    
    $(this).replaceWith(textInput);
    textInput.trigger("focus"); // automatically highlight the input box without clicking the <textarea>
    
  });//The text() method will get the inner text content of the current element, represented by $(this)

  //the <textarea> revert back when it goes out of focus, so we can use that event in lieu of a "Save" button.
  $(".list-group").on("blur", "textarea", function() {
    // get the textarea's current value/text
    var text = $(this)
      .val()
      .trim();

    // get the parent ul's id attribute
    var status = $(this)
      .closest(".list-group")
      .attr("id")
      .replace("list-", "");

    // get the task's position in the list of other li elements
    var index = $(this)
      .closest(".list-group-item")
      .index();

    /* tasks is an object.
    tasks[status] returns an array (e.g., toDo).
    tasks[status][index] returns the object at the given index in the array.
    tasks[status][index].text returns the text property of the object at the given index. */
    tasks[status][index].text = text;
    saveTasks();
    
    // recreate p element
    var taskP = $("<p>")
      .addClass("m-1")
      .text(text);

    //replace textarea with p element
    $(this).replaceWith(taskP);
  });
// END OF THE ABILITY TO EDIT TASK'S TEXT

// BEGINNING OF ABILITY TO EDIT TASK DATES
// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text") // set attr() type = "text"
    .addClass("form-control")
    .val(date);
  // swap out elements
  $(this).replaceWith(dateInput);

  // automatically bring up the calendar
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  var date = $(this).val();

  // get status type and position in the list
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span and insert in place of input element
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
    $(this).replaceWith(taskSpan);
});
// END OF ABILITY TO EDIT TASK DATES

// turning the columns into sortables
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  /* helper: "clone" to create a copy of the dragged element and move the copy instead of the original.
    This is necessary to prevent click events from accidentally triggering on the original element*/
  helper: "clone",

  // the activate and deactivate events trigger once for all connected lists as soon as dragging starts and stops
  activate: function(event) {
    //console.log("activate", this);
  },
  deactive: function(event) {
    //console.log("deactivate", this);
  },

  // over and out events trigger when a dragged item enters or leaves a connected list
  over: function(event) {
    //console.log("over", event.target);
  },
  out: function(event) {
    //console.log("out", event.target);
  },

  // update event triggers when the contents of a list have changed (e.g., the items were re-ordered, removed or added)
  update: function(event) {
    //array to store the task data in
    var tempArr = [];
    //loop over current set of children on sortable list
    // each() method will run a callback function for every item/element in the array
    // the children method returns an array of the list element's children (the <li> elements, labeled as li.list-group-item)
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      // add task data to the temp array as a object
      tempArr.push({
        text: text,
        date: date
      });
    });
    
    // trim down list's ID to match object property 
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

// convert trash into a droppable
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});


// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


