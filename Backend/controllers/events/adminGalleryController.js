import Event from "../../models/Event.js";
import cloudinary from "../../config/cloudinary.js";
import stream from "stream";

/* ----------------------------------------------------
   GET GALLERY PHOTOS
   Route: GET /api/admin/events/:id/photos
---------------------------------------------------- */
export const getPhotos = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).select("gallery");
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json(event.gallery.reverse()); // Show newest first
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

/* ----------------------------------------------------
   UPLOAD PHOTO
   Route: POST /api/admin/events/:id/photos
---------------------------------------------------- */
export const uploadPhoto = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        if (!req.file) return res.status(400).json({ message: "No image provided" });

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "event_gallery" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result); // Return full result
                }
            );
            stream.Readable.from(req.file.buffer).pipe(uploadStream);
        });

        // Add to Gallery
        event.gallery.push({
            url: result.secure_url,
            public_id: result.public_id, // Save public_id
            caption: req.body.caption || ""
        });

        await event.save();
        res.status(201).json(event.gallery);
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Upload failed" });
    }
};

/* ----------------------------------------------------
   DELETE PHOTO
   Route: DELETE /api/admin/events/:id/photos/:photoId
---------------------------------------------------- */
export const deletePhoto = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // Find the photo
        const photo = event.gallery.find(p => p._id.toString() === req.params.photoId);

        if (photo && photo.public_id) {
            // Delete from Cloudinary
            await cloudinary.uploader.destroy(photo.public_id);
        }

        // Remove from array
        event.gallery = event.gallery.filter(
            (img) => img._id.toString() !== req.params.photoId
        );

        await event.save();
        res.json(event.gallery);
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Delete failed" });
    }
};
