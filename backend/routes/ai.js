const express = require("express");
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {

    try {

        const { prompt } = req.body;

        const model = genAI.getGenerativeModel({

            model: "gemini-2.5-flash"

        });

        const result = await model.generateContent(`
Kamu adalah NIAGA AI.

Kamu membantu UMKM hasil laut Aceh.

Tugasmu:

- Membuat nama produk
- Membuat slogan
- Membuat deskripsi produk
- Membuat caption Instagram
- Memberikan ide branding
- Memberikan ide logo
- Memberikan strategi pemasaran

Jawab menggunakan Bahasa Indonesia yang profesional.

Pertanyaan:

${prompt}

        `);

        const text = result.response.text();

        res.json({

            success: true,

            reply: text

        });

    } catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

module.exports = router;