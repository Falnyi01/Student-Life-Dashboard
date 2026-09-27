const STORAGE_KEY = "student-planner-events-v1";
const CATEGORY_KEY = "student-planner-categories-v1";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const defaultCategoryOptions = [
  { value: "class", label: "Class" },
  { value: "study", label: "Study" },
  { value: "work", label: "Work" },
  { value: "personal", label: "Personal" },
  { value: "assignment", label: "Assignment" }
];

const defaultEvents = [
  {
    id: 1,
    title: "Math Class",
    date: "2026-09-28",
    start: "09:00",
    end: "10:30",
    category: "class",
    color: "#3b82f6"
  },
  {
    id: 2,
    title: "Study Group",
    date: "2026-09-30",
    start: "18:00",
    end: "19:30",
    category: "study",
    color: "#22c55e"
  },
  {
    id: 3,
    title: "Work Shift",
    date: "2026-10-02",
    start: "17:00",
    end: "20:00",
    category: "work",
    color: "#f59e0b"
  }
];

const state = {
  activeTab: "calendar",
  view: "month",
  currentDate: new Date(),
  selectedDate: new Date(),
  weekStart: getStartOfWeek(new Date()),
  events: [],
  categories: [],
  selectedCategories: new Set(),
  editingEventId: null,
  todoTab: "active",
  todoView: "day",
  todoSelectedDate: new Date(),
  todoEditingId: null,
  todoKind: "all",
  todos: [],
  completedTodos: [],
  weeklyStartHour: 6,
  weeklyEndHour: 22
};

function loadEvents() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEvents));
    return [...defaultEvents];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultEvents];
  } catch (error) {
    console.error("Failed to read saved events.", error);
    return [...defaultEvents];
  }
}

function loadCategories() {
  const saved = localStorage.getItem(CATEGORY_KEY);

  if (!saved) {
    const defaults = defaultCategoryOptions.map((option) => ({
      value: option.value,
      label: option.label
    }));
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(defaults));
    return defaults;
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultCategoryOptions.map((option) => ({ value: option.value, label: option.label }));
    }
    return parsed;
  } catch (error) {
    console.error("Failed to read custom categories.", error);
    return defaultCategoryOptions.map((option) => ({ value: option.value, label: option.label }));
  }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
}

function saveCategories() {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(state.categories));
}

function getAllCategories() {
  return [...defaultCategoryOptions, ...state.categories.filter((category) => !defaultCategoryOptions.some((defaultOption) => defaultOption.value === category.value))];
}

function getCategoryColor(categoryValue) {
  const palette = {
    class: "#3b82f6",
    study: "#22c55e",
    work: "#f59e0b",
    personal: "#ec4899",
    assignment: "#8b5cf6"
  };

  return palette[categoryValue] || "#3b82f6";
}

