const team = [
  { first_name: 'Idan', last_name: 'Dahan' },
];

exports.getAbout = (req, res) => {
  try {
    res.json(team);
  } catch (err) {
    res.status(500).json({
      id: 'about-fetch-error',
      message: err.message,
    });
  }
};
