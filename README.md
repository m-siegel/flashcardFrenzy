# Flashcard Frenzy

**Authors:** [Armen Sarkisian](https://github.com/arm2349) and [Ilana-Mahmea Siegel](https://github.com/m-siegel/)

This is a flashcard creation and study website created with MongoDB, Node.js, Express.js, HTML, CSS and Javascript.
Users can register and log in to create and edit their own flashcard decks, check out other users' public decks, which they can add to their library, and study any decks in their library.

We created this site as part of our [Northeastern University CS5610 Web Development](https://johnguerra.co/classes/webDevelopment_fall_2022/) class in fall 2022.

Our **objectives** were

- To become familiar with Node, Express, MongoDB, and general web development practices like sending and responding to HTTP requests.
- To create a flashcard website that we could use to study individually and socially.

We used the following **technologies**:

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

You can check out our app by visiting the deployed version at this link [https://flashcard-frenzy.onrender.com/](https://flashcard-frenzy.onrender.com/) or by downloading and launching our app locally (see instructions below).

### Using Locally with git clone

1. Clone this repository.
2. Install all the dependencies listed in the package.json file. If you have npm installed, this can be done through 'npm install'
3. To create a database, install mongodb locally and run the local server in the background. It should be set up to run on localhost:27017.
4. In the terminal, navigate to your cloned repository and run the command 'npm start'. This will start the server.
5. In the web browser of your choice, go to [http://localhost:3000/](http://localhost:3000/)

## For a look into our design process, check out
- [Our early visual design documents](https://drive.google.com/file/d/1HmAm91xn3q6zwJUTtpU_qo1F2rrK3mAL/view?usp=sharing)
- [Our brainstorming of the organization of modules, routes and functions](https://drive.google.com/file/d/1pVqPjIFLGXW6LBXxO3TMZGAiOlnAKDpG/view?usp=sharing)

## A Peek into our Site
![Register](https://github.com/m-siegel/flashcardFrenzy/blob/5b0ec28493ac15893fa8e7b411d49e7f54460f42/register.png)
![Login](https://github.com/m-siegel/flashcardFrenzy/blob/5b0ec28493ac15893fa8e7b411d49e7f54460f42/login.png)
![Explore public decks](https://github.com/m-siegel/flashcardFrenzy/blob/ce4669850962c20c295c6a63168d0b963ef51e98/explore.png)
![Study the decks in your library](https://github.com/m-siegel/flashcardFrenzy/blob/5b0ec28493ac15893fa8e7b411d49e7f54460f42/library.png)
![Edit your decks](https://github.com/m-siegel/flashcardFrenzy/blob/5b0ec28493ac15893fa8e7b411d49e7f54460f42/settings.png)
![Study a deck](https://github.com/m-siegel/flashcardFrenzy/blob/5b0ec28493ac15893fa8e7b411d49e7f54460f42/study.png)

## You can find a video presentation about our project at the following link:

[Video Presentation](https://drive.google.com/file/d/1nEKVbl24e2O_HtKEFciURqSwYmDL-5Ai/view?usp=share_link)