function getStartOfWeek(date) {
  const copy = new Date(date);
  const day = (copy.getDay() + 6) % 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - day);
  return copy;
}

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDayLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(date);
}

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;
  return `${normalizedHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function getEventDisplayStyles(event) {
  const color = event.color || getCategoryColor(event.category);
  return {
    backgroundColor: `${color}1A`,
    borderColor: color,
    color: "#e5e7eb"
  };
}

function setSelectedDate(date) {
  state.selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  state.weekStart = getStartOfWeek(state.selectedDate);

  const dateInput = document.getElementById("event-date");
  if (dateInput) {
    dateInput.value = formatDateForInput(state.selectedDate);
  }
}

function renderCurrentDateLabel() {
  const label = document.getElementById("current-date-label");
  if (!label) return;

  label.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date());
}

function renderCategoryOptions() {
  const select = document.getElementById("event-category");
  if (!select) return;

  const categories = getAllCategories();
  select.innerHTML = categories
    .map((category) => `<option value="${category.value}">${category.label}</option>`)
    .join("");

  if (!categories.some((category) => category.value === "class")) {
    select.value = categories[0]?.value || "";
  } else {
    select.value = "class";
  }
}

function renderMonthSelect() {
  const select = document.getElementById("month-select");
  if (!select) return;

  select.innerHTML = monthNames
    .map((month, index) => `<option value="${index}">${month}</option>`)
    .join("");

  select.value = String(state.currentDate.getMonth());
}

function renderYearSelect() {
  const select = document.getElementById("year-select");
  if (!select) return;

  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear - 5; year <= currentYear + 10; year += 1) {
    years.push(year);
  }

  select.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");
  select.value = String(state.currentDate.getFullYear());
}

function renderPeriodLabel() {
  const label = document.getElementById("period-label");
  if (!label) return;

  label.textContent = `${monthNames[state.currentDate.getMonth()]} ${state.currentDate.getFullYear()}`;
}

function getEventsForDate(dateString) {
  return state.events
    .filter((event) => event.date === dateString)
    .sort((a, b) => a.start.localeCompare(b.start));
}

function buildEventPill(event) {
  const styles = getEventDisplayStyles(event);
  const pill = document.createElement("button");
  pill.type = "button";
  pill.className = "event-pill";
  pill.style.backgroundColor = styles.backgroundColor;
  pill.style.borderColor = styles.borderColor;
  pill.style.color = styles.color;
  pill.textContent = event.title;
  pill.addEventListener("click", (eventClick) => {
    eventClick.stopPropagation();
    startEditEvent(event.id);
  });
  return pill;
}

function renderMonthCalendar() {
  const monthCalendar = document.getElementById("month-calendar");
  if (!monthCalendar) return;

  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay();

  const cells = [];

  for (let i = 0; i < 42; i += 1) {
    const dayNumber = i - firstWeekday + 1;
    const date = new Date(year, month, dayNumber);
    const key = formatDateForInput(date);
    const eventsForDate = getEventsForDate(key);
    const isCurrentMonth = date.getMonth() === month;
    const isSelected = formatDateForInput(state.selectedDate) === key;

    const dateCell = document.createElement("button");
    dateCell.type = "button";
    dateCell.className = `month-day ${isCurrentMonth ? "" : "other-month"} ${isSelected ? "selected" : ""}`.trim();

    const title = document.createElement("span");
    title.className = "day-number";
    title.textContent = date.getDate();
    dateCell.appendChild(title);

    eventsForDate.slice(0, 2).forEach((event) => {
      const pill = buildEventPill(event);
      dateCell.appendChild(pill);
    });

    if (eventsForDate.length > 2) {
      const extra = document.createElement("span");
      extra.className = "event-pill";
      extra.textContent = `+${eventsForDate.length - 2} more`;
      extra.style.backgroundColor = "rgba(148,163,184,0.12)";
      extra.style.borderColor = "rgba(148,163,184,0.4)";
      dateCell.appendChild(extra);
    }

    dateCell.addEventListener("click", () => {
      setSelectedDate(date);
      state.currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
      render();
    });

    cells.push(dateCell);
  }

  const weekdayRow = document.createElement("div");
  weekdayRow.className = "weekday-row";

  dayNames.forEach((dayName) => {
    const header = document.createElement("div");
    header.className = "weekday-header";
    header.textContent = dayName;
    weekdayRow.appendChild(header);
  });

  const monthGrid = document.createElement("div");
  monthGrid.className = "month-grid";
  cells.forEach((cell) => monthGrid.appendChild(cell));

  monthCalendar.innerHTML = "";
  monthCalendar.appendChild(weekdayRow);
  monthCalendar.appendChild(monthGrid);
}

function renderWeekCalendar() {
  const weekContainer = document.getElementById("week-calendar");
  if (!weekContainer) return;

  const weekDays = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(state.weekStart);
    date.setDate(state.weekStart.getDate() + i);
    weekDays.push(date);
  }

  const weekGrid = document.createElement("div");
  weekGrid.className = "weekly-schedule";

  weekDays.forEach((date) => {
    const dateKey = formatDateForInput(date);
    const column = document.createElement("div");
    column.className = "week-day-column";

    const label = document.createElement("h3");
    label.textContent = `${dayNames[date.getDay()]} ${date.getDate()}`;
    column.appendChild(label);

    const matchingEvents = state.events
      .filter((event) => event.date === dateKey && state.selectedCategories.has(event.category))
      .sort((a, b) => a.start.localeCompare(b.start));

    if (matchingEvents.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-week";
      empty.textContent = "No events";
      column.appendChild(empty);
    } else {
      matchingEvents.forEach((event) => {
        const card = createEventCard(event);
        column.appendChild(card);
      });
    }

    weekGrid.appendChild(column);
  });

  weekContainer.innerHTML = "";
  weekContainer.appendChild(weekGrid);
}

function renderDayView() {
  const dayContainer = document.getElementById("day-calendar");
  if (!dayContainer) return;

  const dateKey = formatDateForInput(state.selectedDate);
  const matches = state.events
    .filter((event) => event.date === dateKey)
    .sort((a, b) => a.start.localeCompare(b.start));

  const content = document.createElement("div");
  content.className = "week-day-column";
  content.style.minHeight = "200px";

  const title = document.createElement("h3");
  title.textContent = formatDayLabel(state.selectedDate);
  content.appendChild(title);

  if (matches.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-week";
    empty.textContent = "No events for this day.";
    content.appendChild(empty);
  } else {
    matches.forEach((event) => {
      const card = createEventCard(event);
      content.appendChild(card);
    });
  }

  dayContainer.innerHTML = "";
  dayContainer.appendChild(content);
}

function createEventCard(event) {
  const card = document.createElement("div");
  const styles = getEventDisplayStyles(event);
  card.className = "week-event";
  card.style.backgroundColor = styles.backgroundColor;
  card.style.borderColor = styles.borderColor;
  card.style.color = styles.color;

  const title = document.createElement("strong");
  title.textContent = event.title;

  const category = document.createElement("div");
  category.textContent = event.category;

  const time = document.createElement("div");
  time.textContent = `${formatTime(event.start)} - ${formatTime(event.end)}`;

  const actions = document.createElement("div");
  actions.className = "event-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "event-action";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => startEditEvent(event.id));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "event-action";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteEvent(event.id));

  actions.append(editButton, deleteButton);
  card.append(title, category, time, actions);
  return card;
}

function formatDuration(minutes) {
  const totalMinutes = Math.max(0, minutes);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  if (mins) return `${mins}m`;
  return "0m";
}

function getVisibleWeekDates() {
  const dates = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(state.weekStart);
    date.setDate(state.weekStart.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function getFilteredWeeklyEvents() {
  const weekStartKey = formatDateForInput(state.weekStart);
  const weekEndDate = new Date(state.weekStart);
  weekEndDate.setDate(state.weekStart.getDate() + 6);
  const weekEndKey = formatDateForInput(weekEndDate);

  return state.events.filter((event) => {
    const inRange = event.date >= weekStartKey && event.date <= weekEndKey;
    return inRange && state.selectedCategories.has(event.category);
  });
}

function getExactDurationMinutes(startTime, endTime) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  return Math.max(0, endMinutes - startMinutes);
}

function getEventMinutesWithinRange(event, startHour, endHour) {
  const eventStart = timeToMinutes(event.start);
  const eventEnd = timeToMinutes(event.end);
  const visibleStart = startHour * 60;
  const visibleEnd = endHour * 60;
  const overlapStart = Math.max(eventStart, visibleStart);
  const overlapEnd = Math.min(eventEnd, visibleEnd);
  return Math.max(0, overlapEnd - overlapStart);
}

function renderWeeklySummary() {
  const summaryContainer = document.getElementById("weekly-summary");
  if (!summaryContainer) return;

  const visibleDates = getVisibleWeekDates();
  const visibleHours = state.weeklyEndHour - state.weeklyStartHour;
  const selectedEvents = getFilteredWeeklyEvents();

  const eventTotals = selectedEvents.map((event) => ({
    title: event.title,
    duration: getExactDurationMinutes(event.start, event.end),
    date: event.date
  }));

  const dayTotals = visibleDates.map((date) => {
    const dateKey = formatDateForInput(date);
    const dayEvents = selectedEvents.filter((event) => event.date === dateKey);
    const busyMinutes = dayEvents.reduce(
      (total, event) => total + getEventMinutesWithinRange(event, state.weeklyStartHour, state.weeklyEndHour),
      0
    );
    const availableMinutes = (state.weeklyEndHour - state.weeklyStartHour) * 60;
    const freeMinutes = Math.max(0, availableMinutes - busyMinutes);

    return {
      label: `${dayNames[date.getDay()]} ${date.getDate()}`,
      busyMinutes,
      freeMinutes
    };
  });

  const weekBusyMinutes = dayTotals.reduce((total, day) => total + day.busyMinutes, 0);
  const weekAvailableMinutes = visibleHours * 60 * 7;
  const weekFreeMinutes = Math.max(0, weekAvailableMinutes - weekBusyMinutes);

  const eventTotalMinutes = eventTotals.reduce((sum, item) => sum + item.duration, 0);

  summaryContainer.innerHTML = `
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Event time</h3>
        ${eventTotals.length ? eventTotals.map((item) => `
          <div class="summary-row">
            <span>${item.title}</span>
            <strong>${formatDuration(item.duration)}</strong>
          </div>
        `).join("") : '<p class="summary-empty">No events in this week.</p>'}
      </div>

      <div class="summary-card">
        <h3>Daily totals</h3>
        ${dayTotals.map((day) => `
          <div class="summary-row summary-day-row">
            <div class="summary-day-label">
              <span>${day.label}</span>
              <small>${formatDuration(day.freeMinutes)} free</small>
            </div>
            <strong>${formatDuration(day.busyMinutes)}</strong>
          </div>
        `).join("")}
      </div>

      <div class="summary-card">
        <h3>Week total</h3>
        <div class="summary-total-row">
          <span>Scheduled</span>
          <strong>${formatDuration(eventTotalMinutes)}</strong>
        </div>
        <div class="summary-total-row">
          <span>Free time</span>
          <strong>${formatDuration(weekFreeMinutes)}</strong>
        </div>
        <div class="summary-total-row">
          <span>Available</span>
          <strong>${formatDuration(weekAvailableMinutes)}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderWeeklyPlanner() {
  const weekPicker = document.getElementById("week-picker");
  if (weekPicker) {
    weekPicker.value = formatDateForInput(state.weekStart);
  }

  const startHourSelect = document.getElementById("weekly-start-hour");
  const endHourSelect = document.getElementById("weekly-end-hour");

  if (startHourSelect && endHourSelect) {
    const hourOptions = Array.from({ length: 24 }, (_, hour) => `<option value="${hour}">${formatHourLabel(hour)}</option>`).join("");
    startHourSelect.innerHTML = hourOptions;
    endHourSelect.innerHTML = hourOptions;
    startHourSelect.value = String(state.weeklyStartHour);
    endHourSelect.value = String(state.weeklyEndHour);
  }

  const filters = document.getElementById("category-filters");
  if (filters) {
    const categories = getAllCategories();
    filters.innerHTML = categories
      .map(
        (option) => `
          <button
            type="button"
            class="category-toggle ${state.selectedCategories.has(option.value) ? "active" : ""}"
            data-category="${option.value}"
          >
            ${option.label}
          </button>
        `
      )
      .join("");

    filters.querySelectorAll(".category-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const category = button.dataset.category;

        if (state.selectedCategories.has(category)) {
          if (state.selectedCategories.size === 1) return;
          state.selectedCategories.delete(category);
        } else {
          state.selectedCategories.add(category);
        }

        renderWeeklyPlanner();
      });
    });
  }

  const schedule = document.getElementById("weekly-schedule");
  if (!schedule) return;

  const weekDates = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(state.weekStart);
    date.setDate(state.weekStart.getDate() + i);
    weekDates.push(date);
  }

  const selectedEvents = state.events.filter((event) => {
    const weekStartKey = formatDateForInput(state.weekStart);
    const weekEndDate = new Date(state.weekStart);
    weekEndDate.setDate(state.weekStart.getDate() + 6);
    const weekEndKey = formatDateForInput(weekEndDate);
    const eventKey = event.date;
    const inRange = eventKey >= weekStartKey && eventKey <= weekEndKey;
    return inRange && state.selectedCategories.has(event.category);
  });

  schedule.innerHTML = "";

  const scheduleGrid = document.createElement("div");
  scheduleGrid.className = "weekly-grid";

  const header = document.createElement("div");
  header.className = "weekly-grid-header";

  const timeHeader = document.createElement("div");
  timeHeader.className = "schedule-time-header";
  timeHeader.textContent = "Time";
  header.appendChild(timeHeader);

  weekDates.forEach((date) => {
    const dayHeader = document.createElement("div");
    dayHeader.className = "schedule-day-header";
    dayHeader.textContent = `${dayNames[date.getDay()]} ${date.getDate()}`;
    header.appendChild(dayHeader);
  });

  scheduleGrid.appendChild(header);

  const body = document.createElement("div");
  body.className = "weekly-grid-body";

  const timeColumn = document.createElement("div");
  timeColumn.className = "schedule-time-column";

  const rowCount = state.weeklyEndHour - state.weeklyStartHour;
  for (let hour = state.weeklyStartHour; hour < state.weeklyEndHour; hour += 1) {
    const label = document.createElement("div");
    label.className = "schedule-time-label";
    label.textContent = `${formatHourLabel(hour)} - ${formatHourLabel(hour + 1)}`;
    timeColumn.appendChild(label);
  }

  body.appendChild(timeColumn);

  weekDates.forEach((date) => {
    const dateKey = formatDateForInput(date);
    const dayEvents = selectedEvents
      .filter((event) => event.date === dateKey)
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

    const dayColumn = document.createElement("div");
    dayColumn.className = "schedule-day-column";
    dayColumn.style.setProperty("--row-count", String(rowCount));

    for (let slotIndex = 0; slotIndex < rowCount; slotIndex += 1) {
      const slot = document.createElement("div");
      slot.className = "schedule-cell";
      slot.style.height = "54px";
      dayColumn.appendChild(slot);
    }

    dayEvents.forEach((event) => {
      const startMinutes = timeToMinutes(event.start);
      const endMinutes = timeToMinutes(event.end);
      if (endMinutes <= startMinutes) return;

      const visibleStartMinutes = Math.max(startMinutes, state.weeklyStartHour * 60);
      const visibleEndMinutes = Math.min(endMinutes, state.weeklyEndHour * 60);
      const durationMinutes = Math.max(0, visibleEndMinutes - visibleStartMinutes);
      const startOffset = Math.max(0, (visibleStartMinutes - state.weeklyStartHour * 60) / 60);
      const durationHours = durationMinutes / 60;
      const topPx = startOffset * 54 + 4;
      const heightPx = Math.max(30, durationHours * 54 - 8);

      const block = createEventCard(event);
      block.classList.add("schedule-event-block");
      block.style.top = `${topPx}px`;
      block.style.height = `${heightPx}px`;
      dayColumn.appendChild(block);
    });

    body.appendChild(dayColumn);
  });

  scheduleGrid.appendChild(body);
  schedule.appendChild(scheduleGrid);
  renderWeeklySummary();
}

