How to Run and Test the Project
1. First, you need to start MongoDB using Docker. Run this command in your terminal:
docker run -d --name mongodb -p 27017:27017 mongo:latest
This will start MongoDB on port 27017.
2. Next, go to the project folder and start the application:
nodemon app.js

3. Once the server is running, open Postman and test the API
