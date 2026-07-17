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
- Go to next cue
- Go to previous cue
- Add/Remove time from active cue
- Output Message: Show
- Output Message: Hide
- Output Message: Toggle visibility
- Output Message: Set (update text, color, bold, underline, and/or visibility)

### Module Feedbacks

The following Feedbacks are available:

- Rundown State (Running/Paused/Stopped)
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

### Module Presets

The following Presets are available:

- Transport Controls
- Rundown Info (Name, Date, etc.)
- Current Cue/Next Cue Info
- Visual Progress Dots (last 5 seconds)
- Output Message (Show, Hide, Toggle)

### Upgrading from the v0 API

This version of the module talks to the Rundown Studio API v1. Existing configurations are migrated automatically when the module is upgraded:

- The old Websocket Base URL and Websocket Path settings are removed. Live updates now arrive over a Server-Sent Events stream served on the same host as the rest of the API.
- The API Base URL is moved to the dedicated API host (`https://api-v1.rundownstudio.app`). A custom URL, such as a development environment, is left as you set it.
- Buttons using the `Ended` rundown state are switched to `Stopped`. The v1 API reports a single `stopped` state that covers both pre-show and post-show.
- The Current Cue Subtitle, Next Cue Subtitle and Next Cue Duration variables are removed, along with their presets. The v1 status snapshot does not carry these fields. Buttons referencing them will show an empty value.