function render() {
  renderCurrentDateLabel();
  renderMonthSelect();
  renderYearSelect();
  renderPeriodLabel();
  renderCategoryOptions();

  const calendarPanel = document.getElementById("calendar-panel");
  const weeklyPanel = document.getElementById("weekly-panel");
  const todoPanel = document.getElementById("todo-panel");

  if (calendarPanel) {
    calendarPanel.classList.toggle("hidden", state.activeTab !== "calendar");
  }

  if (weeklyPanel) {
    weeklyPanel.classList.toggle("hidden", state.activeTab !== "weekly");
  }

  if (todoPanel) {
    todoPanel.classList.toggle("hidden", state.activeTab !== "todo");
  }

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.activeTab);
  });

  document.querySelectorAll(".view-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });

  const monthCalendar = document.getElementById("month-calendar");
  const weekCalendar = document.getElementById("week-calendar");
  const dayCalendar = document.getElementById("day-calendar");

  if (monthCalendar) monthCalendar.classList.toggle("hidden", state.view !== "month");
  if (weekCalendar) weekCalendar.classList.toggle("hidden", state.view !== "week");
  if (dayCalendar) dayCalendar.classList.toggle("hidden", state.view !== "day");

  renderMonthCalendar();
  renderWeekCalendar();
  renderDayView();
  renderWeeklyPlanner();
  renderTodoList();

  const dateInput = document.getElementById("event-date");
  if (dateInput) {
    dateInput.value = formatDateForInput(state.selectedDate);
  }
}

