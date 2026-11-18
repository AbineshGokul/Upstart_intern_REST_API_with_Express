const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// In-memory "database"
let books = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", year: 1988 },
  { id: 2, title: "Wings of Fire", author: "A. P. J. Abdul Kalam", year: 1999 },
];
let nextId = 3;

// Validate a book payload. Returns an error message or null.
function validateBook(body) {
  if (!body || typeof body !== "object") {
    return "Request body must be a JSON object";
  }
  if (typeof body.title !== "string" || body.title.trim() === "") {
    return "'title' is required and must be a non-empty string";
  }
  if (typeof body.author !== "string" || body.author.trim() === "") {
    return "'author' is required and must be a non-empty string";
  }
  if (body.year !== undefined && !Number.isInteger(body.year)) {
    return "'year' must be an integer if provided";
  }
  return null;
}

// GET /books - list all books
app.get("/books", (req, res) => {
  res.status(200).json(books);
});

// GET /books/:id - get one book
app.get("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ error: `Book with id ${req.params.id} not found` });
  }
  res.status(200).json(book);
});

// POST /books - create a book
app.post("/books", (req, res) => {
  const error = validateBook(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const book = {
    id: nextId++,
    title: req.body.title.trim(),
    author: req.body.author.trim(),
    year: req.body.year,
  };
  books.push(book);
  res.status(201).json(book);
});

// PUT /books/:id - replace a book
app.put("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Book with id ${req.params.id} not found` });
  }
  const error = validateBook(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const updated = {
    id,
    title: req.body.title.trim(),
    author: req.body.author.trim(),
    year: req.body.year,
  };
  books[index] = updated;
  res.status(200).json(updated);
});

// DELETE /books/:id - remove a book
app.delete("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Book with id ${req.params.id} not found` });
  }
  const [removed] = books.splice(index, 1);
  res.status(200).json({ message: "Book deleted", book: removed });
});

// Unknown routes -> JSON 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Malformed JSON and other errors -> JSON response
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Books API running at http://localhost:${PORT}`);
});