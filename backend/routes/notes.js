const express = require("express")
const router = express.Router()
const fetchuser = require("../middleware/fetchuser")
const notes = require("../models/notes")
const {body,validationResult}=require("express-validator")
//get all notes using get
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const note = await notes.find({ user: req.user.id })
        res.json(note)
    }
    catch (error) {
        console.error(error.message)
        res.status(400).send("server error")

    }
})


//creating notes using post
router.post("/addnotes",fetchuser, [
    body('title', 'enter valid title').isLength({ min: 4 }),
    body('description', 'enter valid discription').isLength({ min: 4 }),
    body('tag', 'enter valid tag').isLength({ min: 4 }),
], async (req, res) => {
    try {
        const {title, description, tag}=req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error(errors.message)
            return res.status(400).json({ errors: errors.array() });
        }
        const note =new notes({
            title, description, tag, user: req.user.id
        })
        const savednote = await note.save()
        res.json(savednote)
    }
    catch (error) {
        console.error(error.message)
        res.status(407).send("server error")
    }
})

//update existing notes
router.put("/updatenotes/:id",fetchuser,async (req, res) => {
    try {
        const {title, description, tag}=req.body;
        const newNote={};
        if(title){newNote.title=title};
        if(description){newNote.description=description};
        if(tag){newNote.tag=tag};
        //find note to update
        let note=await notes.findById(req.params.id)
        if(!note){res.status(404).send("notfound")}
        if(note.user.toString()!==req.user.id){
            res.status(401).send("notallowed")
        }
         note=await notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
         res.json({note});
    }
    catch (error) {
        console.error(error.message)
        res.status(407).send("server error")
    }
})
//route delete notes
router.delete("/deletenotes/:id",fetchuser,async (req, res) => {
    try {
        // const newNote={};
        // if(title){newNote.title=title};
        // if(description){newNote.description=description};
        // if(tag){newNote.tag=tag};
        //find note to update
        let note=await notes.findById(req.params.id)
        if(!note){res.status(404).send("notfound")}
        if(note.user.toString()!==req.user.id){
            res.status(401).send("notallowed")
        }
         note=await notes.findByIdAndDelete(req.params.id)
         res.json("note deleted");
    }
    catch (error) {
        console.error(error.message)
        res.status(407).send("server error")
    }
})
module.exports = router