function bindCalendarControls() {
  document.getElementById("prev-period").addEventListener("click", () => {
    if (state.view === "month") {
      state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() - 1, 1);
    } else if (state.view === "week") {
      const nextDate = new Date(state.weekStart);
      nextDate.setDate(state.weekStart.getDate() - 7);
      state.weekStart = nextDate;
      state.selectedDate = new Date(nextDate);
      state.currentDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
    } else {
      const nextDate = new Date(state.selectedDate);
      nextDate.setDate(nextDate.getDate() - 1);
      state.selectedDate = nextDate;
      state.currentDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
      state.weekStart = getStartOfWeek(nextDate);
    }

    render();
  });

  document.getElementById("next-period").addEventListener("click", () => {
    if (state.view === "month") {
      state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + 1, 1);
    } else if (state.view === "week") {
      const nextDate = new Date(state.weekStart);
      nextDate.setDate(state.weekStart.getDate() + 7);
      state.weekStart = nextDate;
      state.selectedDate = new Date(nextDate);
      state.currentDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
    } else {
      const nextDate = new Date(state.selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      state.selectedDate = nextDate;
      state.currentDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
      state.weekStart = getStartOfWeek(nextDate);
    }

    render();
  });

  document.getElementById("month-select").addEventListener("change", (event) => {
    const month = Number(event.target.value);
    state.currentDate = new Date(state.currentDate.getFullYear(), month, 1);
    render();
  });

  document.getElementById("year-select").addEventListener("change", (event) => {
    const year = Number(event.target.value);
    state.currentDate = new Date(year, state.currentDate.getMonth(), 1);
    render();
  });

  document.querySelectorAll(".view-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      render();
    });
  });
}

function bindTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      render();
    });
  });
}

function resetForm() {
  const form = document.getElementById("event-form");
  if (!form) return;

  form.reset();
  document.getElementById("event-form-title").textContent = "Add Event";
  document.getElementById("event-category").value = "class";
  document.getElementById("event-color").value = "#3b82f6";
  document.getElementById("custom-category").value = "";
  document.getElementById("cancel-edit").classList.add("hidden");
  state.editingEventId = null;
  const submitButton = form.querySelector(".primary-button");
  if (submitButton) submitButton.textContent = "Add Event";
}

