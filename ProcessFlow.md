## Reference directories
- Application backend git: https://github.com/reshadirgabiz-del/jastip-backend
- Application frontend git: https://github.com/reshadirgabiz-del/jastip-live.git
- SDK: './../eTalase\ Module/'
- eTalase Builder: master page of this repository
- Database design: './../Jastip Platform/supabase'

## Roles
- User: merchant that wants to create the webpage
- Builder: Claude Code operator that will run Claude Code based on User requests

## Process
(1) User get the store key from Application frontend to provide to Builder.
(2) User fill in the form in eTalase Builder and submit.
(3) Builder take store key and the prompt generated from the form and start claude code to generate the webpage.
(4) Claude code get the store key to get context of the store, links to assets
(5) Based on (4) and the prompt, Claude code build the webpage using SDK to connect the webpage to the Application backend
(6) Generated webpage shared to User for review
(7) User changes text and color before finalizing
(8) User click publish to finalize the design
(9) eTalase Builder/Builder/User upload the finalized design for production.

## YOUR TASK
- Implement the process from eTalase Builder side and prepare Claude code steps
- Write prompt to update:
    - eTalase Builder
    - Application backend (if required)
    - Application frontend (if required)
    - Database migration (if required)
    - SDK (if required)