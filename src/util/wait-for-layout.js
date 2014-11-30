/**
 * Some banners report incorrect size so we have to take render time difference.
 *
 * @todo This should be more flexible - consider calculating DOM elements
 *       dimensions (width, height, spacing)
 *
 * @param  {Function} cb
 * @param  {Number} pTimeout
 */
function waitForLayout ( cb, timeout ) {
	setTimeout(cb, timeout || 300);
}

module.exports = waitForLayout;