function startEditEvent(eventId) {
  const event = state.events.find((entry) => entry.id === eventId);
  if (!event) return;

  state.editingEventId = eventId;

  document.getElementById("event-form-title").textContent = "Edit Event";
  document.getElementById("event-title").value = event.title;
  document.getElementById("event-date").value = event.date;
  document.getElementById("event-start").value = event.start;
  document.getElementById("event-end").value = event.end;
  document.getElementById("event-color").value = event.color || getCategoryColor(event.category);

  const categorySelect = document.getElementById("event-category");
  const categoryExists = Array.from(categorySelect.options).some((option) => option.value === event.category);
  if (categoryExists) {
    categorySelect.value = event.category;
  } else {
    categorySelect.value = "class";
    document.getElementById("custom-category").value = event.category;
  }

  document.getElementById("cancel-edit").classList.remove("hidden");
  const submitButton = document.querySelector("#event-form .primary-button");
  if (submitButton) submitButton.textContent = "Save Changes";
}

function deleteEvent(eventId) {
  state.events = state.events.filter((event) => event.id !== eventId);
  saveEvents();

  if (state.editingEventId === eventId) {
    resetForm();
  }

  render();
}

function bindEventForm() {
  const form = document.getElementById("event-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.getElementById("event-title").value.trim();
    const customCategoryValue = document.getElementById("custom-category").value.trim();
    const categorySelect = document.getElementById("event-category");
    const category = customCategoryValue || categorySelect.value;
    const date = document.getElementById("event-date").value;
    const start = document.getElementById("event-start").value;
    const end = document.getElementById("event-end").value;
    const color = document.getElementById("event-color").value || getCategoryColor(category);

    if (!title || !date || !start || !end) {
      alert("Please complete the title, day, start, and end fields.");
      return;
    }

    if (start >= end) {
      alert("End time must be later than start time.");
      return;
    }

    if (customCategoryValue) {
      const exists = state.categories.some((item) => item.value === customCategoryValue.toLowerCase().replace(/\s+/g, "-"));
      if (!exists) {
        const slug = customCategoryValue.toLowerCase().replace(/\s+/g, "-");
        state.categories.push({ value: slug, label: customCategoryValue });
        saveCategories();
      }
    }

    const eventData = {
      id: state.editingEventId || Date.now(),
      title,
      category: customCategoryValue ? customCategoryValue.toLowerCase().replace(/\s+/g, "-") : category,
      date,
      start,
      end,
      color
    };

    if (state.editingEventId) {
      state.events = state.events.map((event) => (event.id === state.editingEventId ? eventData : event));
    } else {
      state.events.push(eventData);
    }

    saveEvents();
    resetForm();
    setSelectedDate(new Date(`${date}T00:00:00`));
    render();
  });

  document.getElementById("cancel-edit").addEventListener("click", () => {
    resetForm();
  });
}

function bindWeekPicker() {
  const picker = document.getElementById("week-picker");
  if (!picker) return;

  picker.addEventListener("change", (event) => {
    const selectedDate = new Date(`${event.target.value}T00:00:00`);
    state.weekStart = getStartOfWeek(selectedDate);
    state.selectedDate = selectedDate;
    render();
  });

  const startSelect = document.getElementById("weekly-start-hour");
  const endSelect = document.getElementById("weekly-end-hour");

  if (startSelect) {
    startSelect.addEventListener("change", (event) => {
      const nextStart = Number(event.target.value);
      const currentEnd = Number(endSelect?.value || state.weeklyEndHour);
      state.weeklyStartHour = nextStart;

      if (nextStart >= currentEnd) {
        state.weeklyEndHour = Math.min(23, nextStart + 1);
        if (endSelect) endSelect.value = String(state.weeklyEndHour);
      }

      renderWeeklyPlanner();
    });
  }

  if (endSelect) {
    endSelect.addEventListener("change", (event) => {
      const nextEnd = Number(event.target.value);
      const currentStart = Number(startSelect?.value || state.weeklyStartHour);
      state.weeklyEndHour = nextEnd;

      if (nextEnd <= currentStart) {
        state.weeklyStartHour = Math.max(0, nextEnd - 1);
        if (startSelect) startSelect.value = String(state.weeklyStartHour);
      }

      renderWeeklyPlanner();
    });
  }
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatHourLabel(hour) {
  const normalizedHour = ((hour % 24) + 24) % 24;
  const suffix = normalizedHour >= 12 ? "PM" : "AM";
  const displayHour = normalizedHour % 12 || 12;
  return `${displayHour}:00 ${suffix}`;
}

function timeToMinutes(timeString) {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function getTodoDateBounds() {
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  const maxDate = addDays(minDate, 7);

  return {
    min: formatDateKey(minDate),
    max: formatDateKey(maxDate)
  };
}

function applyTodoDateBounds() {
  const bounds = getTodoDateBounds();
  const minDate = new Date(`${bounds.min}T00:00:00`);
  const maxDate = new Date(`${bounds.max}T00:00:00`);

  if (state.todoSelectedDate < minDate) {
    state.todoSelectedDate = new Date(minDate);
  }

  if (state.todoSelectedDate > maxDate) {
    state.todoSelectedDate = new Date(maxDate);
  }

  const displayInput = document.getElementById("todo-date-picker");
  if (displayInput) {
    displayInput.min = bounds.min;
    displayInput.max = bounds.max;
  }

  const dueInput = document.getElementById("todo-date");
  if (dueInput) {
    dueInput.min = bounds.min;
    const typeSelect = document.getElementById("todo-type");
    const isAssignment = typeSelect && typeSelect.value === "assignment";
    if (isAssignment) {
      dueInput.removeAttribute("max");
    } else {
      dueInput.max = bounds.max;
    }
  }
}

function loadTodos() {
  const saved = localStorage.getItem("student-planner-todos-v1");
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load todos.", error);
    return [];
  }
}

function loadCompletedTodos() {
  const saved = localStorage.getItem("student-planner-completed-v1");
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load completed todos.", error);
    return [];
  }
}

