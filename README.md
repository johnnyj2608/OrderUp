## About The Project
This full-stack web application enables remote food ordering for social adult day cares, allowing kitchen staff to set daily menus and track orders effortlessly. It features self-ordering capabilities with schedule-aware menus managed by the staff.

## Tools and Technologies
- **Backend:** Node.js with Express for handling server-side logic and API requests.
- **Frontend:** Bootstrap, HTML/CSS, and JavaScript for creating a responsive and intuitive user interface.
- **Apps Script:** Utilized for automated triggers to refresh menu options daily.
- **Google Sheets API:** Acts as the database for setting menus, viewing responses, and managing users.
- **Node Cache:** Implements caching to store menu options and reduces redundant API requests.
- **i18n:** Supports localization, making the application accessible to users in multiple languages.

## Getting Started
### 1. Install Node.js & Dependencies

First, ensure that [Node.js](https://nodejs.org/) is installed. Then, clone this repository and run the following command to install the necessary dependencies:

```bash
npm install express ejs googleapis nodemon node-cache i18n cookie-parser dotenv
```
Dependency Explanation:
- **express**: A minimal and flexible Node.js web application framework that provides robust features for building web applications and APIs.
- **ejs**: A simple templating language that lets you generate HTML markup with plain JavaScript. It's used for rendering dynamic content in the views.
- **googleapis**: The official Node.js client library for Google APIs. In this project, it’s used to interact with the Google Sheets API to fetch and update menu and order data.
- **nodemon**: A tool that helps develop Node.js applications by automatically restarting the server when file changes are detected.
- **node-cache**: A simple in-memory cache for storing frequently accessed data such as menu and order history to reduce the number of calls to Google Sheets.
- **i18n**: A lightweight translation library that provides localization support. It is used to manage multilingual support for the application, allowing users to switch between languages.
- **cookie-parser**: A middleware for parsing cookies attached to client requests. It’s useful for managing sessions and storing user preferences.
- **dotenv:** A module that loads environment variables from a .env file into process.env. It's used to keep sensitive configuration data, such as API keys and credentials, out of the source code.

### 2. Google Sheets API Setup
1. **Create or Select a Project**: Go to the [Google Cloud Console](https://console.cloud.google.com/). Create a new project (or use an existing one).
2. **Enable Google Sheets API**: Go to **API & Services > Library** and enable the Google Sheets API.
3. **Create Service Account**: In the **APIs & Services** section, go to **Credentials** and create a **Service account**.
4. **Download Credentials File**: Download the `credentials.json` file from the console.
5. **Extract Credentials**:
   - Open the `credentials.json` file and locate the `project_id`, `client_email`, and `private_key` fields.
   - Create a `.env` file in the root of your project directory if it does not already exist.
   - Add the following lines to your `.env` file:

     ```env
     GOOGLE_PROJECT_ID=sheets-xxxxxxxxxxxxxx
     GOOGLE_PRIVATE_KEY='{"privateKey":"-----BEGIN PRIVATE KEY.........-----END PRIVATE KEY-----\n"}'
     GOOGLE_CLIENT_EMAIL=conta-sheets-de-servi-o@xxxxxxxxxxxxx.iam.gserviceaccount.com
     ```

     Make sure to replace `GOOGLE_PROJECT_ID`, `GOOGLE_PRIVATE_KEY`, and `GOOGLE_CLIENT_EMAIL` with the actual values from the `credentials.json` file.

### 3. Google Sheets Template Setup
1. **Copy this template**: [Google Sheets Template](https://docs.google.com/spreadsheets/d/1TYBGWSbuEPGPbQNL7F2GUxTE3cEPSdoIcndqdVGYZ8Q/edit?usp=sharing).
2. **Share the Sheet**: Go to the "Share" button in the top-right corner, and share the sheet with the **service account email** found in your credentials file. Make sure to assign it as an editor.
3. **Insert Data**:
   - In the **Menu** Sheet, insert data for breakfast and lunch, including item names and associated images.
   - In the **Insurance** Sheet, insert member data such as ID, name, and schedule. Rename the sheet to reflect the associated insurance provider.
4. **Create Additional Sheets**: To support multiple insurance providers, create additional sheets for each insurance provider as needed.

**Triggers**: The following triggers have already been set up via Google Apps Script:
 - **Breakfast Sheet**: Daily update for the correct weekday's menu and clears responses.
 - **Lunch Sheet**: Daily update for the correct weekday's menu.
 - **History Sheet**: Daily update to manage space by holding only the most recent 30 days of orders.
 - **Insurance Sheet**: Daily update to reset the "ordered today" column to `False`.
 - **Insurance Sheet**: Weekly update to reset units to the appropriate amount from the schedule.

The project includes default images for the following insurance providers / sheet names:
- Aetna
- Anthem Blue Cross
- Center Light
- Homefirst
- Riverspring
- Senior Whole Health
- Village Care Max

## How To Use
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

## Optimizations
- **Efficient Data Insertion:** To append data to the next available row within a specific column, I needed to call the API to retrieve the column range and identify the open row each time. This approach was inefficient because it required multiple API requests. I optimized this by implementing a solution where the server determines the open rows for each column when it starts up and stores this information locally in a hash map. This hash map is updated with each append request, significantly reducing the need for repeated API calls and improving overall performance.
- **API Response Caching:** Initially, the application sent an API request to retrieve the menu every time a user accessed the web application, which slowed down data loading. To reduce the number of calls and increase speed, I implemented a cache that stores the daily menu and periodically expires to account for any changes that may occur in the spreadsheet database.
- **Direct Column Indexing:** Originally, I passed the food name into the API request, searched for the name and its column location, and then appended the name. I realized I could directly pass the column number based on the index of the button on the Express template, allowing for direct appending by column index.
