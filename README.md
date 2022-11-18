This is the backend server for the Semester 05 Software Engineering Group Project for a constraint-based-roster-scheduler web application - ***cedar247***

Group members
=============

Vidulanka \
Hasini \
Vinojith 

create a folder named cedar247 open that folder in vs code.
run these commands in the terminal.

      git clone https://github.com/cedar247/cedar247-server.git
      cd cedar247-server
      npm install
  
Then get a copy of .env.example and rename it as .env and set environmental variables. After that run the following command in the command line.

Note: when creating the mongodb database you have to create a user collection and add a Administrator in the following format.
      
      {
        "_id":{"$oid":"633a6d2707dc9bbde560f872"},
        "name":"vinojith",
        "password":"$2b$09$3qpodJVilgrHetxinCXx6eNiQZQXYqI1Q6A1rBFmO.Pem2ZW32KCC",
        "email":"vinojith@gmail.com",
        "type":"Admin",
      }
      
To run the node server run the following command on the terminal.

      npm run dev
