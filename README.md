# CoVac Bot

CoVac Bot is a Nodejs mini project that notifies slack users for an organization on the availability of the covid vaccine in the district


## Getting Started

### Prerequisite

1) Copy the [sheet](https://docs.google.com/spreadsheets/d/1jjb6miCOu2L67aC1sIFu1YlKSeJlYY59zF6zftYO7G8/edit#gid=0) in the google account.
2) Create a service role on google cloud with Google Sheet APIs
3) Download the service file and keep it in a safe place, we need to put it with the code
4) Go to your sheet, click on share and add the service account user, you just created in step 2
5) Clone the project, but the service account JSON file on the root
6) Update CoVac/hello-world/constant.js CREDS object with valid sheet id you get after cloning and slack token to access [web apis](https://api.slack.com/web).
7) Move to hello-world directory by running command cd hello-world 
8) Run npm i --save


### Run

I prefer to set up SAM on VSCode to deploy the code on AWS Lambda [How To](https://codeolives.com/2019/09/19/vs-code-build-debug-and-deploy-aws-lambda-functions-using-visual-studio-code/)


How does it work?

1) The first thing to do is initialize your project state from the sheet you clones, go to sheet 2, and set B2 and D2 cells to TRUE.
2) Making B2 to true, allows the lambda execution to download all the slack users and populate the data in SHEET 1
3) Making D2 to TRUE allows to download all district data and create the mapping for the dropdown in SHEET 1 dropdown. It helps the people in your organization to update the district easily from the sheet
4) You can protect the whole sheet and let only the district column to be available for edit by the employees
5) Run your lambda locally and if everything works fine deploy it on AWS



## License
[MIT](https://choosealicense.com/licenses/mit/)