function saveTodos() {
  localStorage.setItem("student-planner-todos-v1", JSON.stringify(state.todos));
}

function saveCompletedTodos() {
  localStorage.setItem("student-planner-completed-v1", JSON.stringify(state.completedTodos));
}

function advanceOverdueTodos() {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayKey = formatDateKey(todayStart);
  let changed = false;

  state.todos = state.todos.map((item) => {
    const taskDate = new Date(`${item.date}T00:00:00`);
    if (taskDate < todayStart) {
      changed = true;
      const nextDate = addDays(taskDate, 1);
      return {
        ...item,
        date: formatDateKey(nextDate),
        originalDate: item.originalDate || item.date
      };
    }
    return item;
  });

  if (changed) {
    saveTodos();
  }

  if (state.todoSelectedDate < todayStart) {
    state.todoSelectedDate = new Date(todayStart);
  }

  if (state.todoSelectedDate && formatDateKey(state.todoSelectedDate) < todayKey) {
    state.todoSelectedDate = new Date(todayStart);
  }
}

function getAssignmentReminderDate(dueDate, reminderDays) {
  if (!dueDate) return null;

  const date = new Date(`${dueDate}T00:00:00`);
  date.setDate(date.getDate() - Number(reminderDays || 0));
  return formatDateKey(date);
}

function getTodoDisplayDate(item) {
  if (item.isAssignment) {
    return item.reminderDate || item.date || item.dueDate || item.createdDate;
  }

  return item.date;
}

function getAssignmentDueDate(item) {
  return item.dueDate || item.date || item.createdDate || null;
}

