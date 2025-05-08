exports.submitForm = (req, res) => {
    const { name, message } = req.body;
    console.log('Form submitted:', name, message);
  
    // Save to DB or perform some action here
    res.redirect('/');
  };
  