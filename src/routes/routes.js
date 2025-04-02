const router = require('express')();
const credits = require('../services/credits.service');
const savings = require('../services/savings.service');
const invesments = require('../services/invesments.service');
const params = require('../services/params.service');

const prefixCredits = '/credits/';
const prefixSavings = '/savings/';
const prefixInvesments = '/invesments/';

router.post(`${prefixCredits}simulate`, credits.simulate);
router.post(`${prefixSavings}simulate`, savings.simulate);
router.post(`${prefixInvesments}simulate`, invesments.simulate);
router.post('/params', params.get);

module.exports = router;