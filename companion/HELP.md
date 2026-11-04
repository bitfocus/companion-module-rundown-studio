## Rundown Studio

This module uses the Rundown Studio API v1. Learn more about our [API on our documentation](https://rundownstudio.app/docs/).

### Module Config

You will need to enter your API Token. API tokens can be generated from within the Rundown Studio dashboard in the API Section. Only team admins can generate and regenerate these tokens, however anyone on your team can read and use the token.

You will also need the ID of your particular Rundown that you wish to use in this module. You can retrieve this ID by opening a rundown and looking at the URL of the page. For example: `https://app.rundownstudio.app/rundown/<rundown_id>`

If necessary, there is an Advanced Configuration area of the module which allows you to configure the following:

- API Base URL
- Update Interval

Normal operation does not require modification of these values and they should be left alone unless you have been instructed otherwise. The API Base URL serves both the REST endpoints and the live event stream, so pointing it at another environment moves the whole module there.

### Module Actions

The following Actions are available:

- Start rundown
- Pause rundown
- Stop rundown (ends the show; use Reset rundown before starting again)
- Reset rundown (returns to pre-show without starting)
- Go to next cue
- Go to previous cue
- Jump to cue (pick from the rundown's cues, or enter a cue ID; starts the show on that cue when stopped)
- Add/Remove time from active cue
- Output Message: Show
- Output Message: Hide
- Output Message: Toggle visibility
- Output Message: Set (update text, color, bold, underline, and/or visibility)
- Sub-timer: Start, Pause, Start/Pause, Reset (experimental, see below)

### Module Feedbacks

The following Feedbacks are available:

- Rundown State (Running/Paused/Stopped)
- Cue is active
- Sub-timer: State (Running/Paused/Finished/Reset)
- Sub-timer: In overtime
- Sub-timer: X or less seconds remaining
- Visual Progress (used in Presets)

### Module Variables

The following Variables are available:

- Time of Day
- Rundown Name
- Rundown Date
- Rundown Planned Start Time
- Rundown Planned End Time
- Rundown Planned Length
- Rundown Status
- Rundown State
- Current Cue Title
- Current Cue Duration (ms/ss/mmss/hhmmss)
- Current Cue Time Left (ms/ss/mmss/hhmmss)
- Current Cue Time Elapsed (ms/ss/mmss/hhmmss)
- Next Cue Title

Dynamic variables are also created for each public column on the rundown. A column named `AUDIO` becomes `currentcue_audio` and holds the plain-text cell content of the active cue in that column. Column titles are lowercased and non-alphanumeric characters become underscores. If a name would collide with a built-in variable (e.g. a column called `Title`), a numeric suffix is added (`currentcue_title_2`).

Each sub-timer in the rundown also gets its own set of variables, keyed by the sub-timer's ID so they keep working if the timer is renamed or moved: `subtimer_<id>_name`, `subtimer_<id>_cue`, `subtimer_<id>_time` (mm:ss, or h:mm:ss over an hour; `+` in overtime), `subtimer_<id>_ms` and `subtimer_<id>_state`. The sub-timer presets use these, so the easiest way to get them on a button is to drag in a preset.

### Module Presets

The following Presets are available:

- Transport Controls
- Rundown Info (Name, Date, etc.)
- Current Cue/Next Cue Info
- Jump to Cue (one button per cue in the rundown, lit while that cue is active)
- Visual Progress Dots (last 5 seconds)
- Output Message (Show, Hide, Toggle)
- Sub-timers (one Start/Pause button per sub-timer showing its name and live time; the "Sub-timer" bar on top turns green while running, amber when paused, red when finished or in overtime)

### Sub-timers (experimental)

Sub-timers use Rundown Studio's experimental sub-timer API, which may change or be removed without notice. If it does, the sub-timer actions, feedbacks and variables stop updating, but the rest of the module keeps working.

- Sub-timer settings (name, direction, duration, end action) are edited in Rundown Studio. Companion only starts, pauses and resets them.
- The show must have started before sub-timers can be controlled. Before that, Rundown Studio rejects the action and the module logs a warning.
- A countdown that has finished and holds at 00:00 must be reset before it can run again.
- The action dropdowns list every sub-timer in the rundown as `Cue title › Sub-timer name`. You can also type a sub-timer ID, which you can find in the cue's menu in Rundown Studio (API → Sub-timers).

### Upgrading from the v0 API

This version of the module talks to the Rundown Studio API v1. Existing configurations are migrated automatically when the module is upgraded:

- The old Websocket Base URL and Websocket Path settings are removed. Live updates now arrive over a Server-Sent Events stream served on the same host as the rest of the API.
- The API Base URL is moved to the dedicated API host (`https://api-v1.rundownstudio.app`). A custom URL, such as a development environment, is left as you set it.
- Buttons using the `Ended` rundown state are switched to `Stopped`. The v1 API reports a single `stopped` state that covers both pre-show and post-show.
- The Current Cue Subtitle, Next Cue Subtitle and Next Cue Duration variables are removed, along with their presets. The v1 status snapshot does not carry these fields. Buttons referencing them will show an empty value.
