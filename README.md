# Student Life Dashboard

A browser-based student planner designed to help students organize classes, study time, assignments, and daily tasks in a single dashboard. The app runs entirely in the browser and stores user data locally so that schedules and to-do items persist between visits.

## Overview

The Student Life Dashboard was built because, when I started college, I wanted one place to manage everything I needed to stay organized: my calendar, my weekly schedule, and my to-do list. I could not find an app that combined all three of these tools in one simple system, so I created this app to solve that problem.

This is a single-page web application built with HTML, CSS, and JavaScript. It brings together three main planning features:

- A monthly calendar for tracking events and deadlines
- A weekly schedule view with hourly time slots, event blocks, and time calculations to help students understand how their time is being used
- A to-do list for tasks and assignments with reminders and completion tracking

The purpose of this app is to help students manage their academic life in one place, reduce stress, and make it easier to plan time across classes, assignments, study sessions, and personal responsibilities.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Browser localStorage for data persistence

## How the App Works

### 1. Calendar View
The calendar allows users to:

- view events by month
- click dates to select a day
- add new events with a title, category, date, and time range
- edit or delete existing events
- organize events by category color

Events are displayed in the calendar and can be filtered by category.

### 2. Weekly Schedule View
The weekly planner presents the week in a table-style layout with:

- days of the week across the top
- hourly time slots down the side
- event blocks positioned according to their start and end times
- selectable time windows such as a default 6:00 AM to 10:00 PM range
- summary calculations that track how much time is spent on each event, each day, and across the week

This makes it easy to visualize how a student’s week is structured, manage their time more intentionally, and see how much of the day is actually occupied versus available for study, rest, or other tasks.

### 3. To-Do and Assignment Tracking
The to-do area supports both tasks and assignments:

- Tasks can be created with a title and date
- Assignments can include a due date, due time, and reminder period
- Users can choose how many days before the due date they want to be reminded
- Assignment cards are visually distinct from standard tasks
- Items can be viewed by day or by week range
- Completed tasks can be marked done and separated from active items

This helps students stay on top of both simple responsibilities and important academic deadlines while also helping them track what is complete and what still needs attention.

### 4. Data Persistence
The app saves data in the browser using localStorage. This means:

- events are remembered after refreshing the page
- to-do items remain saved between sessions
- the planner keeps user data without needing a database or server

Because the app stores data locally in the browser, the information is tied to that browser/device rather than a shared online account.

## Key Features

- Responsive dashboard layout
- Monthly calendar with event management
- Weekly planner with time-range filtering
- Event categories and custom color organization
- Tasks and assignment tracking
- Reminder-based assignment scheduling
- Weekly summary metrics for scheduled time, daily totals, and free time
- Persistent data storage using browser localStorage

## How to Run the Project

1. Download or clone this repository.
2. Open the project folder in your computer.
3. Open `index.html` in a browser.
4. The app will load and start working immediately.

No installation, package manager, or backend setup is required because this is a front-end web app.

## Project Structure

- `index.html` — main application structure and UI layout
- `style.css` — dashboard styling, weekly grid layout, event cards, and responsive design
- `script.js` — application logic, rendering, localStorage persistence, calendar behavior, and planner features

## Summary

The Student Life Dashboard is a practical, student-focused planning tool that combines scheduling, time management, and task tracking into one simple web app. It is easy to run, visually organized, and built to help students manage their responsibilities efficiently.

## Screenshots

![Calendar tab showing month](images/Screenshot%202026-09-26%20231141.png)

![Weekly schedule tab](images/Screenshot%202026-09-26%20231201.png)

![To-do list tab active items](images/Screenshot%202026-09-26%20231332.png)

![To-do list tab completed items](images/Screenshot%202026-09-26%20231346.png)
