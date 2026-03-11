# TODO

- [x] Use Tailwind CSS Fly-out Menu with Vue.js: <https://freefrontend.com/tailwind-menu/>
- [x] Implament a color picker like: <https://freefrontend.com/javascript-color-palette/>
- [x] Add a theme switcher for the UI like: <https://freefrontend.com/javascript-theme-switches/>
- [x] Add a date picker for the UI possibly using: Datepicker with TailwindCSS and AlpineJS at <https://freefrontend.com/tailwind-calendars/>
- [ ] Use a file uploader for starting from an old resume <https://freefrontend.com/tailwind-file-uploader/>

## Completed Features

### Date Picker

- Implemented in Work and Education editors
- Uses native HTML month input
- Supports "Present" checkbox for current positions
- Clear button to remove dates
- Format: YYYY-MM (default display)

### Color Picker

- Uses react-colorful library
- Professional themes: Corporate Blue, Creative Purple, Minimal Gray, Modern Teal, Warm Amber, Forest Green
- Individual color customization for Primary, Secondary, and Accent colors
- Visual color swatches with hex input

### Theme Switcher

- Dark/Light mode toggle in top-right corner
- Uses next-themes library
- CSS variables for theming
- UI only (resume preview remains white)
- Persists in localStorage
