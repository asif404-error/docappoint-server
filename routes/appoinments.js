app.get("/appointments", verifyJWT, async (req, res) => {
  try {
    const email = req.query.email;

    if (req.user.email !== email) {
      return res.status(403).send({ message: "Forbidden - Access denied" });
    }

    const query = email ? { userEmail: email } : {};
    const appointments = await appointmentsCollection.find(query).toArray();
    res.send(appointments);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch appointments" });
  }
});