function buildTodoMetaText(item) {
  const dateLabel = new Date(`${item.date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  if (item.isAssignment) {
    const dueDateForDisplay = getAssignmentDueDate(item);
    const dueDateLabel = dueDateForDisplay
      ? new Date(`${dueDateForDisplay}T00:00:00`).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : "No due date";
    const dueText = item.dueTime ? ` at ${new Date(`2000-01-01T${item.dueTime}:00`).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    })}` : "";
    const remainingDays = dueDateForDisplay ? Math.ceil((new Date(`${dueDateForDisplay}T00:00:00`) - new Date()) / 86400000) : null;
    const reminderNote = item.reminderDays > 0 ? ` · Reminder ${item.reminderDays} day${item.reminderDays === 1 ? "" : "s"} before due` : " · Reminder on due date";
    const dueSummary = dueDateForDisplay
      ? `Due ${dueDateLabel}${dueText} · ${remainingDays !== null && remainingDays >= 0 ? `Due in ${remainingDays} day${remainingDays === 1 ? "" : "s"}` : remainingDays !== null ? `${Math.abs(remainingDays)} day${Math.abs(remainingDays) === 1 ? "" : "s"} overdue` : "Due date pending"}${reminderNote}`
      : `No due date set${reminderNote}`;
    return dueSummary;
  }

  return `Due ${dateLabel}`;
}

function toggleAssignmentFields() {
  const todoType = document.getElementById("todo-type");
  const assignmentFields = document.getElementById("assignment-fields");
  const todoDateField = document.getElementById("todo-date-field");
  const isAssignment = todoType && todoType.value === "assignment";

  if (assignmentFields) {
    assignmentFields.classList.toggle("hidden", !isAssignment);
  }

  if (todoDateField) {
    todoDateField.classList.toggle("hidden", isAssignment);
  }

  const dueInput = document.getElementById("todo-date");
  if (dueInput) {
    const bounds = getTodoDateBounds();
    dueInput.min = bounds.min;
    if (isAssignment) {
      dueInput.removeAttribute("max");
    } else {
      dueInput.max = bounds.max;
    }
  }
}

function startEditTodo(todoId) {
  const item = state.todos.find((entry) => entry.id === todoId);
  if (!item) return;

  state.todoEditingId = todoId;
  document.getElementById("todo-form-title").textContent = "Edit To-Do";
  document.getElementById("todo-title").value = item.title;
  document.getElementById("todo-type").value = item.isAssignment ? "assignment" : "task";
  document.getElementById("todo-date").value = item.date;
  document.getElementById("todo-due-date").value = item.dueDate || "";
  document.getElementById("todo-due-time").value = item.dueTime || "";
  document.getElementById("todo-reminder-days").value = item.reminderDays || 3;
  toggleAssignmentFields();
  document.getElementById("todo-cancel-edit").classList.remove("hidden");
  document.querySelector("#todo-form .primary-button").textContent = "Save Item";
}

function resetTodoForm() {
  const form = document.getElementById("todo-form");
  if (!form) return;

  form.reset();
  document.getElementById("todo-form-title").textContent = "Add To-Do";
  document.getElementById("todo-type").value = "task";
  document.getElementById("todo-date").value = formatDateKey(state.todoSelectedDate);
  document.getElementById("todo-reminder-days").value = 3;
  toggleAssignmentFields();
  document.getElementById("todo-cancel-edit").classList.add("hidden");
  state.todoEditingId = null;
  form.querySelector(".primary-button").textContent = "Add Item";
}

function completeTodo(todoId) {
  const item = state.todos.find((entry) => entry.id === todoId);
  if (!item) return;

  state.todos = state.todos.filter((entry) => entry.id !== todoId);
  state.completedTodos.push({
    ...item,
    completedDate: formatDateKey(new Date())
  });

  saveTodos();
  saveCompletedTodos();
  renderTodoList();
}

function deleteTodo(todoId) {
  state.todos = state.todos.filter((item) => item.id !== todoId);
  saveTodos();
  renderTodoList();
}

function renderTodoList() {
  applyTodoDateBounds();

  const todoDateInput = document.getElementById("todo-date-picker");
  const todoDate = document.getElementById("todo-date");
  if (todoDateInput) todoDateInput.value = formatDateKey(state.todoSelectedDate);
  if (todoDate) todoDate.value = formatDateKey(state.todoSelectedDate);

  const list = document.getElementById("todo-list");
  const completedList = document.getElementById("completed-todo-list");
  const activePanel = document.getElementById("todo-active-panel");
  const completedPanel = document.getElementById("todo-completed-panel");
  const listHeading = document.getElementById("todo-list-heading");
  if (!list || !completedList || !activePanel || !completedPanel) return;

  if (listHeading) {
    const headingText = state.todoKind === "tasks"
      ? "Task List"
      : state.todoKind === "assignments"
        ? "Assignment List"
        : "Tasks and Assignments";
    listHeading.textContent = headingText;
  }

  advanceOverdueTodos();

  const today = new Date();
  const todayKey = formatDateKey(today);
  const activeTodos = state.todos
    .filter((item) => {
      const compareDate = getTodoDisplayDate(item);
      const matchesKind = state.todoKind === "all" || (state.todoKind === "tasks" && !item.isAssignment) || (state.todoKind === "assignments" && item.isAssignment);
      const isVisible = compareDate >= todayKey && compareDate <= formatDateKey(addDays(today, 7));
      return matchesKind && isVisible;
    })
    .sort((a, b) => new Date(`${getTodoDisplayDate(a)}T00:00:00`) - new Date(`${getTodoDisplayDate(b)}T00:00:00`));

  const completedTodos = [...state.completedTodos].sort(
    (a, b) => new Date(`${b.completedDate}T00:00:00`) - new Date(`${a.completedDate}T00:00:00`)
  );

  list.innerHTML = "";
  completedList.innerHTML = "";

  const rangeStart = new Date(state.todoSelectedDate);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + (state.todoView === "week" ? 6 : 0));

  if (state.todoTab === "completed") {
    activePanel.classList.add("hidden");
    completedPanel.classList.remove("hidden");

    const groups = new Map();
    completedTodos.forEach((item) => {
      if (!groups.has(item.completedDate)) groups.set(item.completedDate, []);
      groups.get(item.completedDate).push(item);
    });

    if (groups.size === 0) {
      completedList.innerHTML = '<div class="todo-date-group"><p class="empty-week">No completed items yet.</p></div>';
      return;
    }

    [...groups.keys()]
      .sort((a, b) => new Date(b) - new Date(a))
      .forEach((dateKey) => {
        const group = document.createElement("div");
        group.className = "todo-date-group";

        const heading = document.createElement("h3");
        heading.textContent = new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric"
        });

        const items = document.createElement("div");
        items.className = "todo-list";

        groups.get(dateKey).forEach((item) => {
          const row = document.createElement("div");
          row.className = "todo-item";

          const text = document.createElement("div");
          text.className = "todo-item-text";
          text.innerHTML = `
            <span class="todo-item-title">${item.title}</span>
            <span class="todo-item-meta">Completed on ${new Date(`${item.completedDate}T00:00:00`).toLocaleDateString()} · Original due ${new Date(`${item.date}T00:00:00`).toLocaleDateString()}</span>
          `;

          row.appendChild(text);
          items.appendChild(row);
        });

        group.append(heading, items);
        completedList.appendChild(group);
      });
    return;
  }

  activePanel.classList.remove("hidden");
  completedPanel.classList.add("hidden");

  const viewTodos = activeTodos.filter((todo) => {
    const todoDate = new Date(`${getTodoDisplayDate(todo)}T00:00:00`);
    return todoDate >= rangeStart && todoDate <= rangeEnd;
  });

  if (viewTodos.length === 0) {
    list.innerHTML = '<div class="todo-date-group"><p class="empty-week">No tasks for this selection.</p></div>';
    return;
  }

  const groups = new Map();
  viewTodos.forEach((todo) => {
    const displayDate = getTodoDisplayDate(todo);
    if (!groups.has(displayDate)) groups.set(displayDate, []);
    groups.get(displayDate).push(todo);
  });

  [...groups.keys()].sort().forEach((dateKey) => {
    const group = document.createElement("div");
    group.className = "todo-date-group";

    const heading = document.createElement("h3");
    heading.textContent = new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric"
    });

    const items = document.createElement("div");
    items.className = "todo-list";

    groups.get(dateKey).forEach((item) => {
      const row = document.createElement("div");
      const isAssignment = !!item.isAssignment;
      const isDueSoon = isAssignment && item.dueDate && Math.ceil((new Date(`${item.dueDate}T00:00:00`) - new Date()) / 86400000) <= 3;
      row.className = `todo-item${isAssignment ? " assignment-item" : ""}${isDueSoon ? " due-soon" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = false;
      checkbox.addEventListener("change", () => completeTodo(item.id));

      const text = document.createElement("div");
      text.className = "todo-item-text";
      const assignmentBadge = isAssignment ? '<span class="todo-item-badge">Assignment</span>' : "";
      const dueSoonBadge = isAssignment && isDueSoon ? '<span class="todo-item-due-soon">Due soon</span>' : "";
      text.innerHTML = `
        <span class="todo-item-title">${assignmentBadge}${item.title}${dueSoonBadge}</span>
        <span class="todo-item-meta">${buildTodoMetaText(item)}</span>
      `;

      const actions = document.createElement("div");
      actions.className = "todo-item-actions";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "todo-button";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => startEditTodo(item.id));

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "todo-button";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteTodo(item.id));

      actions.append(editButton, deleteButton);
      row.append(checkbox, text, actions);
      items.appendChild(row);
    });

    group.append(heading, items);
    list.appendChild(group);
  });
}

