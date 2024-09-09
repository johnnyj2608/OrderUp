### About The Project
This full-stack web application enables remote food ordering for social adult day cares, allowing kitchen staff to set daily menus and track orders effortlessly. It features self-ordering capabilities with schedule-aware menus managed by the staff.

### Tools and Technologies
- **Backend:** Node.js with Express for handling server-side logic and API requests.
- **Frontend:** Bootstrap, HTML/CSS, and JavaScript for creating a responsive and intuitive user interface.
- **Apps Script:** Utilized for automated triggers to refresh menu options daily.
- **Google Sheets API:** Acts as the database for setting menus, viewing responses, and managing users.
- **Node Cache:** Implements caching to store menu options and reduces redundant API requests.
- **i18n:** Supports localization, making the application accessible to users in multiple languages.

### Getting Started
1. `npm install`
2. `node cache install`
3. `i18n install`
4. `cookie-parser install`
5. Google Sheets API setup (download sheets template [copy link or download + Apps Script], get key from Google Cloud)
6. Populate the menu and member sheets
7. **Currently supporting the following insurance groups with default images:** [List of insurance groups]
8. QR code setup
9. Vercel setup (TBD)

### Desktop Usage (Screenshots)
1. Welcome screen
2. Main screen
3. Insurance / ID
4. Menu screen
5. Success message
6. Sheet update

### Mobile Usage (Screenshots)
1. Main screen
2. Insurance
3. ID (Textbox & Built-In Keypad)
4. Menu screen
5. Success message (no redirect)

### Optimizations
- **API Response Caching:** Initially, the application sent an API request to retrieve the menu every time a user accessed the web application, which slowed down data loading. To reduce the number of calls and increase speed, I implemented a cache that stores the daily menu and periodically expires to account for any changes that may occur in the spreadsheet database.
- **Direct Column Indexing:** Originally, I passed the food name into the API request, searched for the name and its column location, and then appended the name. I realized I could directly pass the column number based on the index of the button on the Express template, allowing for direct appending by column index.
