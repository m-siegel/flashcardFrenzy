# Flashcard Frenzy

**Authors:** [Armen Sarkisian](https://github.com/arm2349) and [Ilana-Mahmea Siegel](https://github.com/m-siegel/)

This is a flashcard creation and study website created with MongoDB, Node.js, Express.js, HTML, CSS and Javascript.
Users can register and log in to create and edit their own flashcard decks, check out other users' public decks, which they can add to their library, and study any decks in their library.

We created this site as part of our [Northeastern University CS5610 Web Development](https://johnguerra.co/classes/webDevelopment_fall_2022/) class in fall 2022.

Our **objectives** were

- To become familiar with Node, Express, MongoDB, and general web development practices like sending and responding to HTTP requests.
- To create a flashcard website that we could use to study individually and socially.

W used the following **technologies**:

- _Figma_ – for planning and page mock-ups.
- _HTML_ – for site and page structure.
- _CSS_ – for page styling.
- _Bootstrap_ – for more page styling.
- _JavaScript_ – for front end rendering and routing, and for all the back end code.
- _Express_ - for app structure and routing.
- _Node_ - for the back end environment.
- _Passport_ and _Passport-Local_ - for user authentication.
- _Express-Session_ - for storing persistent data.
- _Bcrypt_ - for hashing and comparing passwords.
- _MongoDB_ - for a database to store user and flashcard data.

Want to know more? See my

## How to use this

At the moment, this site may only be used locally using git clone.

### Using Locally with git clone

1. Clone this repository.
2. Install all the dependencies listed in the package.json file. If you have npm installed, this can be done through 'npm install'
3. To create a database, install mongodb locally and run the local server in the background. It should be set up to run on localhost:27017.
4. In the terminal, navigate to your cloned repository and run the command 'npm start'. This will start the server.
5. In the web browser of your choice, go to [http://localhost:3000/](http://localhost:3000/)
