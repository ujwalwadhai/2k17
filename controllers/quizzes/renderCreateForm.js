const renderCreateForm = (req, res) => {
  res.render('pages/quiz/create', { title: 'Create a New Quiz' });
};

module.exports = renderCreateForm;