const imageUploadService = require('./services/image_upload_service');
const loginService = require('./services/login_service');

const RsPeer = {
    onImageUpload: imageUploadService.onImageUpload,
	onLogin : loginService.onRouteChange
};

module.exports = RsPeer;