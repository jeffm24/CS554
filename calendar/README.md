#CS-554 HW1
##A Calendar
Your assignment this week is to create a simple web application calendar with an express server in an electron shell, following the general designs provided in the attached wireframes.Preview the documentView in a new window

##Functional Requirements
- You must use SASS to write the CSS for your project.
- You must only reference a single CSS file; if you write client side JavaScript, you may only reference a single frontend JS file.
- Your CSS file must be generated in gulp, going from SASS through all the optimizations covered in class.
- Your application must run, even if there is no network request.
- You will use a responsive grid to render the montly view calendar, and any other areas you wish to place in a grid; you must implement your own responsive grid.
- Your app must use media queries to render differently in each size.
- Your app must provide a monthly view of calendar events
- Your app must provide a daily view of calendar events for a particular day
- Your app must provide the ability to add new calendar events to a particular day. When events are added, the calendar must be saved with these new events automatically.
- You must use the Electron API to generate menus with the options in the mocks
- You must allow the user to save or load a file with all their calendar data.
- You must allow the user change the electron window display size between mobile, tablet, and desktop size
- Your calendar must, on application start, load the last calendar that was imported.

##Sizes
- **Mobile Size:** 0px to 400px
- **Tablet Size:** 401px to 1000px
- **Desktop size:** 1001px+

##Other notes
If I have not explicitly stated how a function should behave or appear, you have liberty to implement it as you desire.

##Other Requirements
- You must not submit your node_modules folder
- You must remember to save your dependencies to your package.json folder
- You must do basic error checking in each function
- Check for arguments existing and of proper type.
- Throw if anything is out of bounds (ie, trying to perform an incalculable math operation or accessing data that does not exist)
- If a function should return a promise, instead of throwing you should return a rejected promise.
- You must display an error to tell the user they have entered some sort of invalid state
- You must not have any accessible
