const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

public_users.get('/', function (req, res) {
  const getAllBooks = new Promise((resolve, reject) => {
    if (books) resolve(books);
    else reject("No books found");
  });

  getAllBooks
    .then((data) => res.send(JSON.stringify(data, null, 4)))
    .catch((err) => res.status(500).json({error: err}));
});

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) resolve(books[isbn]);
    else reject("Book not found");
  });

  getBookByISBN
    .then((data) => res.send(JSON.stringify(data, null, 4)))
    .catch((err) => res.status(404).json({message: err}));
});

public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const getBooksByAuthor = await new Promise((resolve) => {
      let result = [];
      Object.keys(books).forEach((isbn) => {
        if (books[isbn].author === author) {
          result.push({
            "isbn": isbn,
            "author": books[isbn].author,
            "title": books[isbn].title,
            "reviews": books[isbn].reviews
          });
        }
      });
      resolve(result);
    });

    res.send(JSON.stringify({booksbyauthor: getBooksByAuthor}, null, 4));
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const getBooksByTitle = await new Promise((resolve) => {
      let result = [];
      Object.keys(books).forEach((isbn) => {
        if (books[isbn].title === title) {
          result.push({
            "isbn": isbn,
            "author": books[isbn].author,
            "title": books[isbn].title,
            "reviews": books[isbn].reviews
          });
        }
      });
      resolve(result);
    });

    res.send(JSON.stringify({booksbytitle: getBooksByTitle}, null, 4));
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