function bindTodoControls() {
  const todoViewSelect = document.getElementById("todo-view-select");
  const todoDatePicker = document.getElementById("todo-date-picker");
  const todoKindSelect = document.getElementById("todo-kind-select");
  const todoType = document.getElementById("todo-type");
  const todoForm = document.getElementById("todo-form");
  const todoCancelEdit = document.getElementById("todo-cancel-edit");

  if (todoType) {
    todoType.addEventListener("change", () => {
      toggleAssignmentFields();
    });
  }

  if (todoKindSelect) {
    todoKindSelect.value = state.todoKind;
    todoKindSelect.addEventListener("change", (event) => {
      state.todoKind = event.target.value;
      renderTodoList();
    });
  }

  if (todoViewSelect) {
    todoViewSelect.value = state.todoView;
    todoViewSelect.addEventListener("change", (event) => {
      state.todoView = event.target.value;
      renderTodoList();
    });
  }

  if (todoDatePicker) {
    applyTodoDateBounds();
    todoDatePicker.value = formatDateKey(state.todoSelectedDate);
    todoDatePicker.addEventListener("change", (event) => {
      const selectedDate = new Date(`${event.target.value}T00:00:00`);
      const bounds = getTodoDateBounds();
      const minDate = new Date(`${bounds.min}T00:00:00`);
      const maxDate = new Date(`${bounds.max}T00:00:00`);

      if (selectedDate < minDate) {
        state.todoSelectedDate = new Date(minDate);
      } else if (selectedDate > maxDate) {
        state.todoSelectedDate = new Date(maxDate);
      } else {
        state.todoSelectedDate = selectedDate;
      }

      document.getElementById("todo-date").value = formatDateKey(state.todoSelectedDate);
      renderTodoList();
    });
  }

  document.querySelectorAll(".todo-subtab").forEach((button) => {
    button.addEventListener("click", () => {
      state.todoTab = button.dataset.todoTab;
      document.querySelectorAll(".todo-subtab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.todoTab === state.todoTab);
      });
      renderTodoList();
    });
  });

  if (todoForm) {
    todoForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const title = document.getElementById("todo-title").value.trim();
      const itemType = document.getElementById("todo-type").value;
      const taskDate = document.getElementById("todo-date").value;
      const dueDate = document.getElementById("todo-due-date").value;
      const dueTime = document.getElementById("todo-due-time").value;
      const reminderDays = Number(document.getElementById("todo-reminder-days").value || 0);
      const isAssignment = itemType === "assignment";
      const entryDate = isAssignment ? dueDate : taskDate;

      if (!title || !entryDate) {
        alert(isAssignment ? "Please add a due date for the assignment." : "Please enter both a task and a date.");
        return;
      }

      const bounds = getTodoDateBounds();
      const today = new Date(`${bounds.min}T00:00:00`);
      const maxDate = new Date(`${bounds.max}T00:00:00`);
      const selectedDate = new Date(`${entryDate}T00:00:00`);

      if (selectedDate < today) {
        alert("The selected date must be today or later.");
        return;
      }

      if (!isAssignment && selectedDate > maxDate) {
        alert("Tasks can only be created for today or up to 7 days in the future.");
        return;
      }

      if (isAssignment) {
        if (!dueDate || !dueTime) {
          alert("Assignments must include both a due date and a due time.");
          return;
        }
      }

      const reminderDate = isAssignment ? getAssignmentReminderDate(dueDate, reminderDays) : null;
      const todoRecord = {
        id: state.todoEditingId || Date.now(),
        title,
        date: isAssignment ? reminderDate || dueDate : entryDate,
        originalDate: null,
        createdDate: isAssignment ? dueDate : entryDate,
        isAssignment,
        dueDate: isAssignment ? dueDate : "",
        dueTime: isAssignment ? dueTime : "",
        reminderDays: isAssignment ? reminderDays : 0,
        reminderDate
      };

      if (state.todoEditingId) {
        state.todos = state.todos.map((item) =>
          item.id === state.todoEditingId
            ? { ...item, ...todoRecord, originalDate: item.originalDate || item.date }
            : item
        );
      } else {
        state.todos.push(todoRecord);
      }

      saveTodos();

      const displayDate = isAssignment && reminderDate ? new Date(`${reminderDate}T00:00:00`) : new Date(`${entryDate}T00:00:00`);
      state.todoSelectedDate = displayDate;

      const picker = document.getElementById("todo-date-picker");
      if (picker) {
        picker.value = formatDateKey(displayDate);
      }

      const dueField = document.getElementById("todo-date");
      if (dueField) {
        dueField.value = formatDateKey(displayDate);
      }

      resetTodoForm();
      renderTodoList();
    });
  }

  if (todoCancelEdit) {
    todoCancelEdit.addEventListener("click", () => {
      resetTodoForm();
    });
  }
}

function init() {
  state.events = loadEvents();
  state.categories = loadCategories();
  state.selectedCategories = new Set(getAllCategories().map((option) => option.value));
  state.todos = loadTodos();
  state.completedTodos = loadCompletedTodos();
  state.todoSelectedDate = new Date();
  setSelectedDate(new Date());
  state.weekStart = getStartOfWeek(new Date());
  renderCurrentDateLabel();
  bindTabs();
  bindCalendarControls();
  bindEventForm();
  bindWeekPicker();
  bindTodoControls();
  render();
}

init();
