app.post("/api/contact", async (req, res) => {
    const { name, achternaam, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields"
        });
    }

    const sql = `
        INSERT INTO contact_messages (
            contact_name,
            contact_achternaam,
            contact_email,
            contact_subject,
            contact_message
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, achternaam, email, subject, message],
        async (err) => {
            if (err) {
                console.error("Contact Database Error:", err);
                return res.status(500).json({ success: false, error: "DATABASE ERROR" });
            }

            if (client) {
                try {
                    await client.send({
                        from: {
                            email: "hello@demomailtrap.co",
                            name: "BusConnect Contact"
                        },
                        to: [{ email: process.env.ADMIN_EMAIL }],
                        subject: "New Contact Message",
                        text: `New message from:\n\nName: ${name} ${achternaam}\nEmail: ${email}\n\nMessage:\n${message}`
                    });
                } catch (emailError) {
                    console.error("Admin Email Error:", emailError);
                }
            }

            // Fixed: Returns valid JSON instead of plain text string to prevent frontend JSON parse crashes
            return res.json({ success: true });
        }
    );
});