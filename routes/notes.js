const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// ROUTE 1: Get All The Notes using: GET "/api/notes/fetchallnotes". Login Required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Add A New Note using: POST "/api/notes/addnote". Login Required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters long').isLength({ min: 5 })
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        // If there are errors, return Bad Request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        });
        const savedNote = await note.save();
        res.json(savedNote);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: Update An Existing Note using: PUT "/api/notes/updatenote". Login Required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        // Create a newNote object
        const newNote = {};
        if (title) {
            newNote.title = title;
        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }
        // Find the note to be updated and update it
        let oldNote = await Note.findById(req.params.id);
        if (!oldNote) {
            return res.status(404).send("Not Found");
        }
        // Allow updation only if user owns this note
        if (oldNote.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        oldNote = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json(oldNote);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: Delete An Existing Note using: DELETE "/api/notes/deletenote". Login Required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be deleted and delete it
        let oldNote = await Note.findById(req.params.id);
        if (!oldNote) {
            return res.status(404).send("Not Found");
        }
        // Allow deletion only if user owns this note
        if (oldNote.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        oldNote = await Note.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note has been deleted", note: oldNote });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;